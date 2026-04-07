import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

function getOrigin(request: NextRequest): string {
  if (APP_ORIGIN) return APP_ORIGIN.replace(/\/$/, "");

  const headerOrigin = request.headers.get("origin");
  if (headerOrigin) return headerOrigin.replace(/\/$/, "");

  try {
    return new URL(request.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  cookieStore.delete("admin_refresh_token");
  cookieStore.delete("admin_token_refreshed_at");
  return NextResponse.redirect(new URL("/admin/login", getOrigin(request)));
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  cookieStore.delete("admin_refresh_token");
  cookieStore.delete("admin_token_refreshed_at");
  return NextResponse.redirect(new URL("/admin/login", getOrigin(request)));
}
