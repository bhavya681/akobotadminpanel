import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function getOrigin(request: NextRequest): string {
  return (
    (typeof request.url === "string" ? new URL(request.url).origin : null) ??
    request.headers.get("origin") ??
    "http://localhost:3000"
  );
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
