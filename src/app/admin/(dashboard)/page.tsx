import Link from "next/link";
import {
  getFullInsights,
  getInsightsSummary,
  getMonthlyRevenue,
  getGatewayBreakdown,
  getTopPackages,
  getActivityFeed,
} from "@/lib/api/admin-client";

export default async function AdminDashboardPage() {
  const [insightsRes, summaryRes, monthlyRes, gatewayRes, topRes, activityRes] =
    await Promise.all([
      getFullInsights(),
      getInsightsSummary(),
      getMonthlyRevenue(12),
      getGatewayBreakdown(),
      getTopPackages(10),
      getActivityFeed(15),
    ]);

  const summary = summaryRes.ok ? summaryRes.data : insightsRes.ok ? (insightsRes.data as { summary?: typeof summaryRes.data })?.summary : null;
  type MonthlyItem = { month?: string; revenue?: number };
  type GatewayItem = { gateway?: string; total?: number; orders?: number };
  type PackageItem = { name?: string; orderCount?: number; revenue?: number };
  type ActivityItem = { type?: string; message?: string; timestamp?: string; icon?: string };

  const monthly: MonthlyItem[] = (monthlyRes.ok
    ? Array.isArray(monthlyRes.data)
      ? monthlyRes.data
      : (monthlyRes.data as { data?: MonthlyItem[] })?.data ?? []
    : insightsRes.ok
      ? (insightsRes.data as { monthlyRevenue?: MonthlyItem[] })?.monthlyRevenue ?? []
    : []) as MonthlyItem[];
  const gateways: GatewayItem[] = (gatewayRes.ok
    ? Array.isArray(gatewayRes.data) ? gatewayRes.data : []
    : insightsRes.ok
      ? (insightsRes.data as { gatewayBreakdown?: GatewayItem[] })?.gatewayBreakdown ?? []
    : []) as GatewayItem[];
  const topPackages: PackageItem[] = (topRes.ok
    ? Array.isArray(topRes.data)
      ? topRes.data
      : (topRes.data as { data?: PackageItem[] })?.data ?? []
    : insightsRes.ok
      ? (insightsRes.data as { topPackages?: PackageItem[] })?.topPackages ?? []
    : []) as PackageItem[];
  const activity: ActivityItem[] = (activityRes.ok
    ? Array.isArray(activityRes.data)
      ? activityRes.data
      : (activityRes.data as { data?: ActivityItem[] })?.data ?? []
    : insightsRes.ok
      ? (insightsRes.data as { activity?: ActivityItem[] })?.activity ?? []
    : []) as ActivityItem[];

  const stats = [
    {
      label: "Total Users",
      value: (summary as { usersCount?: number })?.usersCount ?? 0,
      icon: "👥",
    },
    {
      label: "Revenue",
      value: formatCurrency((summary as { revenueTotal?: number })?.revenueTotal ?? 0),
      icon: "💰",
    },
    {
      label: "Orders",
      value: (summary as { ordersCount?: number })?.ordersCount ?? 0,
      icon: "📦",
    },
  ];

  return (
    <div className="p-8 transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Business insights and platform overview
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
          Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-colors duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            Monthly Revenue
          </h2>
          {monthly.length > 0 ? (
            <div className="space-y-3">
              {monthly.slice(0, 6).map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">{m.month ?? `Month ${i + 1}`}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(m.revenue ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No revenue data yet</p>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            Revenue by Gateway
          </h2>
          {gateways.length > 0 ? (
            <div className="space-y-3">
              {gateways.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-zinc-600 dark:text-zinc-400">{g.gateway ?? "Unknown"}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(g.total ?? 0)} ({g.orders ?? 0} orders)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No gateway data yet</p>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            Top Packages
          </h2>
          {topPackages.length > 0 ? (
            <div className="space-y-3">
              {topPackages.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">{p.name ?? `Package ${i + 1}`}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {p.orderCount ?? 0} orders · {formatCurrency(p.revenue ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No package data yet</p>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            Recent Activity
          </h2>
          {activity.length > 0 ? (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {activity.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                  <span className="shrink-0">{a.icon ?? "•"}</span>
                  <div>
                    <p className="text-zinc-700 dark:text-zinc-300">{a.message ?? a.type ?? "Activity"}</p>
                    {a.timestamp && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{formatDate(a.timestamp)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No recent activity</p>
          )}
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          Manage users →
        </Link>
        <Link
          href="/admin/tokens"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          Active tokens →
        </Link>
      </div>
    </div>
  );
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
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
}
