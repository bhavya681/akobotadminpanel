"use client";

import Link from "next/link";
import { useState } from "react";

interface UserDetailViewProps {
  data: {
    user: {
      _id?: string;
      id?: string;
      username: string;
      email: string;
      isActive?: boolean;
      isBanned?: boolean;
      isSystem?: boolean;
      isVerified?: boolean;
      credits?: number;
      hasPurchasedCredits?: boolean;
      oauthProvider?: string;
      createdAt?: string;
      updatedAt?: string;
      lastLogin?: string;
    };
    wallet: {
      balance: number;
      transactions: Array<Record<string, any>>;
    };
    entitlement: {
      id?: string;
      status?: string;
      activatedAt?: string;
      packageSnapshot?: {
        name?: string;
        planType?: string;
        rules?: Array<Record<string, unknown>>;
        allowedModelIds?: string[];
        allowedToolNames?: string[];
      };
    } | null;
    quotaUsage: Record<
      string,
      {
        label?: string;
        limit?: number;
        used?: number;
        remaining?: number;
        window?: string;
        unit?: string;
      }
    >;
  };
}

export function UserDetailView({ data }: UserDetailViewProps) {
  const { user, wallet, entitlement, quotaUsage } = data;
  const [activeTab, setActiveTab] = useState<"overview" | "wallet" | "quota">("overview");

  const formatDate = (d?: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleString();
  };

  const formatCurrency = (n?: number) => {
    if (n === undefined || n === null) return "—";
    return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {user.username}
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">{user.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {user.isBanned && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Banned
            </span>
          )}
          {user.isSystem && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              System
            </span>
          )}
          {user.isVerified && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Verified
            </span>
          )}
          {user.oauthProvider && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
              {user.oauthProvider} OAuth
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6 border-b border-[var(--border)]">
        <nav className="flex gap-6">
          {(["overview", "wallet", "quota"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-[var(--foreground)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Info */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Account Info</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">User ID</dt>
                <dd className="text-sm font-mono text-[var(--foreground)] truncate max-w-[200px]">
                  {user._id || user.id}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Username</dt>
                <dd className="text-sm text-[var(--foreground)]">{user.username}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Email</dt>
                <dd className="text-sm text-[var(--foreground)]">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Credits</dt>
                <dd className="text-sm text-[var(--foreground)]">{user.credits ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Has Purchased</dt>
                <dd className="text-sm text-[var(--foreground)]">
                  {user.hasPurchasedCredits ? "Yes" : "No"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Created</dt>
                <dd className="text-sm text-[var(--foreground)]">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Last Login</dt>
                <dd className="text-sm text-[var(--foreground)]">{formatDate(user.lastLogin)}</dd>
              </div>
            </dl>
          </section>

          {/* Active Entitlement */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Active Plan</h2>
            {entitlement ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted-foreground)]">Plan Name</dt>
                  <dd className="text-sm font-medium text-[var(--foreground)]">
                    {entitlement.packageSnapshot?.name || "Unknown"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted-foreground)]">Plan Type</dt>
                  <dd className="text-sm text-[var(--foreground)] capitalize">
                    {entitlement.packageSnapshot?.planType || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted-foreground)]">Status</dt>
                  <dd className="text-sm">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        entitlement.status === "active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {entitlement.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted-foreground)]">Activated</dt>
                  <dd className="text-sm text-[var(--foreground)]">{formatDate(entitlement.activatedAt)}</dd>
                </div>
                {entitlement.packageSnapshot?.allowedModelIds &&
                  entitlement.packageSnapshot.allowedModelIds.length > 0 && (
                    <div>
                      <dt className="text-sm text-[var(--muted-foreground)] mb-1">Allowed Models</dt>
                      <dd className="flex flex-wrap gap-1">
                        {entitlement.packageSnapshot.allowedModelIds.map((m) => (
                          <span
                            key={m}
                            className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--foreground)]"
                          >
                            {m}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                {entitlement.packageSnapshot?.allowedToolNames &&
                  entitlement.packageSnapshot.allowedToolNames.length > 0 && (
                    <div>
                      <dt className="text-sm text-[var(--muted-foreground)] mb-1">Allowed Tools</dt>
                      <dd className="flex flex-wrap gap-1">
                        {entitlement.packageSnapshot.allowedToolNames.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--foreground)]"
                          >
                            {t}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">No active plan</p>
            )}
          </section>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Current Balance</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{wallet.balance} credits</p>
              </div>
              <div className="rounded-full bg-[var(--muted)] p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[var(--foreground)]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Recent Transactions</h2>
            {wallet.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="pb-2 text-left text-[var(--muted-foreground)] font-medium">Type</th>
                      <th className="pb-2 text-right text-[var(--muted-foreground)] font-medium">Amount</th>
                      <th className="pb-2 text-right text-[var(--muted-foreground)] font-medium">Balance</th>
                      <th className="pb-2 text-left text-[var(--muted-foreground)] font-medium">Remark</th>
                      <th className="pb-2 text-left text-[var(--muted-foreground)] font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {wallet.transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-[var(--muted)]/30 transition-colors">
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              (tx.amount ?? 0) > 0
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 text-right font-medium">
                          <span className={tx.amount && tx.amount > 0 ? "text-emerald-600" : "text-red-600"}>
                            {tx.amount && tx.amount > 0 ? "+" : ""}
                            {tx.amount}
                          </span>
                        </td>
                        <td className="py-3 text-right text-[var(--muted-foreground)]">
                          {tx.balanceAfter}
                        </td>
                        <td className="py-3 text-[var(--foreground)] truncate max-w-[200px]">
                          {tx.remark}
                        </td>
                        <td className="py-3 text-[var(--muted-foreground)] whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] py-8 text-center">No transactions yet</p>
            )}
          </section>
        </div>
      )}

      {activeTab === "quota" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Quota Usage</h2>
            {Object.keys(quotaUsage).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(quotaUsage).map(([key, q]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {q.label || key}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {q.used ?? 0} / {q.limit ?? 0} {q.unit || "requests"} ({q.window || "daily"})
                      </span>
                    </div>
                    <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-emerald-500 dark:bg-emerald-600"
                        style={{
                          width: `${Math.min(100, ((q.limit || 1) > 0 ? ((q.used || 0) / q.limit!) : 0) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {q.remaining ?? 0} remaining · Resets {q.window || "daily"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--muted-foreground)] mb-2">No quota limits</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  This user either has no active quota plan or is on a credits-only plan.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
