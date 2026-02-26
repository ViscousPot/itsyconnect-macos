import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users, ascCredentials, aiSettings } from "@/db/schema";
import { sql } from "drizzle-orm";
import { hashPassword, sessionOptions, type SessionData } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";
import { ulid } from "@/lib/ulid";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const setupSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),

  // ASC credentials – optional
  issuerId: z.string().trim().optional(),
  keyId: z.string().trim().optional(),
  privateKey: z.string().optional(),

  // AI settings – optional
  aiProvider: z.string().optional(),
  aiModelId: z.string().optional(),
  aiApiKey: z.string().optional(),
});

export async function POST(request: Request) {
  // Check no users exist
  const count = db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .get();

  if (count && count.count > 0) {
    return NextResponse.json(
      { error: "Setup already completed" },
      { status: 403 },
    );
  }

  // Validate input
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create admin user
  const userId = ulid();
  db.insert(users)
    .values({
      id: userId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: "admin",
    })
    .run();

  // Store ASC credentials if provided
  if (data.issuerId && data.keyId && data.privateKey) {
    const encrypted = encrypt(data.privateKey);
    db.insert(ascCredentials)
      .values({
        id: ulid(),
        issuerId: data.issuerId,
        keyId: data.keyId,
        encryptedPrivateKey: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        encryptedDek: encrypted.encryptedDek,
      })
      .run();
  }

  // Store AI settings if provided
  if (data.aiProvider && data.aiModelId && data.aiApiKey) {
    const encrypted = encrypt(data.aiApiKey);
    db.insert(aiSettings)
      .values({
        id: ulid(),
        provider: data.aiProvider,
        modelId: data.aiModelId,
        encryptedApiKey: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        encryptedDek: encrypted.encryptedDek,
      })
      .run();
  }

  // Create session (auto-login)
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.userId = userId;
  session.role = "admin";
  await session.save();

  return NextResponse.json({ ok: true });
}
