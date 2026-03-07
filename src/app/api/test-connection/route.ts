import { NextResponse } from "next/server";

const API_BASE =
  process.env.API_URL ??
  process.env.VITE_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.Akobot.ai";

export async function GET() {
  const url = `${API_BASE.replace(/\/$/, "")}/admin/auth/login`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "test", password: "test" }),
    });

    return NextResponse.json({
      ok: true,
      reachable: true,
      url,
      status: res.status,
      env: {
        hasApiUrl: !!process.env.API_URL,
        hasViteApiUrl: !!process.env.VITE_API_URL,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        reachable: false,
        url,
        error: message,
        env: {
          hasApiUrl: !!process.env.API_URL,
          hasViteApiUrl: !!process.env.VITE_API_URL,
        },
      },
      { status: 503 }
    );
  }
}
