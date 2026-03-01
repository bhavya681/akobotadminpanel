/**
 * Server-side admin API client. Uses cookies for auth.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE =
  (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api.akobot.ai").replace(
    /\/$/,
    ""
  );

async function fetchAdmin<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (res.status === 401) {
    redirect("/admin/logout");
  }
  return { ok: res.ok, status: res.status, data };
}

// --- Types (re-export from shared) ---
export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  isActive?: boolean;
  isBanned?: boolean;
  isAdmin?: boolean;
  role?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  username?: string;
  email?: string;
  isActive?: boolean;
  isBanned?: boolean;
}

export interface Token {
  tokenId?: string;
  _id?: string;
  id?: string;
  userId?: string;
  user?: User;
  username?: string;
  email?: string;
  createdAt?: string;
  expiresAt?: string;
  deviceInfo?: { userAgent?: string; ipAddress?: string; lastUsed?: string };
  [key: string]: unknown;
}

export interface TokensResponse {
  tokens?: Token[];
  message?: string;
}

export interface FullInsights {
  summary?: { usersCount?: number; revenueTotal?: number; ordersCount?: number; growth?: Record<string, number> };
  monthlyRevenue?: Array<{ month?: string; revenue?: number; orders?: number }>;
  gatewayBreakdown?: Array<{ gateway?: string; total?: number; orders?: number }>;
  topPackages?: Array<{ name?: string; orderCount?: number; revenue?: number }>;
  activity?: Array<{ type?: string; icon?: string; message?: string; timestamp?: string }>;
  [key: string]: unknown;
}

// --- Users ---
export async function searchUserByEmail(email: string) {
  return fetchAdmin<User | { message?: string }>(
    `/api/admin/users/search?email=${encodeURIComponent(email)}`
  );
}

export async function getUsers(query: UsersQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.username) params.set("username", query.username);
  if (query.email) params.set("email", query.email);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));
  if (query.isBanned !== undefined) params.set("isBanned", String(query.isBanned));
  const qs = params.toString();
  return fetchAdmin<PaginatedUsers>(`/api/admin/users${qs ? `?${qs}` : ""}`);
}

export async function getUserById(id: string) {
  return fetchAdmin<User | { message?: string }>(`/api/admin/users/${id}`);
}

export async function createUser(body: { username: string; email: string; password: string }) {
  return fetchAdmin<User | { message?: string }>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUser(id: string, body: Partial<User>) {
  return fetchAdmin<User | { message?: string }>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUser(id: string) {
  return fetchAdmin<{ message?: string }>(`/api/admin/users/${id}`, { method: "DELETE" });
}

export async function banUser(id: string) {
  return fetchAdmin<{ message?: string }>(`/api/admin/users/${id}/ban`, { method: "PUT" });
}

export async function unbanUser(id: string) {
  return fetchAdmin<{ message?: string }>(`/api/admin/users/${id}/unban`, { method: "PUT" });
}

export async function resetUserPassword(id: string, newPassword: string) {
  return fetchAdmin<{ message?: string }>(`/api/admin/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify({ newPassword }),
  });
}

export async function makeUserAdmin(userId: string) {
  return fetchAdmin<{ message?: string }>(`/api/admin/users/${userId}/make-admin`, {
    method: "POST",
  });
}

// --- Tokens ---
export async function getTokens() {
  return fetchAdmin<TokensResponse | Token[] | { message?: string }>("/api/admin/tokens");
}

export async function revokeToken(tokenId: string) {
  return fetchAdmin<{ message?: string }>(`/api/admin/tokens/${tokenId}`, {
    method: "DELETE",
  });
}

// --- Insights ---
export async function getFullInsights() {
  return fetchAdmin<FullInsights>("/api/admin/insights");
}
