"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getPackages, assignPackage } from "@/lib/api/admin-api";
import type { PackageOption } from "@/lib/api/admin-api";

interface AssignPackageModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignPackageModal({ userId, userName, onClose, onAssigned }: AssignPackageModalProps) {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      const { ok, data } = await getPackages();
      if (ok && data?.packages) {
        setPackages(data.packages);
      } else {
        setError("Failed to load packages");
      }
      setFetching(false);
    }
    load();
  }, []);

  const handleAssign = useCallback(async () => {
    if (!selectedPackageId) {
      setError("Please select a package");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    const { ok, data } = await assignPackage(userId, selectedPackageId);
    if (ok) {
      setSuccess(`Package assigned successfully! ${data?.credits ? `${data.credits.toLocaleString("en-US")} credits added.` : ""}`);
      setTimeout(() => {
        onAssigned();
        onClose();
      }, 1500);
    } else {
      setError((data as any)?.message || "Failed to assign package");
    }
    setLoading(false);
  }, [selectedPackageId, userId, onAssigned, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Assign Package
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Assigning package to <strong className="text-[var(--foreground)]">{userName}</strong>
        </p>

        {fetching ? (
          <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">No active packages found</div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {packages.map((pkg) => (
              <label
                key={pkg._id}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedPackageId === pkg._id
                    ? "border-[var(--ring)] bg-[var(--muted)]/50"
                    : "border-[var(--border)] hover:bg-[var(--muted)]/30"
                }`}
              >
                <input
                  type="radio"
                  name="package"
                  value={pkg._id}
                  checked={selectedPackageId === pkg._id}
                  onChange={() => setSelectedPackageId(pkg._id)}
                  className="accent-[var(--ring)]"
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
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {pkg.includedCredits.toLocaleString("en-US")} credits
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            {success}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedPackageId || fetching}
            className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Assigning..." : "Assign Package"}
          </button>
        </div>
      </div>
    </div>
  );
}
