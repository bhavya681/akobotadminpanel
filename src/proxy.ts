import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminLogin = path === "/admin/login";
  const isAuthDone = path === "/admin/auth-done";
  const isAdminRoute = path.startsWith("/admin");
  const isHome = path === "/";
  const adminAuth = request.cookies.get("admin_authenticated")?.value;

  // Authenticated user on home → redirect to dashboard
  if (isHome && adminAuth === "true") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Allow admin login and auth-done (bridge page) - no auth required
  if (isAdminLogin || isAuthDone) {
    return NextResponse.next();
  }

  // Protect other admin routes
  if (isAdminRoute && adminAuth !== "true") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
