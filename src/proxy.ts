import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware - admin auth is now client-side (localStorage).
 * All /admin routes are allowed; AdminAuthProvider handles redirect to login.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
