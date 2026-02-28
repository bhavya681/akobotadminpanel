import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  cookieStore.delete("admin_authenticated");
  const baseUrl = request.nextUrl.origin;
  return NextResponse.redirect(new URL("/admin/login", baseUrl));
}
