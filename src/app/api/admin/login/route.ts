import { NextRequest, NextResponse } from "next/server";

const API_BASE = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.Akobot.ai"
).replace(/\/$/, "");

function getOrigin(request: NextRequest): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return request.headers.get("origin") ?? "http://localhost:3000";
  }
}

export async function POST(request: NextRequest) {
  let identifier: string | undefined;
  let password: string | undefined;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let body: { identifier?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }
    identifier = body.identifier?.toString?.()?.trim?.();
    password = body.password;
  } else {
    const formData = await request.formData();
    identifier = formData.get("identifier")?.toString?.()?.trim?.();
    password = formData.get("password")?.toString?.();
  }

  if (!identifier || !password) {
    const isForm = contentType.includes("form");
    if (isForm) {
      return NextResponse.redirect(
        new URL("/admin/login?error=" + encodeURIComponent("Identifier and password are required"), getOrigin(request))
      );
    }
    return NextResponse.json(
      { success: false, error: "Identifier and password are required" },
      { status: 400 }
    );
  }

  const res = await fetch(`${API_BASE}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const inner = data?.data as Record<string, unknown> | undefined;
  const token = (
    data?.accessToken ??
    data?.access_token ??
    data?.token ??
    inner?.accessToken ??
    inner?.access_token ??
    inner?.token
  ) as string | undefined;
  const refreshToken = (
    data?.refreshToken ??
    data?.refresh_token ??
    inner?.refreshToken ??
    inner?.refresh_token
  ) as string | undefined;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  const isForm = contentType.includes("form");

  if (!res.ok || !token || typeof token !== "string" || !token.trim()) {
    const errorMsg = (data?.message as string) ?? "Invalid credentials";
    if (isForm) {
      return NextResponse.redirect(
        new URL("/admin/login?error=" + encodeURIComponent(errorMsg), getOrigin(request))
      );
    }
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 401 }
    );
  }

  const response = isForm
    ? NextResponse.redirect(new URL("/admin", getOrigin(request)))
    : NextResponse.json({ success: true });

  response.cookies.set("admin_token", token, {
    ...cookieOptions,
    maxAge: 60 * 15, // 15 min - access token
  });
  response.cookies.set("admin_token_refreshed_at", String(Date.now()), {
    ...cookieOptions,
    maxAge: 60 * 15,
  });
  if (refreshToken && typeof refreshToken === "string" && refreshToken.trim()) {
    response.cookies.set("admin_refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days - refresh token
    });
  }
  return response;
}
