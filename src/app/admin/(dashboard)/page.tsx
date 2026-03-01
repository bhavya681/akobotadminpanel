import Link from "next/link";
import { getFullInsights } from "@/lib/api/admin-client";

type MonthlyItem = { month?: string; revenue?: number; orders?: number; credits?: number };
type GatewayItem = { gateway?: string; total?: number; orders?: number };
type PackageItem = { name?: string; orderCount?: number; revenue?: number };
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

export default async function AdminDashboardPage() {
  const res = await getFullInsights();
  if (!res.ok) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-6 text-red-700 dark:text-red-400">
          <p className="font-medium">Unable to load insights</p>
          <p className="mt-1 text-sm">
            {(res.data as { message?: string })?.message ?? "Failed to load insights"}
          </p>
        </div>
      </div>
    );
  }

  const d = res.data as {
    summary?: Summary;
    monthlyRevenue?: MonthlyItem[];
    gatewayBreakdown?: GatewayItem[];
    topPackages?: PackageItem[];
    activity?: ActivityItem[];
  };
  const summary = d.summary ?? null;
  const monthly = Array.isArray(d.monthlyRevenue) ? d.monthlyRevenue : [];
  const gateways = Array.isArray(d.gatewayBreakdown) ? d.gatewayBreakdown : [];
  const topPackages = Array.isArray(d.topPackages) ? d.topPackages : [];
  const activity = Array.isArray(d.activity) ? d.activity : [];

  const growth = summary?.growth ?? {};
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue ?? 0), 1);

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
            <div className="space-y-3">
              {monthly.slice(0, 12).map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm text-[var(--muted-foreground)]">
                    {m.month ?? `M${i + 1}`}
                  </span>
                  <div className="flex-1 h-8 bg-[var(--muted)] rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 dark:bg-emerald-600 rounded-lg transition-all duration-500 min-w-[2px]"
                      style={{
                        width: `${Math.max(2, ((m.revenue ?? 0) / maxRevenue) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm font-medium text-[var(--foreground)]">
                    {formatCurrency(m.revenue ?? 0)}
                  </span>
                </div>
              ))}
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
            <div className="space-y-4">
              {gateways.map((g, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium capitalize text-[var(--foreground)]">
                      {g.gateway ?? "Unknown"}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {formatCurrency(g.total ?? 0)} · {g.orders ?? 0} orders
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 dark:bg-violet-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${summary?.revenueTotal ? ((g.total ?? 0) / summary.revenueTotal) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
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
            <div className="space-y-3">
              {topPackages.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-[var(--border)] p-3 transition-colors hover:bg-[var(--muted)]/50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold text-[var(--muted-foreground)]">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">
                      {p.name ?? `Package ${i + 1}`}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {p.orderCount ?? 0} orders · {formatCurrency(p.revenue ?? 0)}
                    </p>
                  </div>
                </div>
              ))}
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
          href="/admin/tokens"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          Active tokens
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
  growth?: number;
}) {
  const displayValue =
    format === "currency" ? formatCurrency(value) : value.toLocaleString();
  const hasGrowth = typeof growth === "number" && growth !== 0;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-colors duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-2xl">
            {icon}
          </span>
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              {label}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {displayValue}
            </p>
          </div>
        </div>
        {hasGrowth && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              growth > 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {growth > 0 ? "+" : ""}
            {growth}%
          </span>
        )}
      </div>
    </div>
  );
}

function getActivityIcon(type?: string): string {
  const map: Record<string, string> = {
    signup: "👤",
    payment: "💳",
    failed_payment: "⚠️",
    bonus: "🎁",
    ban: "🚫",
    order: "📦",
  };
  return map[type ?? ""] ?? "•";
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}
