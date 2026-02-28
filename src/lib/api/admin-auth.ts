/**
 * Server-side admin authentication API client.
 * All calls to the backend API are made from the server.
 */

const API_BASE_URL =
  process.env.API_URL ??
  process.env.VITE_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://api.akobot.ai";

export interface AdminLoginCredentials {
  identifier: string;
  password: string;
}

export interface AdminLoginSuccess {
  success: true;
  token?: string;
  user?: unknown;
  [key: string]: unknown;
}

export interface AdminLoginError {
  success: false;
  message?: string;
}

export type AdminLoginResponse = AdminLoginSuccess | AdminLoginError;

export async function adminLogin(
  credentials: AdminLoginCredentials
): Promise<{ ok: boolean; status: number; data: AdminLoginResponse }> {
  const base = API_BASE_URL.replace(/\/$/, "");
  const configured = process.env.API_LOGIN_PATH ?? process.env.NEXT_PUBLIC_API_LOGIN_PATH?.trim();
  const paths = configured
    ? [configured.startsWith("/") ? configured : `/${configured}`]
    : [
        "/admin/auth/login",
        "/api/admin/auth/login",
        "/api/auth/login",
        "/api/auth/admin/login",
        "/auth/login",
        "/admin/login",
      ];
  let lastError: Error | null = null;

  for (const path of paths) {
    const url = `${base}${path}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Akeo-AdminPanel/1.0",
        },
        body: JSON.stringify(credentials),
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      const data = (await res.json().catch(() => ({}))) as AdminLoginResponse;

      return {
        ok: res.ok,
        status: res.status,
        data,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  const message = lastError?.message ?? "Request failed";
  const isNetworkError =
    message.includes("fetch") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND") ||
    message.includes("ETIMEDOUT") ||
    message.includes("abort");

  return {
    ok: false,
    status: 0,
    data: {
      success: false,
      message: isNetworkError
        ? "Unable to connect to the server. Check that API_URL (or VITE_API_URL) in .env is correct and the API at api.akobot.ai is reachable."
        : message,
    },
  };
}
