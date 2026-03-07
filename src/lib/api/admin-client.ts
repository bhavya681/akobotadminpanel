/**
 * Server-side admin API client. Uses cookies for auth.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE =
  (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api.Akobot.ai").replace(
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
    redirect("/api/admin/refresh?redirect=" + encodeURIComponent("/admin"));
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

// --- Model Registry ---
export type ModelCategory =
  | "llm"
  | "image"
  | "video"
  | "image_to_image"
  | "audio"
  | "music";

export interface RegistryModel {
  _id: string;
  modelId: string;
  displayName: string;
  category: ModelCategory;
  provider?: string;
  costPerRequest?: number;
  endpoint?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ModelsByCategory {
  llm?: RegistryModel[];
  image?: RegistryModel[];
  video?: RegistryModel[];
  image_to_image?: RegistryModel[];
  audio?: RegistryModel[];
  music?: RegistryModel[];
}

export interface CreateModelInput {
  modelId: string;
  displayName: string;
  category: ModelCategory;
  provider?: string;
  costPerRequest?: number;
  endpoint?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}

export async function getAdminModels(category?: ModelCategory) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return fetchAdmin<ModelsByCategory>(
    `/api/model-registry/admin/models${qs}`
  );
}

export async function getAdminModelById(id: string) {
  return fetchAdmin<RegistryModel | { message?: string }>(
    `/api/model-registry/admin/models/${id}`
  );
}

export async function createModel(body: CreateModelInput) {
  return fetchAdmin<RegistryModel | { message?: string }>(
    "/api/model-registry/admin/models",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export async function updateModel(id: string, body: Partial<CreateModelInput>) {
  return fetchAdmin<RegistryModel | { message?: string }>(
    `/api/model-registry/admin/models/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

export async function deleteModel(id: string) {
  return fetchAdmin<{ message?: string }>(
    `/api/model-registry/admin/models/${id}`,
    { method: "DELETE" }
  );
}

export async function seedModels(models: CreateModelInput[]) {
  return fetchAdmin<{ created?: number; skipped?: number } | { message?: string }>(
    "/api/model-registry/admin/models/seed",
    {
      method: "POST",
      body: JSON.stringify(models),
    }
  );
}

// --- Gallery (Admin) ---
export type GalleryContentType = "image" | "video" | "image_to_image" | "llm";

export interface GalleryItem {
  _id: string;
  contentType: GalleryContentType;
  url: string;
  thumbnailUrl?: string;
  storageKey?: string;
  prompt?: string;
  modelId?: string;
  isPrivate?: boolean;
  rating?: number;
  userId?: string;
  user?: { username?: string; email?: string; _id?: string };
  createdAt?: string;
  updatedAt?: string;
  fileSize?: number;
  mimeType?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PaginatedGallery {
  items: GalleryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface GalleryQuery {
  contentType?: GalleryContentType;
  minRating?: number;
  modelId?: string;
  isPrivate?: boolean;
  fromDate?: string;
  toDate?: string;
  sortBy?: "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export async function getAdminGallery(query: GalleryQuery = {}) {
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

  const adminRes = await fetchAdmin<PaginatedGallery | { message?: string }>(
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
  return fetchAdmin<PaginatedGallery | { message?: string }>(
    `/api/gallery/public${publicQs ? `?${publicQs}` : ""}`
  );
}

export async function getGalleryItem(id: string) {
  return fetchAdmin<GalleryItem | { message?: string }>(`/api/admin/gallery/${id}`);
}

export async function updateGalleryItem(id: string, body: Partial<GalleryItem>) {
  return fetchAdmin<GalleryItem | { message?: string }>(`/api/admin/gallery/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteGalleryItem(id: string) {
  return fetchAdmin<{ message?: string }>(`/api/admin/gallery/${id}`, {
    method: "DELETE",
  });
}

// --- Packages ---
export interface Package {
  _id: string;
  name: string;
  includedCredits: number;
  actualPrice: number;
  currentPrice: number;
  description?: string;
  offer?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreatePackageInput {
  name: string;
  includedCredits: number;
  actualPrice: number;
  currentPrice: number;
  description?: string;
  offer?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export async function getAdminPackages() {
  return fetchAdmin<Package[] | { message?: string }>("/api/packages/admin/all");
}

export async function getPackageById(id: string) {
  return fetchAdmin<Package | { message?: string }>(`/api/packages/${id}`);
}

export async function createPackage(body: CreatePackageInput) {
  return fetchAdmin<Package | { message?: string }>("/api/packages", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updatePackage(id: string, body: Partial<CreatePackageInput>) {
  return fetchAdmin<Package | { message?: string }>(`/api/packages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deletePackage(id: string) {
  return fetchAdmin<{ message?: string }>(`/api/packages/${id}`, {
    method: "DELETE",
  });
}

// --- Wallet (Admin) ---
export interface WalletActionInput {
  userId: string;
  amount: number;
  action: "credit" | "debit";
  remark?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletTransaction {
  _id?: string;
  userId?: string;
  amount: number;
  type?: string;
  balanceAfter?: number;
  remark?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  [key: string]: unknown;
}

export interface WalletHistoryResponse {
  transactions?: WalletTransaction[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface WalletBalanceResponse {
  balance?: number;
  userId?: string;
  [key: string]: unknown;
}

export async function walletAction(body: WalletActionInput) {
  return fetchAdmin<{ message?: string }>("/api/wallet/admin/action", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getWalletBalance(userId: string) {
  return fetchAdmin<WalletBalanceResponse | { message?: string }>(
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
  return fetchAdmin<WalletHistoryResponse | { message?: string }>(
    `/api/wallet/admin/history/${userId}${qs ? `?${qs}` : ""}`
  );
}
