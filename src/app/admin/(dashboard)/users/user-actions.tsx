"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@/lib/api/admin-api";
import {
  banUser,
  unbanUser,
  deleteUser,
  resetUserPassword,
  makeUserAdmin,
} from "@/lib/api/admin-api";

export function UserActions({ user, onRefetch }: { user: User; onRefetch?: () => void }) {
  const router = useRouter();
  const id = user._id ?? user.id ?? "";
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (
    action: () => Promise<{ ok: boolean; status: number; data: unknown }>,
    key: string
  ) => {
    setLoading(key);
    try {
      const r = await action();
      if (r.ok && r.status === 200) onRefetch?.() ?? router.refresh();
      else alert((r.data as { message?: string })?.message ?? "Action failed");
    } finally {
      setLoading(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setPasswordError("");
    const r = await resetUserPassword(id, newPassword);
    if (r.ok && r.status === 200) {
      setShowPasswordModal(false);
      setNewPassword("");
      onRefetch?.() ?? router.refresh();
    } else setPasswordError((r.data as { message?: string })?.message ?? "Failed to reset");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a
        href={`/admin/users/${id}`}
        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium"
      >
        Edit
      </a>
      {user.isBanned ? (
        <button
          onClick={() => handleAction(() => unbanUser(id), "unban")}
          disabled={!!loading}
          className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline disabled:opacity-50"
        >
          {loading === "unban" ? "..." : "Unban"}
        </button>
      ) : (
        <button
          onClick={() => handleAction(() => banUser(id), "ban")}
          disabled={!!loading}
          className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
        >
          {loading === "ban" ? "..." : "Ban"}
        </button>
      )}
      {!user.isAdmin && user.role !== "admin" && (
        <button
          onClick={() => handleAction(() => makeUserAdmin(id), "admin")}
          disabled={!!loading}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
        >
          {loading === "admin" ? "..." : "Make admin"}
        </button>
      )}
      <button
        onClick={() => setShowPasswordModal(true)}
        className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:underline"
      >
        Reset password
      </button>
      <button
        onClick={() => {
          if (confirm("Delete this user? This cannot be undone.")) {
            handleAction(() => deleteUser(id), "delete");
          }
        }}
        disabled={!!loading}
        className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
      >
        {loading === "delete" ? "..." : "Delete"}
      </button>

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Reset password
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Set a new password for {user.username}
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="New password"
                minLength={6}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-100"
              />
              {passwordError && (
                <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword("");
                    setPasswordError("");
                  }}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
