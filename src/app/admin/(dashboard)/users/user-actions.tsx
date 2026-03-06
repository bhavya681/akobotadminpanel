"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { User } from "@/lib/types/admin";
import {
  banUserAction,
  unbanUserAction,
  deleteUserAction,
  resetUserPasswordAction,
  makeUserAdminAction,
} from "@/app/admin/actions";

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-2 2" />
      <path d="m19 6 2 2" />
      <path d="m15 8-4 4" />
      <path d="m21 6-4 4" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

export function UserActions({ user }: { user: User }) {
  const router = useRouter();
  const id = user._id ?? user.id ?? "";
  const [open, setOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleAction = async (
    action: () => Promise<{ ok: boolean; error?: string }>,
    key: string
  ) => {
    setOpen(false);
    setLoading(key);
    try {
      const r = await action();
      if (r.ok) router.refresh();
      else alert(r.error ?? "Action failed");
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
    const r = await resetUserPasswordAction(id, newPassword);
    if (r.ok) {
      setShowPasswordModal(false);
      setNewPassword("");
      router.refresh();
    } else setPasswordError(r.error ?? "Failed to reset");
  };

  const handleResetClick = () => {
    setOpen(false);
    setShowPasswordModal(true);
  };

  const handleDeleteClick = () => {
    setOpen(false);
    if (confirm("Delete this user? This cannot be undone.")) {
      handleAction(() => deleteUserAction(id), "delete");
    }
  };

  const isBusy = !!loading;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isBusy}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Actions"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <MoreVerticalIcon />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg"
          role="menu"
        >
          <Link
            href={`/admin/users/${id}`}
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
          >
            <PencilIcon />
            Edit
          </Link>
          {user.isBanned ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(() => unbanUserAction(id), "unban")}
              disabled={isBusy}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-green-600 dark:text-green-400 transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldIcon />
              {loading === "unban" ? "Unbanning..." : "Unban"}
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(() => banUserAction(id), "ban")}
              disabled={isBusy}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-amber-600 dark:text-amber-400 transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldIcon />
              {loading === "ban" ? "Banning..." : "Ban"}
            </button>
          )}
          {!user.isAdmin && user.role !== "admin" && (
            <button
              type="button"
              role="menuitem"
              onClick={() => handleAction(() => makeUserAdminAction(id), "admin")}
              disabled={isBusy}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-blue-600 dark:text-blue-400 transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldIcon />
              {loading === "admin" ? "Updating..." : "Make admin"}
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={handleResetClick}
            disabled={isBusy}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <KeyIcon />
            Reset password
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleDeleteClick}
            disabled={isBusy}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon />
            {loading === "delete" ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Reset password
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
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
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
              />
              {passwordError && (
                <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)]"
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
                  className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)]"
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
