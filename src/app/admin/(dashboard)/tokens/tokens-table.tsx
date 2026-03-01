"use client";

import Link from "next/link";
import { useState } from "react";
import type { Token } from "@/lib/api/admin-api";
import { revokeToken } from "@/lib/api/admin-api";

function getDeviceLabel(ua?: string): string {
  if (!ua) return "Unknown";
  if (ua.includes("Mobile") && !ua.includes("iPad")) return "Mobile";
  if (ua.includes("iPhone")) return "iPhone";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPad")) return "iPad";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Akeo-AdminPanel")) return "Admin Panel";
  return "Desktop";
}

export function TokensTable({
  tokens,
  onRevoked,
}: {
  tokens: Token[];
  onRevoked?: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRevoke = async (tokenId: string) => {
    if (!confirm("Revoke this token? The user will be logged out.")) return;
    setLoading(tokenId);
    try {
      const { ok, data } = await revokeToken(tokenId);
      if (ok) onRevoked?.();
      else alert((data as { message?: string })?.message ?? "Failed to revoke token.");
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
                  User
                </th>
                <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Device
                </th>
                <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  IP
                </th>
                <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Created
                </th>
                <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Expires
                </th>
                <th className="px-6 py-4 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => {
                const id = token.tokenId ?? token._id ?? token.id ?? "";
                const userLabel = token.username ?? token.email ?? (token.user as { username?: string; email?: string } | undefined)?.username ?? (token.user as { username?: string; email?: string } | undefined)?.email ?? token.userId ?? "—";
                const uid = token.userId ?? (token.user as { id?: string; _id?: string })?.id ?? (token.user as { id?: string; _id?: string })?._id;
                const device = token.deviceInfo;
                const deviceLabel = getDeviceLabel(device?.userAgent);
                return (
                  <tr
                    key={id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-4">
                      {uid ? (
                        <Link href={`/admin/users/${uid}`} className="text-zinc-900 dark:text-zinc-50 hover:underline font-medium">
                          {userLabel}
                        </Link>
                      ) : (
                        <span className="text-zinc-900 dark:text-zinc-50">{userLabel}</span>
                      )}
                      {token.email && token.username !== token.email && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{token.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {deviceLabel}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {device?.ipAddress ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {token.createdAt
                        ? new Date(token.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {token.expiresAt
                        ? new Date(token.expiresAt).toLocaleString()
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
