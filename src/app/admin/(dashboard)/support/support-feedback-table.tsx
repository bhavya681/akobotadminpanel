"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { deleteFeedback } from "@/lib/api/admin-api";
import type { SupportFeedbackItem } from "@/lib/types/admin";

interface SupportFeedbackTableProps {
  items: SupportFeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    limit?: string;
  };
}

function formatDate(dateValue?: string): string {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US");
}

export function SupportFeedbackTable({
  items,
  total,
  page,
  limit,
  totalPages,
  filters,
}: SupportFeedbackTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback entry?")) return;
    setDeletingId(id);
    const { ok } = await deleteFeedback(id);
    if (ok) {
      router.refresh();
    } else {
      alert("Failed to delete feedback");
    }
    setDeletingId(null);
  }, [router]);

  const buildUrl = (updates: Record<string, string | undefined>, resetPage = true) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    });
    if (resetPage) p.set("page", "1");
    return `/admin/support?${p.toString()}`;
  };

  const inputClass =
    "rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <select
          value={filters.limit ?? "20"}
          onChange={(e) => router.push(buildUrl({ ...filters, limit: e.target.value }))}
          className={`${inputClass} w-full sm:w-24`}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        {items.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted-foreground)]">
            No support feedback submissions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">
                    Sender
                  </th>
                  <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">
                    Message
                  </th>
                  <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">
                    Origin
                  </th>
                  <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">
                    IP Address
                  </th>
                  <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">
                    Submitted
                  </th>
                  <th className="px-4 py-4 text-right font-medium text-[var(--muted-foreground)] sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--muted)]/30"
                  >
                    <td className="px-4 py-4 align-top sm:px-6">
                      <div className="font-medium text-[var(--foreground)]">
                        {item.username || "Anonymous"}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">
                        {item.email || "-"}
                      </div>
                      {item.userId && (
                        <div className="text-xs text-[var(--muted-foreground)] mt-1">
                          User ID: {item.userId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top sm:px-6">
                      <div className="max-w-xl whitespace-pre-wrap break-words text-[var(--foreground)]">
                        {item.message}
                      </div>
                      {item.referer && (
                        <div className="mt-2 text-xs text-[var(--muted-foreground)] break-all">
                          Referer: {item.referer}
                        </div>
                      )}
                      {item.userAgent && (
                        <div className="mt-1 text-xs text-[var(--muted-foreground)] break-all">
                          UA: {item.userAgent}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-[var(--muted-foreground)] sm:px-6">
                      {item.origin ? (
                        <span className="break-all">{item.origin}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-[var(--muted-foreground)] sm:px-6">
                      {item.ipAddress || "-"}
                    </td>
                    <td className="px-4 py-4 align-top text-[var(--muted-foreground)] sm:px-6">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-4 align-top text-right sm:px-6">
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      >
                        {deletingId === item._id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(total > 0 || totalPages > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            {total > 0 ? (
              <>Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}</>
            ) : (
              <>No submissions found</>
            )}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Link
                href={page > 1 ? buildUrl({ page: String(page - 1) }, false) : "#"}
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
                href={page < totalPages ? buildUrl({ page: String(page + 1) }, false) : "#"}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  page >= totalPages
                    ? "cursor-not-allowed text-[var(--muted-foreground)] opacity-50 pointer-events-none"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                Next →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
