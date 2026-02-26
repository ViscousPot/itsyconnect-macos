import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sessionOptions, type SessionData } from "@/lib/auth";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId) {
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
    session.destroy();
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
