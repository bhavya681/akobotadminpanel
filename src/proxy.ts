import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REFRESH_THRESHOLD_SEC = 5 * 60; // Refresh when < 5 min left
const FALLBACK_REFRESH_MIN = 14; // If we can't decode JWT, refresh every 14 min

function getJwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function needsRefresh(
  accessToken: string | undefined,
  refreshedAt: string | undefined
): boolean {
  if (!accessToken) return true;
  const exp = getJwtExp(accessToken);
  if (exp != null) {
    const now = Math.floor(Date.now() / 1000);
    return exp - now < REFRESH_THRESHOLD_SEC;
  }
  if (refreshedAt) {
    const then = parseInt(refreshedAt, 10);
    if (!Number.isNaN(then)) {
      return Date.now() - then > FALLBACK_REFRESH_MIN * 60 * 1000;
    }
  }
  return false;
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin")) return NextResponse.next();
  if (path === "/admin/login" || path === "/admin/logout") return NextResponse.next();
  if (path.startsWith("/api/")) return NextResponse.next();

  const accessToken = request.cookies.get("admin_token")?.value;
  const refreshToken = request.cookies.get("admin_refresh_token")?.value;
  const refreshedAt = request.cookies.get("admin_token_refreshed_at")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!accessToken && refreshToken) {
    return NextResponse.redirect(
      new URL(`/api/admin/refresh?redirect=${encodeURIComponent(path)}`, request.url)
    );
  }

  if (needsRefresh(accessToken, refreshedAt) && refreshToken) {
    return NextResponse.redirect(
      new URL(`/api/admin/refresh?redirect=${encodeURIComponent(path)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
