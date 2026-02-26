import { NextResponse } from "next/server";
import { sessionOptions, type SessionData } from "@/lib/auth";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { listApps } from "@/lib/asc/apps";
import { hasCredentials } from "@/lib/asc/client";
import { cacheGetMeta } from "@/lib/cache";

export async function GET() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!hasCredentials()) {
    return NextResponse.json({ apps: [], meta: null });
  }

  try {
    const apps = await listApps();
    const meta = cacheGetMeta("apps");

    return NextResponse.json({ apps, meta });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
