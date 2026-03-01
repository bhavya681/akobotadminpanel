"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { User } from "@/lib/types/admin";
import { UserActions } from "./user-actions";

interface UsersTableProps {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    email?: string;
    username?: string;
    isActive?: string;
    isBanned?: string;
    limit?: string;
  };
}

export function UsersTable({
  users,
  total,
  page,
  limit,
  totalPages,
  filters,
}: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchEmail, setSearchEmail] = useState(filters.email ?? "");
  const [searchUsername, setSearchUsername] = useState(filters.username ?? "");

  const buildUrl = (updates: Record<string, string | undefined>, resetPage = true) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    });
    if (resetPage) p.set("page", "1");
    return `/admin/users?${p.toString()}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ email: searchEmail || undefined, username: searchUsername || undefined }));
  };

  const inputClass = "rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className={`${inputClass} w-full min-w-0 sm:w-48`}
        />
        <input
          type="text"
          placeholder="Filter by username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          className={`${inputClass} w-full min-w-0 sm:w-48`}
        />
        <select
          value={filters.isActive ?? ""}
          onChange={(e) => router.push(buildUrl({ ...filters, isActive: e.target.value || undefined }))}
          className={`${inputClass} w-full sm:w-36`}
        >
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={filters.isBanned ?? ""}
          onChange={(e) => router.push(buildUrl({ ...filters, isBanned: e.target.value || undefined }))}
          className={`${inputClass} w-full sm:w-36`}
        >
          <option value="">All</option>
          <option value="true">Banned</option>
          <option value="false">Not banned</option>
        </select>
        <select
          value={filters.limit ?? "10"}
          onChange={(e) => router.push(buildUrl({ ...filters, limit: e.target.value }))}
          className={`${inputClass} w-full sm:w-24`}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted-foreground)]">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">User</th>
                  <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">Email</th>
                  <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">Status</th>
                  <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id ?? user.id ?? user.email}
                    className="border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--muted)]/30"
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <div className="font-medium text-[var(--foreground)]">{user.username}</div>
                      {(user.isAdmin || user.role === "admin") && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">Admin</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[var(--muted-foreground)] sm:px-6">{user.email}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isBanned
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : user.isActive === false
                              ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}
                      >
                        {user.isBanned ? "Banned" : user.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <UserActions user={user} />
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
              <>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</>
            ) : (
              <>No users found</>
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
