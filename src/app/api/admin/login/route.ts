import { NextRequest, NextResponse } from "next/server";

const API_BASE = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.akobot.ai"
).replace(/\/$/, "");

export async function POST(request: NextRequest) {
  let body: { identifier?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
  const identifier = body.identifier?.toString?.()?.trim?.();
  const password = body.password;

  if (!identifier || !password) {
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

  if (!res.ok || !token || typeof token !== "string" || !token.trim()) {
    return NextResponse.json(
      { success: false, error: (data?.message as string) ?? "Invalid credentials" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
