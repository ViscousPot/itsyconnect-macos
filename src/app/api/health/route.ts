import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const result = db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .get();

    return NextResponse.json({
      status: "ok",
      setup: result?.count === 0,
    });
  } catch {
    // Table doesn't exist yet – setup is needed
    return NextResponse.json({
      status: "ok",
      setup: true,
    });
  }
}
