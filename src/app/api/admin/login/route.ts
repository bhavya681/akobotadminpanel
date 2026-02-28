import { adminLogin } from "@/lib/api/admin-auth";
import { NextRequest, NextResponse } from "next/server";

function jsonResponse(data: object, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let identifier: string | undefined;
  let password: string | undefined;

  let from = "/admin/login";
  if (isJson) {
    const body = await request.json().catch(() => ({}));
    identifier = body.identifier?.toString?.()?.trim?.();
    password = body.password;
  } else {
    const formData = await request.formData();
    identifier = formData.get("identifier")?.toString()?.trim();
    password = formData.get("password")?.toString();
    from = formData.get("from")?.toString() || from;
  }

  if (!identifier || !password) {
    if (isJson) {
      return jsonResponse({ success: false, error: "Identifier and password are required." }, 400);
    }
    const url = new URL(from === "/" ? "/" : "/admin/login", request.url);
    url.searchParams.set("error", encodeURIComponent("Identifier and password are required."));
    return NextResponse.redirect(url);
  }

  const { ok, status, data } = await adminLogin({ identifier, password });

  if (ok && (status === 200 || status === 201)) {
    const d = data as Record<string, unknown>;
    const inner = d?.data as Record<string, unknown> | undefined;
    const token = (
      d?.accessToken ??
      d?.access_token ??
      d?.token ??
      inner?.accessToken ??
      inner?.access_token ??
      inner?.token
    ) as string | undefined;
    if (typeof token === "string" && token.trim()) {
      if (isJson) {
        return jsonResponse({ success: true, token });
      }
      // Redirect to set-session which returns 200 HTML + Set-Cookie (browsers store cookies from 200, not from redirects)
      const setSessionUrl = new URL("/api/admin/set-session", request.url);
      setSessionUrl.searchParams.set("t", token);
      return NextResponse.redirect(setSessionUrl, 302);
    }
  }

  let error = "Login failed. Please try again.";
  if (status === 401) error = "Invalid credentials or insufficient privileges.";
  else if (status === 403) error = "Access forbidden.";
  else if (status === 404) error = "Login endpoint not found (404).";
  else {
    const msg = (data as { message?: string })?.message;
    if (typeof msg === "string") error = msg;
  }

  if (isJson) {
    return jsonResponse({ success: false, error }, 401);
  }
  const url = new URL(from === "/" ? "/" : "/admin/login", request.url);
  url.searchParams.set("error", encodeURIComponent(error));
  return NextResponse.redirect(url);
}
