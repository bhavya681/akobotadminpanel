import { NextRequest, NextResponse } from "next/server";

const API_BASE = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.akobot.ai"
).replace(/\/$/, "");

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, "PUT");
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "PATCH");
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "DELETE");
}

export async function OPTIONS(request: NextRequest) {
  return proxyRequest(request, "OPTIONS");
}

async function proxyRequest(request: NextRequest, method: string) {
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const backendUrl = `${API_BASE}${path}${search}`;

  const headers = new Headers();

  // Forward auth header if present
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }

  // Read admin_token cookie and forward as Bearer token
  const adminToken = request.cookies.get("admin_token")?.value;
  if (adminToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${adminToken}`);
  }

  // Forward content-type if present
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  // Forward cookies
  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  let body: BodyInit | undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const contentTypeValue = request.headers.get("content-type") || "";
    if (contentTypeValue.includes("application/json")) {
      try {
        body = JSON.stringify(await request.json());
      } catch {
        body = await request.text();
      }
    } else if (contentTypeValue.includes("multipart/form-data")) {
      body = await request.formData();
    } else if (request.headers.get("content-length") && parseInt(request.headers.get("content-length") || "0") > 0) {
      body = await request.text();
    }
  }

  try {
    const res = await fetch(backendUrl, {
      method,
      headers,
      body,
      credentials: "include",
    });

    const contentType = res.headers.get("content-type") || "application/json";
    const bodyText = await res.text();

    const response = new NextResponse(bodyText, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        "Content-Type": contentType,
      },
    });

    // Forward set-cookie headers
    const setCookie = res.headers.getSetCookie?.();
    if (setCookie) {
      setCookie.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
    }

    return response;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 502 }
    );
  }
}
