/**
 * Client-side helpers. Login must hit `/api/admin/login` so httpOnly cookies
 * match server-side admin pages (see admin-client). Other helpers are legacy-ready.
 */

const API_BASE =
  (typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "https://api.Akobot.ai")
    : "https://api.Akobot.ai"
  ).replace(/\/$/, "");

const TOKEN_KEY = "admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

function getHeaders(hasBody: boolean = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(!!options.body), ...(options.headers as Record<string, string>) },
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

// --- Types ---
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

export interface SupportFeedbackItem {
  _id: string;
  userId?: string | null;
  email?: string;
  username?: string;
  message: string;
  origin?: string;
  referer?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface SupportFeedbackPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SupportFeedbackResponse {
  items: SupportFeedbackItem[];
  pagination: SupportFeedbackPagination;
}

export interface SupportFeedbackQuery {
  page?: number;
  limit?: number;
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
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    lastUsed?: string;
  };
  [key: string]: unknown;
}

export interface InsightsSummary {
  usersCount?: number;
  revenueTotal?: number;
  ordersCount?: number;
  growth?: Record<string, number>;
  [key: string]: unknown;
}

export interface MonthlyRevenue {
  month?: string;
  revenue?: number;
  orders?: number;
  credits?: number;
  [key: string]: unknown;
}

export interface GatewayBreakdown {
  gateway?: string;
  total?: number;
  orders?: number;
  [key: string]: unknown;
}

export interface TopPackage {
  name?: string;
  orderCount?: number;
  revenue?: number;
  [key: string]: unknown;
}

export interface ActivityItem {
  type?: string;
  icon?: string;
  message?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FullInsights {
  summary?: InsightsSummary;
  monthlyRevenue?: MonthlyRevenue[];
  gatewayBreakdown?: GatewayBreakdown[];
  topPackages?: TopPackage[];
  activity?: ActivityItem[];
  [key: string]: unknown;
}

// --- Auth ---
/** Sets httpOnly cookies via Next.js; required for /admin server layouts and API. */
export async function login(identifier: string, password: string) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.ok && data?.success === true) {
    return { ok: true as const };
  }
  return {
    ok: false as const,
    error:
      (data?.error as string) ??
      (data?.message as string) ??
      "Invalid credentials",
  };
}

// --- Users ---
export async function searchUserByEmail(email: string) {
  return fetchApi<User | { message?: string }>(
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
  return fetchApi<PaginatedUsers>(`/api/admin/users${qs ? `?${qs}` : ""}`);
}

export async function getUserById(id: string) {
  return fetchApi<User | { message?: string }>(`/api/admin/users/${id}`);
}

// --- Support ---
export async function getSupportFeedback(query: SupportFeedbackQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return fetchApi<SupportFeedbackResponse>(
    `/api/admin/support/feedback${qs ? `?${qs}` : ""}`
  );
}

export async function createUser(body: {
  username: string;
  email: string;
  password: string;
}) {
  return fetchApi<User | { message?: string }>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUser(id: string, body: Partial<User>) {
  return fetchApi<User | { message?: string }>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUser(id: string, options?: { deleteAllAgents?: boolean }) {
  return fetchApi<{ message?: string }>(`/api/admin/users/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ deleteAllAgents: options?.deleteAllAgents ?? false }),
  });
}

export async function transferAgents(sourceUserId: string, targetUserId: string) {
  return fetchApi<{ message?: string; transferredCount?: number }>(`/api/admin/users/${sourceUserId}/transfer-agents`, {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}

export async function getUserAgents(userId: string) {
  return fetchApi<{ agents: { _id: string; name: string; status: string; createdAt: string }[]; count: number }>(`/api/admin/users/${userId}/agents`);
}

export async function banUser(id: string) {
  return fetchApi<{ message?: string }>(`/api/admin/users/${id}/ban`, {
    method: "PUT",
  });
}

export async function unbanUser(id: string) {
  return fetchApi<{ message?: string }>(`/api/admin/users/${id}/unban`, {
    method: "PUT",
  });
}

export async function resetUserPassword(id: string, newPassword: string) {
  return fetchApi<{ message?: string }>(`/api/admin/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify({ newPassword }),
  });
}

export async function makeUserAdmin(userId: string) {
  return fetchApi<{ message?: string }>(
    `/api/admin/users/${userId}/make-admin`,
    { method: "POST" }
  );
}

// --- Tokens ---
export interface TokensResponse {
  tokens?: Token[];
  message?: string;
}

export async function getTokens() {
  return fetchApi<TokensResponse | Token[] | { message?: string }>("/api/admin/tokens");
}

export async function revokeToken(tokenId: string) {
  return fetchApi<{ message?: string }>(`/api/admin/tokens/${tokenId}`, {
    method: "DELETE",
  });
}

// --- Insights ---
export async function getFullInsights() {
  return fetchApi<FullInsights>("/api/admin/insights");
}

export async function getInsightsSummary() {
  return fetchApi<InsightsSummary>("/api/admin/insights/summary");
}

export async function getMonthlyRevenue(months = 12) {
  return fetchApi<MonthlyRevenue[] | { data?: MonthlyRevenue[] }>(
    `/api/admin/insights/revenue/monthly?months=${months}`
  );
}

export async function getGatewayBreakdown() {
  return fetchApi<GatewayBreakdown[]>(
    "/api/admin/insights/revenue/gateways"
  );
}

export async function getTopPackages(limit = 10) {
  return fetchApi<TopPackage[] | { data?: TopPackage[] }>(
    `/api/admin/insights/packages/top?limit=${limit}`
  );
}

export async function getActivityFeed(limit = 10) {
  return fetchApi<ActivityItem[] | { data?: ActivityItem[] }>(
    `/api/admin/insights/activity?limit=${limit}`
  );
}

// --- Package Assignment ---
export interface PackageOption {
  _id: string;
  name: string;
  planType: string;
  includedCredits: number;
  currentPrice: number;
  currency: string;
  rules?: Array<Record<string, unknown>>;
  allowedModelIds?: string[];
  allowedToolNames?: string[];
}

export async function getPackages() {
  return fetchApi<{ packages: PackageOption[] }>("/api/admin/packages");
}

export async function assignPackage(userId: string, packageId: string) {
  return fetchApi<{ message?: string; credits?: number }>(
    `/api/admin/users/${userId}/assign-package`,
    {
      method: "POST",
      body: JSON.stringify({ packageId }),
    }
  );
}

// --- Feedback ---
export async function deleteFeedback(id: string) {
  return fetchApi<{ success?: boolean }>(`/api/admin/support/feedback/${id}`, {
    method: "DELETE",
  });
}

// --- Agents ---
export interface AgentItem {
  _id: string;
  name: string;
  status: string;
  ownerId?: string;
  createdAt?: string;
}

export interface AgentsResponse {
  agents: AgentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function searchAgents(q: string, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  params.set("limit", String(limit));
  return fetchApi<AgentsResponse>(`/api/admin/agents/search?${params.toString()}`);
}

export async function deleteAgent(id: string) {
  return fetchApi<{ success?: boolean }>(`/api/admin/agents/${id}`, {
    method: "DELETE",
  });
}
