import { NextRequest, NextResponse } from "next/server";

const API_BASE = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.akobot.ai"
).replace(/\/$/, "");

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const backendUrl = `${API_BASE}${path}${search}`;

  const headers = new Headers();

  const authHeader = request.headers.get("authorization");
  if (authHeader) headers.set("Authorization", authHeader);

  const adminToken = request.cookies.get("admin_token")?.value;
  if (adminToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${adminToken}`);
  }

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("Cookie", cookie);

  try {
    const res = await fetch(backendUrl, { method: "GET", headers, credentials: "include" });
    const contentType = res.headers.get("content-type") || "application/json";
    const bodyText = await res.text();
    const response = new NextResponse(bodyText, {
      status: res.status,
      statusText: res.statusText,
      headers: { "Content-Type": contentType },
    });
    const setCookie = res.headers.getSetCookie?.();
    if (setCookie) setCookie.forEach((c) => response.headers.append("Set-Cookie", c));
    return response;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy request" }, { status: 502 });
  }
}
