"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Token } from "@/lib/types/admin";
import { revokeTokenAction } from "@/app/admin/actions";

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

export function TokensTable({ tokens }: { tokens: Token[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRevoke = async (tokenId: string) => {
    if (!confirm("Revoke this token? The user will be logged out.")) return;
    setLoading(tokenId);
    try {
      const result = await revokeTokenAction(tokenId);
      if (result.ok) router.refresh();
      else alert(result.error ?? "Failed to revoke token.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      {tokens.length === 0 ? (
        <div className="p-12 text-center text-[var(--muted-foreground)]">
          No active tokens
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">
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
                    className="border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--muted)]/30"
                  >
                    <td className="px-4 py-4 sm:px-6">
                      {uid ? (
                        <Link href={`/admin/users/${uid}`} className="font-medium text-[var(--foreground)] hover:underline">
                          {userLabel}
                        </Link>
                      ) : (
                        <span className="text-[var(--foreground)]">{userLabel}</span>
                      )}
                      {token.email && token.username !== token.email && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{token.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[var(--muted-foreground)] sm:px-6">
                      {deviceLabel}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-[var(--muted-foreground)] sm:px-6">
                      {device?.ipAddress ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-[var(--muted-foreground)] sm:px-6">
                      {token.createdAt
                        ? new Date(token.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-4 text-[var(--muted-foreground)] sm:px-6">
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
