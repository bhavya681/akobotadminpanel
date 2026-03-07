import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.Akobot.ai"
).replace(/\/$/, "");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function getOrigin(request: NextRequest): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return request.headers.get("origin") ?? "http://localhost:3000";
  }
}

async function doRefresh(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const refreshToken = cookieStore.get("admin_refresh_token")?.value;
  if (!refreshToken?.trim()) return { ok: false as const, redirectToLogin: true };

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken,
      refresh_token: refreshToken,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const inner = data?.data as Record<string, unknown> | undefined;
  const accessToken = (
    data?.accessToken ??
    data?.access_token ??
    data?.token ??
    inner?.accessToken ??
    inner?.access_token ??
    inner?.token
  ) as string | undefined;
  const newRefreshToken = (
    data?.refreshToken ??
    data?.refresh_token ??
    inner?.refreshToken ??
    inner?.refresh_token
  ) as string | undefined;

  if (!res.ok || !accessToken || typeof accessToken !== "string" || !accessToken.trim()) {
    return { ok: false as const, redirectToLogin: true };
  }

  return {
    ok: true as const,
    accessToken,
    newRefreshToken: newRefreshToken && typeof newRefreshToken === "string" && newRefreshToken.trim() ? newRefreshToken : undefined,
  };
}

export async function GET(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get("redirect") || "/admin";
  const cookieStore = await cookies();
  const result = await doRefresh(cookieStore);

  if (!result.ok) {
    const res = NextResponse.redirect(new URL("/admin/login", getOrigin(request)));
    res.cookies.delete("admin_token");
    res.cookies.delete("admin_refresh_token");
    return res;
  }

  const res = NextResponse.redirect(new URL(redirectTo, getOrigin(request)));
  res.cookies.set("admin_token", result.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15,
  });
  res.cookies.set("admin_token_refreshed_at", String(Date.now()), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15,
  });
  if (result.newRefreshToken) {
    res.cookies.set("admin_refresh_token", result.newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return res;
}

export async function POST() {
  const cookieStore = await cookies();
  const result = await doRefresh(cookieStore);

  if (!result.ok) {
    const response = NextResponse.json(
      { success: false, error: "Refresh failed" },
      { status: 401 }
    );
    response.cookies.delete("admin_token");
    response.cookies.delete("admin_refresh_token");
    return response;
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", result.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15,
  });
  response.cookies.set("admin_token_refreshed_at", String(Date.now()), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15,
  });
  if (result.newRefreshToken) {
    response.cookies.set("admin_refresh_token", result.newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}
