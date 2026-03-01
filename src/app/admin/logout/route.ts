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
  return NextResponse.redirect(new URL("/admin/login", getOrigin(request)));
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  return NextResponse.redirect(new URL("/admin/login", getOrigin(request)));
}
