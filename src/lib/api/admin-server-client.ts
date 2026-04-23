/**
 * Server-side admin API client. Uses cookies for auth.
 * This file uses server-only modules like next/headers and should only be imported
 * in Server Components, Server Actions, or Route Handlers.
 *
 * For client components, use admin-client.ts instead.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE =
  (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api.Akobot.ai").replace(
    /\/$/,
    ""
  );

export async function fetchAdminServer<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const headers: Record<string, string> = {};
  // Only set Content-Type to application/json if there's a body
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (res.status === 401) {
    redirect("/api/admin/refresh?redirect=" + encodeURIComponent("/admin"));
  }
  return { ok: res.ok, status: res.status, data };
}

// --- Re-export types ---
export type {
  User,
  PaginatedUsers,
  UsersQuery,
  SupportFeedbackItem,
  SupportFeedbackPagination,
  SupportFeedbackResponse,
  SupportFeedbackQuery,
  Token,
  TokensResponse,
  FullInsights,
  ModelCategory,
  RegistryModel,
  ModelsByCategory,
  CreateModelInput,
  GalleryContentType,
  GalleryItem,
  PaginatedGallery,
  GalleryQuery,
  Package,
  PackageRule,
  ToolSummary,
  CreatePackageInput,
  WalletActionInput,
  WalletTransaction,
  WalletHistoryResponse,
  WalletBalanceResponse,
  AppConfig,
  CreateConfigInput,
  PackageCurrency,
} from "./admin-client";

// --- Users ---
export async function searchUserByEmail(email: string) {
  return fetchAdminServer(
    `/api/admin/users/search?email=${encodeURIComponent(email)}`
  );
}

export async function getUsers(query: any = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.username) params.set("username", query.username);
  if (query.email) params.set("email", query.email);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));
  if (query.isBanned !== undefined) params.set("isBanned", String(query.isBanned));
  const qs = params.toString();
  return fetchAdminServer(`/api/admin/users${qs ? `?${qs}` : ""}`);
}

export async function getUserById(id: string) {
  return fetchAdminServer(`/api/admin/users/${id}`);
}

export async function getUserFullDetails(id: string) {
  return fetchAdminServer(`/api/admin/users/${id}/full`);
}

// --- Support ---
export async function getSupportFeedback(query: any = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return fetchAdminServer(
    `/api/admin/support/feedback${qs ? `?${qs}` : ""}`
  );
}

export async function createUser(body: { username: string; email: string; password: string }) {
  return fetchAdminServer("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUser(id: string, body: any) {
  return fetchAdminServer(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUser(id: string, options?: { deleteAllAgents?: boolean }) {
  return fetchAdminServer(`/api/admin/users/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ deleteAllAgents: options?.deleteAllAgents ?? false }),
  });
}

export async function transferAgents(sourceUserId: string, targetUserId: string) {
  return fetchAdminServer(`/api/admin/users/${sourceUserId}/transfer-agents`, {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}

export async function getUserAgents(userId: string) {
  return fetchAdminServer(`/api/admin/users/${userId}/agents`);
}

export async function banUser(id: string) {
  return fetchAdminServer(`/api/admin/users/${id}/ban`, { method: "PUT" });
}

export async function unbanUser(id: string) {
  return fetchAdminServer(`/api/admin/users/${id}/unban`, { method: "PUT" });
}

export async function resetUserPassword(id: string, newPassword: string) {
  return fetchAdminServer(`/api/admin/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify({ newPassword }),
  });
}

export async function makeUserAdmin(userId: string) {
  return fetchAdminServer(`/api/admin/users/${userId}/make-admin`, {
    method: "POST",
  });
}

export async function unlinkUserOAuth(email: string, password: string) {
  return fetchAdminServer("/api/admin/users/unlink-oauth", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

// --- Tokens ---
export async function getTokens() {
  return fetchAdminServer("/api/admin/tokens");
}

export async function revokeToken(tokenId: string) {
  return fetchAdminServer(`/api/admin/tokens/${tokenId}`, {
    method: "DELETE",
  });
}

// --- Insights ---
export async function getFullInsights() {
  return fetchAdminServer("/api/admin/insights");
}

// --- Model Registry ---
export async function getAdminModels(category?: string) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return fetchAdminServer(
    `/api/model-registry/admin/models${qs}`
  );
}

export async function getAdminModelById(id: string) {
  return fetchAdminServer(
    `/api/model-registry/admin/models/${id}`
  );
}

export async function createModel(body: any) {
  return fetchAdminServer(
    "/api/model-registry/admin/models",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export async function updateModel(id: string, body: any) {
  return fetchAdminServer(
    `/api/model-registry/admin/models/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

export async function deleteModel(id: string) {
  return fetchAdminServer(
    `/api/model-registry/admin/models/${id}`,
    { method: "DELETE" }
  );
}

export async function seedModels(models: any[]) {
  return fetchAdminServer(
    "/api/model-registry/admin/models/seed",
    {
      method: "POST",
      body: JSON.stringify(models),
    }
  );
}

// --- Gallery (Admin) ---
export async function getAdminGallery(query: any = {}) {
  const params = new URLSearchParams();
  if (query.contentType) params.set("contentType", query.contentType);
  if (query.minRating != null) params.set("minRating", String(query.minRating));
  if (query.modelId) params.set("modelId", query.modelId);
  if (query.isPrivate !== undefined) params.set("isPrivate", String(query.isPrivate));
  if (query.fromDate) params.set("fromDate", query.fromDate);
  if (query.toDate) params.set("toDate", query.toDate);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortOrder) params.set("sortOrder", query.sortOrder);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();

  const adminRes = await fetchAdminServer(
    `/api/admin/gallery${qs ? `?${qs}` : ""}`
  );
  if (adminRes.ok || adminRes.status !== 404) return adminRes;

  const publicParams = new URLSearchParams();
  if (query.contentType) publicParams.set("contentType", query.contentType);
  if (query.minRating != null) publicParams.set("minRating", String(query.minRating));
  if (query.modelId) publicParams.set("modelId", query.modelId);
  if (query.fromDate) publicParams.set("fromDate", query.fromDate);
  if (query.toDate) publicParams.set("toDate", query.toDate);
  if (query.sortBy) publicParams.set("sortBy", query.sortBy);
  if (query.sortOrder) publicParams.set("sortOrder", query.sortOrder);
  if (query.page) publicParams.set("page", String(query.page));
  if (query.limit) publicParams.set("limit", String(query.limit));
  const publicQs = publicParams.toString();
  return fetchAdminServer(
    `/api/gallery/public${publicQs ? `?${publicQs}` : ""}`
  );
}

export async function getGalleryItem(id: string) {
  return fetchAdminServer(`/api/admin/gallery/${id}`);
}

export async function updateGalleryItem(id: string, body: any) {
  return fetchAdminServer(`/api/admin/gallery/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteGalleryItem(id: string) {
  return fetchAdminServer(`/api/admin/gallery/${id}`, {
    method: "DELETE",
  });
}

// --- Packages ---
export async function getToolSummaries() {
  return fetchAdminServer("/v1/tools/summaries");
}

export async function getAdminPackages() {
  return fetchAdminServer("/api/packages/admin/all");
}

export async function getPackageById(id: string) {
  return fetchAdminServer(`/api/packages/${id}`);
}

export async function createPackage(body: any) {
  return fetchAdminServer("/api/packages", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updatePackage(id: string, body: any) {
  return fetchAdminServer(`/api/packages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deletePackage(id: string) {
  return fetchAdminServer(`/api/packages/${id}`, {
    method: "DELETE",
    body: "{}",
  });
}

// --- Wallet (Admin) ---
export async function walletAction(body: any) {
  return fetchAdminServer("/api/wallet/admin/action", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getWalletBalance(userId: string) {
  return fetchAdminServer(
    `/api/wallet/admin/balance/${userId}`
  );
}

export async function getWalletHistory(
  userId: string,
  query?: {
    page?: number;
    limit?: number;
    type?: string;
    fromDate?: string;
    toDate?: string;
    sortOrder?: "asc" | "desc";
  }
) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.type) params.set("type", query.type);
  if (query?.fromDate) params.set("fromDate", query.fromDate);
  if (query?.toDate) params.set("toDate", query.toDate);
  if (query?.sortOrder) params.set("sortOrder", query.sortOrder);
  const qs = params.toString();
  return fetchAdminServer(
    `/api/wallet/admin/history/${userId}${qs ? `?${qs}` : ""}`
  );
}

// --- App configuration (admin API: /api/configs) ---
function normalizeConfigList(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.configs)) return o.configs;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.items)) return o.items;
  }
  return [];
}

export async function getAdminConfigs(category?: string) {
  const qs = category?.trim()
    ? `?category=${encodeURIComponent(category.trim())}`
    : "";
  const res = await fetchAdminServer(
    `/api/configs${qs}`
  );
  if (res.ok && res.data) {
    return {
      ...res,
      data: normalizeConfigList(res.data),
    };
  }
  return { ...res, data: [] };
}

export async function getConfigByKey(key: string) {
  const encoded = encodeURIComponent(key);
  return fetchAdminServer(
    `/api/configs/${encoded}`
  );
}

export async function createConfig(body: any) {
  return fetchAdminServer("/api/configs", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateConfig(key: string, body: any) {
  const encoded = encodeURIComponent(key);
  return fetchAdminServer(`/api/configs/${encoded}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteConfig(key: string) {
  const encoded = encodeURIComponent(key);
  return fetchAdminServer(`/api/configs/${encoded}`, {
    method: "DELETE",
  });
}
