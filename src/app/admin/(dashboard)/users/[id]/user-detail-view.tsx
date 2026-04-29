"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AssignPackageModal } from "./assign-package-modal";
import { getUserAgents, deleteAgent, getUserUpdateLogs } from "@/lib/api/admin-api";
import type { AgentItem, UserUpdateLog } from "@/lib/api/admin-api";

interface UserDetailViewProps {
  data: {
    user: {
      _id?: string;
      id?: string;
      username: string;
      email: string;
      isActive?: boolean;
      isBanned?: boolean;
      isSystem?: boolean;
      isVerified?: boolean;
      credits?: number;
      hasPurchasedCredits?: boolean;
      oauthProvider?: string;
      createdAt?: string;
      updatedAt?: string;
      lastLogin?: string;
    };
    wallet: {
      balance: number;
      transactions: Array<Record<string, any>>;
    };
    entitlement: {
      id?: string;
      status?: string;
      activatedAt?: string;
      packageSnapshot?: {
        name?: string;
        planType?: string;
        rules?: Array<Record<string, unknown>>;
        allowedModelIds?: string[];
        allowedToolNames?: string[];
      };
    } | null;
    quotaUsage: Record<
      string,
      {
        label?: string;
        limit?: number;
        used?: number;
        remaining?: number;
        window?: string;
        unit?: string;
      }
    >;
  };
}

export function UserDetailView({ data }: UserDetailViewProps) {
  const { user, wallet, entitlement, quotaUsage } = data;
  const [activeTab, setActiveTab] = useState<"overview" | "wallet" | "quota" | "agents" | "logs">("overview");
  const [showAssignPackage, setShowAssignPackage] = useState(false);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [updateLogs, setUpdateLogs] = useState<UserUpdateLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);

  const userId = user._id || user.id || "";

  const fetchAgents = useCallback(async () => {
    if (!userId) return;
    setAgentsLoading(true);
    const { ok, data } = await getUserAgents(userId);
    if (ok && data) {
      setAgents((data as any).agents || []);
    }
    setAgentsLoading(false);
  }, [userId]);

  const fetchLogs = useCallback(async (page = 1) => {
    if (!userId) return;
    setLogsLoading(true);
    const { ok, data } = await getUserUpdateLogs(userId, { page, limit: 20 });
    if (ok && data) {
      setUpdateLogs((data as any).logs || []);
      setLogsTotal((data as any).pagination?.total || 0);
    }
    setLogsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (activeTab === "agents") {
      fetchAgents();
    }
    if (activeTab === "logs") {
      fetchLogs(logsPage);
    }
  }, [activeTab, fetchAgents, fetchLogs, logsPage]);

  const handleDeleteAgent = useCallback(async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent? This will also remove its knowledge base and integrations.")) return;
    setDeletingAgentId(agentId);
    const { ok } = await deleteAgent(agentId);
    if (ok) {
      setAgents((prev) => prev.filter((a) => a._id !== agentId));
    } else {
      alert("Failed to delete agent");
    }
    setDeletingAgentId(null);
  }, []);

  const formatDate = (d?: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleString();
  };

  const formatCurrency = (n?: number) => {
    if (n === undefined || n === null) return "—";
    return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {user.username}
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">{user.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {user.isBanned && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Banned
            </span>
          )}
          {user.isSystem && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              System
            </span>
          )}
          {user.isVerified && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Verified
            </span>
          )}
          {user.oauthProvider && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
              {user.oauthProvider} OAuth
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6 border-b border-[var(--border)]">
        <nav className="flex gap-6">
          {(["overview", "wallet", "quota", "agents", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-[var(--foreground)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Info */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Account Info</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">User ID</dt>
                <dd className="text-sm font-mono text-[var(--foreground)] truncate max-w-[200px]">
                  {user._id || user.id}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Username</dt>
                <dd className="text-sm text-[var(--foreground)]">{user.username}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Email</dt>
                <dd className="text-sm text-[var(--foreground)]">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Credits</dt>
                <dd className="text-sm text-[var(--foreground)]">{user.credits ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Has Purchased</dt>
                <dd className="text-sm text-[var(--foreground)]">
                  {user.hasPurchasedCredits ? "Yes" : "No"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Created</dt>
                <dd className="text-sm text-[var(--foreground)]">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-[var(--muted-foreground)]">Last Login</dt>
                <dd className="text-sm text-[var(--foreground)]">{formatDate(user.lastLogin)}</dd>
              </div>
            </dl>
          </section>

          {/* Active Entitlement */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Active Plan</h2>
              <button
                onClick={() => setShowAssignPackage(true)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Assign Package
              </button>
            </div>
            {entitlement ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted-foreground)]">Plan Name</dt>
                  <dd className="text-sm font-medium text-[var(--foreground)]">
                    {entitlement.packageSnapshot?.name || "Unknown"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted-foreground)]">Plan Type</dt>
                  <dd className="text-sm text-[var(--foreground)] capitalize">
                    {entitlement.packageSnapshot?.planType || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted-foreground)]">Status</dt>
                  <dd className="text-sm">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        entitlement.status === "active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {entitlement.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted-foreground)]">Activated</dt>
                  <dd className="text-sm text-[var(--foreground)]">{formatDate(entitlement.activatedAt)}</dd>
                </div>
                {entitlement.packageSnapshot?.allowedModelIds &&
                  entitlement.packageSnapshot.allowedModelIds.length > 0 && (
                    <div>
                      <dt className="text-sm text-[var(--muted-foreground)] mb-1">Allowed Models</dt>
                      <dd className="flex flex-wrap gap-1">
                        {entitlement.packageSnapshot.allowedModelIds.map((m) => (
                          <span
                            key={m}
                            className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--foreground)]"
                          >
                            {m}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                {entitlement.packageSnapshot?.allowedToolNames &&
                  entitlement.packageSnapshot.allowedToolNames.length > 0 && (
                    <div>
                      <dt className="text-sm text-[var(--muted-foreground)] mb-1">Allowed Tools</dt>
                      <dd className="flex flex-wrap gap-1">
                        {entitlement.packageSnapshot.allowedToolNames.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--foreground)]"
                          >
                            {t}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">No active plan</p>
            )}
          </section>
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Current Balance</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{wallet.balance} credits</p>
              </div>
              <div className="rounded-full bg-[var(--muted)] p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[var(--foreground)]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Recent Transactions</h2>
            {wallet.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="pb-2 text-left text-[var(--muted-foreground)] font-medium">Type</th>
                      <th className="pb-2 text-right text-[var(--muted-foreground)] font-medium">Amount</th>
                      <th className="pb-2 text-right text-[var(--muted-foreground)] font-medium">Balance</th>
                      <th className="pb-2 text-left text-[var(--muted-foreground)] font-medium">Remark</th>
                      <th className="pb-2 text-left text-[var(--muted-foreground)] font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {wallet.transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-[var(--muted)]/30 transition-colors">
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              (tx.amount ?? 0) > 0
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 text-right font-medium">
                          <span className={tx.amount && tx.amount > 0 ? "text-emerald-600" : "text-red-600"}>
                            {tx.amount && tx.amount > 0 ? "+" : ""}
                            {tx.amount}
                          </span>
                        </td>
                        <td className="py-3 text-right text-[var(--muted-foreground)]">
                          {tx.balanceAfter}
                        </td>
                        <td className="py-3 text-[var(--foreground)] truncate max-w-[200px]">
                          {tx.remark}
                        </td>
                        <td className="py-3 text-[var(--muted-foreground)] whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] py-8 text-center">No transactions yet</p>
            )}
          </section>
        </div>
      )}

      {activeTab === "quota" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Quota Usage</h2>
            {Object.keys(quotaUsage).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(quotaUsage).map(([key, q]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {q.label || key}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {q.used ?? 0} / {q.limit ?? 0} {q.unit || "requests"} ({q.window || "daily"})
                      </span>
                    </div>
                    <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-emerald-500 dark:bg-emerald-600"
                        style={{
                          width: `${Math.min(100, ((q.limit || 1) > 0 ? ((q.used || 0) / q.limit!) : 0) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {q.remaining ?? 0} remaining · Resets {q.window || "daily"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--muted-foreground)] mb-2">No quota limits</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  This user either has no active quota plan or is on a credits-only plan.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "agents" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Custom Agents</h2>
              <span className="text-xs text-[var(--muted-foreground)]">{agents.length} agent(s)</span>
            </div>

            {agentsLoading ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">Loading agents...</div>
            ) : agents.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">No custom agents found for this user</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="pb-3 text-left font-medium text-[var(--muted-foreground)]">Name</th>
                      <th className="pb-3 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                      <th className="pb-3 text-left font-medium text-[var(--muted-foreground)]">Agent ID</th>
                      <th className="pb-3 text-left font-medium text-[var(--muted-foreground)]">Created</th>
                      <th className="pb-3 text-right font-medium text-[var(--muted-foreground)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {agents.map((agent) => (
                      <tr key={agent._id} className="hover:bg-[var(--muted)]/30 transition-colors">
                        <td className="py-3 font-medium text-[var(--foreground)]">{agent.name}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              agent.status === "active"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {agent.status}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-xs text-[var(--muted-foreground)]">{agent._id}</td>
                        <td className="py-3 text-[var(--muted-foreground)]">{formatDate(agent.createdAt)}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteAgent(agent._id)}
                            disabled={deletingAgentId === agent._id}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          >
                            {deletingAgentId === agent._id ? "..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Update History</h2>
              <span className="text-xs text-[var(--muted-foreground)]">{logsTotal} log(s)</span>
            </div>

            {logsLoading ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">Loading logs...</div>
            ) : updateLogs.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">No update logs found for this user</div>
            ) : (
              <div className="space-y-3">
                {updateLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          log.action === "PASSWORD_CHANGED"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : log.action === "OAUTH_LINKED"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : log.action === "BANNED"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : log.action === "USER_CREATED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {log.action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {log.changedFields.map((field) => (
                        <span
                          key={field}
                          className="inline-flex items-center rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]"
                        >
                          {field}
                          {log.newValues?.[field] !== undefined && (
                            <span className="ml-1">
                              →{" "}
                              {typeof log.newValues[field] === "boolean"
                                ? String(log.newValues[field])
                                : typeof log.newValues[field] === "object"
                                ? JSON.stringify(log.newValues[field]).slice(0, 30)
                                : String(log.newValues[field]).slice(0, 30)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                      Source: {log.source} · By: {log.performedBy}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {logsTotal > 20 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                      disabled={logsPage <= 1}
                      className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Page {logsPage} of {Math.ceil(logsTotal / 20)}
                    </span>
                    <button
                      onClick={() => setLogsPage((p) => p + 1)}
                      disabled={logsPage >= Math.ceil(logsTotal / 20)}
                      className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {showAssignPackage && (
        <AssignPackageModal
          userId={user._id || user.id || ""}
          userName={user.username}
          onClose={() => setShowAssignPackage(false)}
          onAssigned={() => window.location.reload()}
        />
      )}
    </div>
  );
}
