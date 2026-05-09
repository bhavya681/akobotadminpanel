"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface LogItem {
  id: string;
  userId: string;
  userEmail?: string;
  action: string;
  changedFields: string[];
  newValues?: Record<string, any>;
  performedBy: string;
  source: string;
  createdAt: string;
}

interface LogsTableProps {
  logs: LogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  limitOptions: readonly number[];
}

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  USER_UPDATED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PASSWORD_CHANGED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  OAUTH_LINKED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  BANNED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ACTIVATION_CHANGED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CREDITS_CHANGED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  PROFILE_CHANGED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  USER_DELETED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export function LogsTable({ logs, pagination, limitOptions }: LogsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateLimit = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(newLimit));
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatDate = (d?: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleString("en-US");
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderChangedFields = (fields: string[], newValues?: Record<string, any>) => {
    if (!fields || fields.length === 0) return "—";
    return (
      <div className="flex flex-wrap gap-1">
        {fields.map((field) => {
          const value = newValues?.[field];
          const displayValue =
            value === null || value === undefined
              ? "removed"
              : typeof value === "boolean"
              ? String(value)
              : typeof value === "object"
              ? JSON.stringify(value).slice(0, 40)
              : String(value).slice(0, 40);
          return (
            <span
              key={field}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]"
              title={`${field}: ${displayValue}`}
            >
              <span className="font-medium">{field}</span>
              {value !== undefined && (
                <span className="truncate max-w-[120px]">→ {displayValue}</span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[var(--foreground)]">Time</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--foreground)]">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--foreground)]">User</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--foreground)]">Changed Fields</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--foreground)]">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-[var(--muted-foreground)]"
                >
                  No logs found matching your filters.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-[var(--muted)]/50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-foreground)]">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ACTION_COLORS[log.action] ||
                        "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/users/${log.userId}`}
                        className="font-medium text-[var(--foreground)] hover:underline"
                      >
                        {log.userEmail || "No email"}
                      </Link>
                      <span className="text-xs text-[var(--muted-foreground)] font-mono">
                        {log.userId}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {renderChangedFields(log.changedFields, log.newValues)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-foreground)]">
                    {log.source}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted-foreground)]">
            Showing {(pagination.page - 1) * pagination.limit + 1} -
            {" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} logs
          </span>
          <select
            value={pagination.limit}
            onChange={(e) => updateLimit(Number(e.target.value))}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)]"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>{opt} / page</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updatePage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--muted-foreground)]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => updatePage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
