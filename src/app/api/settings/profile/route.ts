import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  sessionOptions,
  type SessionData,
} from "@/lib/auth";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

async function requireAuth() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.userId) return null;
  return session;
}

export async function GET() {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

const updateSchema = z.object({
  name: z.string().min(1).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PUT(request: Request) {
  const session = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const user = db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updates: Record<string, string> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.name) updates.name = data.name;
  if (data.email) updates.email = data.email;

  // Password change requires current password
  if (data.newPassword) {
    if (!data.currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to change password" },
        { status: 400 },
      );
    }

    const valid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    updates.passwordHash = await hashPassword(data.newPassword);
  }

  db.update(users).set(updates).where(eq(users.id, session.userId)).run();

  return NextResponse.json({ ok: true });
}
