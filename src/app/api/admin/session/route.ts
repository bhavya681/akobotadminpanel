import { NextRequest, NextResponse } from "next/server";

/**
 * Session bridge: sets auth cookies and returns HTML that redirects to /admin.
 * Using 200 + HTML instead of 303 ensures cookies are stored before navigation.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = formData.get("token")?.toString()?.trim();

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=" + encodeURIComponent("Session failed. Please try again."), request.url));
  }

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };

  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/admin"><title>Signing in...</title></head><body>Signing in...</body></html>`;
  const res = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  res.cookies.set("admin_token", token, cookieOpts);
  res.cookies.set("admin_authenticated", "true", cookieOpts);
  return res;
}
