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
  unlinkUserOAuthAction,
  transferAgentsAction,
  getUserAgentsAction,
  assignPackageAction,
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

function LinkBreakIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 2.5 2.5v5" />
      <path d="M16.5 8v-2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1-2.5 2.5h-5" />
    </svg>
  );
}

export function UserActions({ user }: { user: User }) {
  const router = useRouter();
  const id = user._id ?? user.id ?? "";
  const [open, setOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignPackageModal, setShowAssignPackageModal] = useState(false);
  const [packagesList, setPackagesList] = useState<Array<{ _id: string; name: string; planType: string; includedCredits: number; currentPrice: number; currency: string }>>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  // Delete modal state
  const [deleteAllAgents, setDeleteAllAgents] = useState(false);
  const [transferMode, setTransferMode] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferError, setTransferError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [agentsInfo, setAgentsInfo] = useState<{ count: number; agents: { _id: string; name: string; status: string }[] } | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(false);

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

  const handleDeleteClick = async () => {
    setOpen(false);
    setDeleteAllAgents(false);
    setTransferMode(false);
    setTransferEmail("");
    setTransferError("");
    setDeleteError("");
    setAgentsInfo(null);

    // Fetch agent count for this user
    setLoadingAgents(true);
    try {
      const result = await getUserAgentsAction(id);
      if (result.ok && result.data) {
        setAgentsInfo({ count: result.data.count, agents: result.data.agents });
      }
    } catch {
      // If we can't fetch agents, just show the modal without agent info
    }
    setLoadingAgents(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteError("");

    // If user has agents and transfer mode is selected, transfer first
    if (agentsInfo && agentsInfo.count > 0 && transferMode) {
      if (!transferEmail.trim()) {
        setTransferError("Please enter the target user's email.");
        return;
      }
      setTransferError("");
      setLoading("transfer");
      try {
        // Search for the target user by email to get their ID
        const searchRes = await fetch(`/api/admin/users/search?email=${encodeURIComponent(transferEmail.trim())}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const searchData = await searchRes.json();
        if (!searchRes.ok || !searchData?._id) {
          setTransferError("User not found. Please enter a valid email address.");
          setLoading(null);
          return;
        }
        const targetUserId = searchData._id;
        if (targetUserId === id) {
          setTransferError("Cannot transfer agents to the same user being deleted.");
          setLoading(null);
          return;
        }

        const transferResult = await transferAgentsAction(id, targetUserId);
        if (!transferResult.ok) {
          setTransferError(transferResult.error ?? "Failed to transfer agents.");
          setLoading(null);
          return;
        }
      } catch {
        setTransferError("Failed to transfer agents. Please try again.");
        setLoading(null);
        return;
      }
      setLoading(null);
    }

    // Now delete the user
    setLoading("delete");
    try {
      const result = await deleteUserAction(id, { deleteAllAgents: deleteAllAgents });
      if (result.ok) {
        setShowDeleteModal(false);
        router.refresh();
      } else {
        setDeleteError(result.error ?? "Failed to delete user.");
      }
    } catch {
      setDeleteError("An unexpected error occurred.");
    }
    setLoading(null);
  };

  const handleUnlinkGoogleClick = () => {
    handleAction(() => unlinkUserOAuthAction(user.email), "unlink-google");
  };

  const handleAssignPackageClick = async () => {
    setOpen(false);
    setAssignError("");
    setSelectedPackageId("");
    setAssignLoading(true);
    try {
      const res = await fetch("/api/admin/packages", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data?.packages) {
        setPackagesList(data.packages);
      }
    } catch {
      // ignore
    }
    setAssignLoading(false);
    setShowAssignPackageModal(true);
  };

  const handleConfirmAssignPackage = async () => {
    if (!selectedPackageId) {
      setAssignError("Please select a package");
      return;
    }
    setAssignLoading(true);
    setAssignError("");
    const result = await assignPackageAction(id, selectedPackageId);
    if (result.ok) {
      setShowAssignPackageModal(false);
      router.refresh();
    } else {
      setAssignError(result.error ?? "Failed to assign package");
    }
    setAssignLoading(false);
  };

  const isBusy = !!loading || assignLoading;

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
            onClick={handleUnlinkGoogleClick}
            disabled={isBusy}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LinkBreakIcon />
            {loading === "unlink-google" ? "Unlinking..." : "Unlink Google"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleAssignPackageClick}
            disabled={isBusy}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-purple-600 dark:text-purple-400 transition-colors hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GiftIcon />
            {assignLoading ? "Loading..." : "Assign Package"}
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

      {/* Password Reset Modal */}
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

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Delete User
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Are you sure you want to delete <strong className="text-[var(--foreground)]">{user.username}</strong> ({user.email})? This action cannot be undone.
            </p>

            {loadingAgents ? (
              <div className="flex items-center gap-2 py-3 text-sm text-[var(--muted-foreground)]">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking for agents...
              </div>
            ) : agentsInfo && agentsInfo.count > 0 ? (
              <div className="space-y-4">
                {/* Agent warning */}
                <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    ⚠️ This user owns {agentsInfo.count} agent{agentsInfo.count > 1 ? "s" : ""}
                  </p>
                  <div className="mt-2 max-h-24 overflow-y-auto">
                    {agentsInfo.agents.map((agent) => (
                      <div key={agent._id} className="text-xs text-amber-700 dark:text-amber-400">
                        • {agent.name} ({agent.status})
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                    You must either transfer these agents to another user or delete them along with the user.
                  </p>
                </div>

                {/* Transfer agents option */}
                <div className="rounded-lg border border-[var(--border)] p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="agentAction"
                      checked={transferMode}
                      onChange={() => { setTransferMode(true); setDeleteAllAgents(false); }}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">Transfer agents to another user</p>
                      <p className="text-xs text-[var(--muted-foreground)]">All agents and their RAG data will be moved to a new owner.</p>
                    </div>
                  </label>
                  {transferMode && (
                    <div className="mt-3 ml-7">
                      <input
                        type="email"
                        value={transferEmail}
                        onChange={(e) => { setTransferEmail(e.target.value); setTransferError(""); }}
                        placeholder="Target user's email address"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                      />
                      {transferError && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{transferError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Delete all agents option */}
                <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="agentAction"
                      checked={deleteAllAgents}
                      onChange={() => { setDeleteAllAgents(true); setTransferMode(false); }}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete all agents &amp; RAG data</p>
                      <p className="text-xs text-red-600 dark:text-red-500">
                        All agents, their knowledge base documents, ingested files, and Qdrant vectors will be permanently deleted.
                      </p>
                    </div>
                  </label>
                </div>

                {!transferMode && !deleteAllAgents && (
                  <p className="text-xs text-[var(--muted-foreground)] text-center">
                    Select an option above to proceed with deletion.
                  </p>
                )}
              </div>
            ) : null}

            {deleteError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteError}</p>
            )}

            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteAllAgents(false);
                  setTransferMode(false);
                  setTransferEmail("");
                  setTransferError("");
                  setDeleteError("");
                }}
                className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isBusy || (agentsInfo !== null && agentsInfo.count > 0 && !transferMode && !deleteAllAgents)}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "delete" ? "Deleting..." : loading === "transfer" ? "Transferring..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Package Modal */}
      {showAssignPackageModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowAssignPackageModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Assign Package
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Assign a package to <strong className="text-[var(--foreground)]">{user.username}</strong>. Credits will be added to their wallet and their entitlement will be updated.
            </p>

            {packagesList.length === 0 ? (
              <div className="py-4 text-center text-sm text-[var(--muted-foreground)]">No active packages found</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {packagesList.map((pkg) => (
                  <label
                    key={pkg._id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      selectedPackageId === pkg._id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-[var(--border)] hover:bg-[var(--muted)]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="package"
                      value={pkg._id}
                      checked={selectedPackageId === pkg._id}
                      onChange={() => { setSelectedPackageId(pkg._id); setAssignError(""); }}
                      className="accent-purple-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--foreground)]">{pkg.name}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {pkg.currency === "INR" ? "₹" : "$"}{pkg.currentPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[var(--muted-foreground)] capitalize">{pkg.planType}</span>
                        {pkg.includedCredits > 0 && (
                          <>
                            <span className="text-xs text-[var(--muted-foreground)]">·</span>
                            <span className="text-xs text-[var(--muted-foreground)]">{pkg.includedCredits.toLocaleString("en-US")} credits</span>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {assignError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{assignError}</p>
            )}

            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAssignPackageModal(false);
                  setAssignError("");
                  setSelectedPackageId("");
                }}
                className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignPackage}
                disabled={assignLoading || !selectedPackageId}
                className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignLoading ? "Assigning..." : "Assign Package"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
