import { NextResponse } from "next/server";
import { sessionOptions, type SessionData } from "@/lib/auth";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { getSyncStatus } from "@/lib/sync/worker";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ schedules: getSyncStatus() });
}
