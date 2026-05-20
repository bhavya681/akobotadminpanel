"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { getFullInsights } from "@/lib/api/admin-client";

type MonthlyItem = { label?: string; revenue?: number; orders?: number; credits?: number };
type GatewayItem = { gateway?: string; totalRevenue?: number; totalOrders?: number };
type PackageItem = { packageName?: string; totalOrders?: number; totalRevenue?: number };
type ActivityItem = {
  type?: string;
  icon?: string;
  message?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
};
type Summary = {
  usersCount?: number;
  revenueTotal?: number;
  ordersCount?: number;
  growth?: Record<string, number>;
};
type TokenUsageByProvider = { provider?: string; inputTokens?: number; outputTokens?: number; totalTokens?: number };
type TokenUsageByModel = { modelId?: string; inputTokens?: number; outputTokens?: number; totalTokens?: number };
type TopTokenUser = { userId?: string; email?: string; totalTokens?: number };

const COLORS = ["#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    summary?: Summary;
    monthlyRevenue?: MonthlyItem[];
    gatewayBreakdown?: GatewayItem[];
    topPackages?: PackageItem[];
    activity?: ActivityItem[];
    tokenUsage?: {
      byProvider?: TokenUsageByProvider[];
      byModel?: TokenUsageByModel[];
      topUsers?: TopTokenUser[];
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFullInsights().then((res) => {
      if (!res.ok) {
        setError((res.data as { message?: string })?.message ?? "Failed to load insights");
      } else {
        setData(res.data as any);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-[var(--muted)]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-[var(--muted)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-6 text-red-700 dark:text-red-400">
          <p className="font-medium">Unable to load insights</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary ?? null;
  const monthly = Array.isArray(data?.monthlyRevenue) ? data.monthlyRevenue : [];
  const gateways = Array.isArray(data?.gatewayBreakdown) ? data.gatewayBreakdown : [];
  const topPackages = Array.isArray(data?.topPackages) ? data.topPackages : [];
  const activity = Array.isArray(data?.activity) ? data.activity : [];
  const tokenUsageByProvider = Array.isArray(data?.tokenUsage?.byProvider) ? data.tokenUsage.byProvider : [];
  const tokenUsageByModel = Array.isArray(data?.tokenUsage?.byModel) ? data.tokenUsage.byModel : [];
  const topTokenUsers = Array.isArray(data?.tokenUsage?.topUsers) ? data.tokenUsage.topUsers : [];

  const growth = summary?.growth ?? {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Insights
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Business overview, revenue, and platform activity
        </p>
      </header>

      {/* Stats cards */}
      <section className="mb-10">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
          Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Users"
            value={summary?.usersCount ?? 0}
            format="number"
            icon="👥"
            growth={growth.usersCount}
          />
          <StatCard
            label="Revenue"
            value={summary?.revenueTotal ?? 0}
            format="currency"
            icon="💰"
            growth={growth.revenueTotal}
          />
          <StatCard
            label="Orders"
            value={summary?.ordersCount ?? 0}
            format="number"
            icon="📦"
            growth={growth.ordersCount}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
            Monthly Revenue
          </h2>
          {monthly.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              No revenue data yet
            </p>
          )}
        </section>

        {/* Revenue by Gateway */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
            Revenue by Gateway
          </h2>
          {gateways.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gateways}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="totalRevenue"
                    nameKey="gateway"
                  >
                    {gateways.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: any, name: any) => [
                      `₹${Number(value).toFixed(2)}`,
                      String(name).charAt(0).toUpperCase() + String(name).slice(1),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {gateways.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-xs text-[var(--muted-foreground)] capitalize">
                      {g.gateway} · ₹{(g.totalRevenue ?? 0).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              No gateway data yet
            </p>
          )}
        </section>

        {/* Top Packages */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
            Top Packages
          </h2>
          {topPackages.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPackages.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    type="number"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    dataKey="packageName"
                    type="category"
                    width={120}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: any) => [Number(value), "Orders"]}
                  />
                  <Bar dataKey="totalOrders" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              No package data yet
            </p>
          )}
        </section>

        {/* Activity Feed */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
            Recent Activity
          </h2>
          {activity.length > 0 ? (
            <ul className="space-y-0 max-h-80 overflow-y-auto">
              {activity.map((a, i) => (
                <li
                  key={i}
                  className="flex gap-3 py-3 border-b border-[var(--border)] last:border-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-base">
                    {a.icon ?? getActivityIcon(a.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--foreground)]">
                      {a.message ?? a.type ?? "Activity"}
                    </p>
                    {a.timestamp && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {formatDate(a.timestamp)}
                      </p>
                    )}
                  </div>
                  {a.type && (
                    <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
                      {a.type}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
              No recent activity
            </p>
          )}
        </section>
      </div>

      {/* Token Usage Analytics */}
      {(tokenUsageByProvider.length > 0 || tokenUsageByModel.length > 0) && (
        <section className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
            Token Usage Analytics
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* By Provider */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Usage by Provider</h3>
              {tokenUsageByProvider.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tokenUsageByProvider} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <YAxis type="category" dataKey="provider" width={80} tick={{ fill: "var(--foreground)", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--foreground)",
                        }}
                        formatter={(value: any) => [Number(value).toLocaleString("en-IN"), "Tokens"]}
                      />
                      <Bar dataKey="totalTokens" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">No provider data</p>
              )}
            </div>

            {/* By Model */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Usage by Model (Top 10)</h3>
              {tokenUsageByModel.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tokenUsageByModel.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <YAxis type="category" dataKey="modelId" width={120} tick={{ fill: "var(--foreground)", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--foreground)",
                        }}
                        formatter={(value: any) => [Number(value).toLocaleString("en-IN"), "Tokens"]}
                      />
                      <Bar dataKey="totalTokens" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">No model data</p>
              )}
            </div>
          </div>

          {/* Top Token Users */}
          {topTokenUsers.length > 0 && (
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Top Token Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 px-3 text-[var(--muted-foreground)]">User</th>
                      <th className="text-right py-2 px-3 text-[var(--muted-foreground)]">Total Tokens</th>
                      <th className="text-right py-2 px-3 text-[var(--muted-foreground)]">Input</th>
                      <th className="text-right py-2 px-3 text-[var(--muted-foreground)]">Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTokenUsers.map((user, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 px-3 text-[var(--foreground)]">{user.email ?? user.userId}</td>
                        <td className="py-2 px-3 text-right text-[var(--foreground)]">{(user.totalTokens ?? 0).toLocaleString("en-IN")}</td>
                        <td className="py-2 px-3 text-right text-[var(--muted-foreground)]">{(user as any).inputTokens?.toLocaleString("en-IN") ?? "-"}</td>
                        <td className="py-2 px-3 text-right text-[var(--muted-foreground)]">{(user as any).outputTokens?.toLocaleString("en-IN") ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          Manage users
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
        <Link
          href="/admin/wallet"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          Wallet
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
        <Link
          href="/admin/packages"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          Packages
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
        <Link
          href="/admin/models"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          Model registry
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  format,
  icon,
  growth,
}: {
  label: string;
  value: number;
  format: "number" | "currency";
  icon: string;
  growth?: number | null;
}) {
  const formatted =
    format === "currency"
      ? `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : value.toLocaleString("en-US");

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-colors duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {formatted}
          </p>
          {growth !== undefined && growth !== null && (
            <p
              className={`mt-1 text-xs font-medium ${
                growth >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {growth >= 0 ? "+" : ""}
              {growth} this month
            </p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function getActivityIcon(type?: string): string {
  const map: Record<string, string> = {
    new_user: "👤",
    payment: "💰",
    payment_failed: "❌",
    signup_bonus: "🎁",
    promo: "🎫",
    admin_credit: "👑",
    refund: "↩️",
    user_banned: "🚫",
  };
  return map[type ?? ""] ?? "📌";
}

function formatDate(d?: string): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-US");
  } catch {
    return d;
  }
}
