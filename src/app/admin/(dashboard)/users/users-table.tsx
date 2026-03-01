"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { User } from "@/lib/api/admin-api";
import { UserActions } from "./user-actions";

interface UsersTableProps {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onRefetch?: () => void;
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
  onRefetch,
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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 w-48"
        />
        <input
          type="text"
          placeholder="Filter by username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 w-48"
        />
        <select
          value={filters.isActive ?? ""}
          onChange={(e) => router.push(buildUrl({ ...filters, isActive: e.target.value || undefined }))}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 w-36"
        >
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={filters.isBanned ?? ""}
          onChange={(e) => router.push(buildUrl({ ...filters, isBanned: e.target.value || undefined }))}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 w-36"
        >
          <option value="">All</option>
          <option value="true">Banned</option>
          <option value="false">Not banned</option>
        </select>
        <select
          value={filters.limit ?? "10"}
          onChange={(e) => router.push(buildUrl({ ...filters, limit: e.target.value }))}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 w-24"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">User</th>
                  <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">Email</th>
                  <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                  <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id ?? user.id ?? user.email}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{user.username}</div>
                      {(user.isAdmin || user.role === "admin") && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isBanned
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : user.isActive === false
                              ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {user.isBanned ? "Banned" : user.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <UserActions user={user} onRefetch={onRefetch} />
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  page <= 1
                    ? "cursor-not-allowed text-zinc-400 dark:text-zinc-500 pointer-events-none"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                ← Previous
              </Link>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 px-2">
                Page {page} of {totalPages}
              </span>
              <Link
                href={page < totalPages ? buildUrl({ page: String(page + 1) }, false) : "#"}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  page >= totalPages
                    ? "cursor-not-allowed text-zinc-400 dark:text-zinc-500 pointer-events-none"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
