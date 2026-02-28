"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminLogin } from "@/lib/api/admin-auth";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const identifier = formData.get("identifier")?.toString()?.trim();
  const password = formData.get("password")?.toString();

  if (!identifier || !password) {
    return { error: "Identifier and password are required." };
  }

  const { ok, status, data } = await adminLogin({ identifier, password });

  if (ok && (status === 200 || status === 201)) {
    const d = data as Record<string, unknown>;
    const token = (d?.accessToken ?? d?.access_token ?? d?.token) as string | undefined;
    if (typeof token === "string" && token) {
      await setAuthAndRedirect(token);
      return null;
    }
  }

  if (status === 401) {
    return { error: "Invalid credentials or insufficient privileges." };
  }
  if (status === 403) {
    return { error: "Access forbidden." };
  }
  if (status === 404) {
    return { error: "Login endpoint not found (404). Set API_LOGIN_PATH in .env to the correct path." };
  }

  const msg = (data as { message?: string }).message;
  return { error: msg ?? "Login failed. Please try again." };
}
export async function setAuthAndRedirect(token: string) {
  const cookieStore = await cookies();
  if (token) {
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }
  cookieStore.set("admin_authenticated", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect("/admin");
}

