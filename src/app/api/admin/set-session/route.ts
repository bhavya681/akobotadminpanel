import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Sets auth cookies from token in URL and returns HTML that redirects to /admin.
 * Token is passed as query param - one-time use, then redirect.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t")?.trim();

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

  const html = `<!DOCTYPE html><html><head><meta http-equiv="Cache-Control" content="no-store"><title>Signing in...</title></head><body><p>Signing in...</p><script>setTimeout(function(){window.location.replace("/admin");},500);</script></body></html>`;
  const res = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
  res.cookies.set("admin_token", token, cookieOpts);
  res.cookies.set("admin_authenticated", "true", cookieOpts);
  return res;
}
