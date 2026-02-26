import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth";
import { validateOrigin } from "@/lib/csrf";

const PUBLIC_PATHS = new Set(["/login", "/setup", "/api/health", "/api/auth"]);

const PUBLIC_PREFIXES = ["/_next", "/favicon", "/api/setup"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF validation on API mutations
  if (
    pathname.startsWith("/api/") &&
    MUTATION_METHODS.has(request.method) &&
    !validateOrigin(request)
  ) {
    return NextResponse.json(
      { error: "Invalid origin" },
      { status: 403 },
    );
  }

  // Skip auth for public paths
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Check if setup is needed (no users yet)
  // This is checked via a lightweight DB query in the health endpoint
  // For now, session check is the main guard
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions,
  );

  if (!session.userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
