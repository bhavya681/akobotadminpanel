"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Token } from "@/lib/api/admin-client";
import { revokeTokenAction } from "./actions";

export function TokensTable({ tokens }: { tokens: Token[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRevoke = async (tokenId: string) => {
    if (!confirm("Revoke this token? The user will be logged out.")) return;
    setLoading(tokenId);
    try {
      const r = await revokeTokenAction(tokenId);
      if (r?.success) router.refresh();
      else if (r?.error) alert(r.error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      {tokens.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
          No active tokens
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Token ID
                </th>
                <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  User
                </th>
                <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Created
                </th>
                <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => {
                const id = token._id ?? token.id ?? "";
                const user = token.user as { username?: string; email?: string } | undefined;
                const userLabel = user?.username ?? user?.email ?? token.userId ?? "—";
                return (
                  <tr
                    key={id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
                      {id}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const uid = token.userId ?? (token.user as { id?: string; _id?: string })?.id ?? (token.user as { id?: string; _id?: string })?._id;
                        return uid ? (
                          <Link href={`/admin/users/${uid}`} className="text-zinc-900 dark:text-zinc-50 hover:underline font-medium">
                            {userLabel}
                          </Link>
                        ) : (
                          <span className="text-zinc-900 dark:text-zinc-50">{userLabel}</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {token.createdAt
                        ? new Date(token.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRevoke(id)}
                        disabled={!!loading}
                        className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                      >
                        {loading === id ? "Revoking..." : "Revoke"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
