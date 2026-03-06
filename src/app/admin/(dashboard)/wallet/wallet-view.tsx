"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WalletTransaction } from "@/lib/api/admin-client";
import { walletActionAction } from "@/app/admin/actions";

const TRANSACTION_TYPES = [
  { value: "", label: "All types" },
  { value: "admin_credit", label: "Admin Credit" },
  { value: "admin_debit", label: "Admin Debit" },
  { value: "topup", label: "Top-up" },
  { value: "service_deduction", label: "Service Deduction" },
  { value: "refund", label: "Refund" },
  { value: "signup_bonus", label: "Signup Bonus" },
  { value: "referral_bonus", label: "Referral Bonus" },
  { value: "promo", label: "Promo" },
];

interface WalletViewProps {
  user: { _id?: string; username?: string; email?: string } | null;
  userId: string | undefined;
  balance: number | null;
  transactions: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    type?: string;
    fromDate?: string;
    toDate?: string;
    sortOrder?: string;
  };
}

export function WalletView({
  user,
  userId,
  balance,
  transactions,
  total,
  page,
  limit,
  totalPages,
  filters,
}: WalletViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const buildUrl = (updates: Record<string, string | undefined>, resetPage = true) => {
    const p = new URLSearchParams();
    if (userId) p.set("userId", userId);
    Object.entries({ ...filters, ...updates }).forEach(([k, v]) => {
      if (v === undefined || v === "") return;
      p.set(k, v);
    });
    if (resetPage) p.set("page", "1");
    return `/admin/wallet?${p.toString()}`;
  };

  const buildPageUrl = (newPage: number) => {
    const p = new URLSearchParams();
    if (userId) p.set("userId", userId);
    Object.entries(filters).forEach(([k, v]) => {
      if (v === undefined || v === "") return;
      p.set(k, v);
    });
    p.set("page", String(newPage));
    return `/admin/wallet?${p.toString()}`;
  };

  const handleWalletAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("userId", userId!);
    setLoading(true);
    try {
      const result = await walletActionAction(formData);
      if (result.ok) {
        setSuccess(true);
        form.reset();
        router.refresh();
      } else {
        setError(result.error ?? "Failed to perform action.");
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20";

  if (!user && !userId) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Search user by email
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Enter a user&apos;s email to view and manage their wallet
          </p>
          <form
            action="/admin/wallet"
            method="GET"
            className="flex flex-wrap gap-3"
          >
            <input
              type="text"
              name="email"
              placeholder="user@example.com"
              required
              className={`${inputClass} w-full min-w-0 sm:w-80`}
            />
            <button
              type="submit"
              className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (user && !userId) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            User found
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            {user.username} ({user.email})
          </p>
          <Link
            href={`/admin/wallet?userId=${user._id}`}
            className="inline-flex rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
          >
            View wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User & Balance */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {user?.username ?? "User"} {user?.email && `(${user.email})`}
          </h2>
          <Link
            href="/admin/wallet"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            ← Search different user
          </Link>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-4 min-w-[180px]">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Balance
          </p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {balance !== null ? balance.toLocaleString() : "—"} credits
          </p>
        </div>
      </div>

      {/* Credit / Debit form */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">
          Credit or Debit
        </h3>
        <form onSubmit={handleWalletAction} className="space-y-4 max-w-md">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Amount
              </label>
              <input
                name="amount"
                type="number"
                required
                min="1"
                placeholder="100"
                className={`${inputClass} w-full`}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Action
              </label>
              <select name="action" required className={`${inputClass} w-full`}>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Remark
            </label>
            <input
              name="remark"
              placeholder="Manual top-up by admin for premium plan"
              className={`${inputClass} w-full`}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Action completed successfully.
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>
      </div>

      {/* Transaction history */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap gap-3 items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--foreground)]">
            Transaction history
          </h3>
          <form className="flex flex-wrap gap-2 items-center">
            <select
              value={filters.type ?? ""}
              onChange={(e) => router.push(buildUrl({ type: e.target.value || undefined }))}
              className={inputClass}
            >
              {TRANSACTION_TYPES.map((t) => (
                <option key={t.value || "all"} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={filters.sortOrder ?? "desc"}
              onChange={(e) => router.push(buildUrl({ sortOrder: e.target.value }))}
              className={inputClass}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </form>
        </div>
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted-foreground)]">
            No transactions yet
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-[var(--muted-foreground)]">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-[var(--muted-foreground)]">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-[var(--muted-foreground)]">
                      Balance after
                    </th>
                    <th className="px-6 py-4 text-left font-medium text-[var(--muted-foreground)]">
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const amt = tx.amount ?? 0;
                    const isCredit = amt > 0;
                    return (
                      <tr
                        key={tx._id ?? tx.createdAt ?? Math.random()}
                        className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30"
                      >
                        <td className="px-4 py-4 text-[var(--muted-foreground)] sm:px-6">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
                            {tx.type ?? "—"}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-4 font-medium sm:px-6 ${
                            isCredit
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {isCredit ? "+" : ""}
                          {amt.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-[var(--muted-foreground)] sm:px-6">
                          {tx.balanceAfter != null
                            ? tx.balanceAfter.toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-4 py-4 text-[var(--muted-foreground)] sm:px-6 max-w-[200px] truncate">
                          {tx.remark ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={page > 1 ? buildPageUrl(page - 1) : "#"}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      page <= 1
                        ? "cursor-not-allowed text-[var(--muted-foreground)] opacity-50 pointer-events-none"
                        : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    ← Previous
                  </Link>
                  <span className="text-sm text-[var(--muted-foreground)] px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Link
                    href={page < totalPages ? buildPageUrl(page + 1) : "#"}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      page >= totalPages
                        ? "cursor-not-allowed text-[var(--muted-foreground)] opacity-50 pointer-events-none"
                        : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    Next →
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
