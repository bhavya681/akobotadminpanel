"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Package } from "@/lib/api/admin-client";
import { updatePackageAction, deletePackageAction } from "@/app/admin/actions";
import { EditPackageForm } from "./edit-package-form";

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

function PowerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v10" />
      <path d="M18.4 6.6a9 9 0 1 1-12.77 0" />
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

function formatPrice(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function PackagesTable({ packages }: { packages: Package[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdownId]);

  const handleToggleActive = async (pkg: Package) => {
    const id = pkg._id;
    if (!id) return;
    setLoading(id);
    try {
      const formData = new FormData();
      formData.set("isActive", String(!pkg.isActive));
      const result = await updatePackageAction(id, formData);
      if (result.ok) router.refresh();
      else alert(result.error ?? "Failed to update.");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (pkg: Package) => {
    const id = pkg._id;
    if (!id) return;
    if (!confirm(`Delete "${pkg.name}"? This cannot be undone.`)) return;
    setLoading(id);
    try {
      const result = await deletePackageAction(id);
      if (result.ok) router.refresh();
      else alert(result.error ?? "Failed to delete.");
    } finally {
      setLoading(null);
    }
  };

  const handleEditClose = () => {
    setEditingId(null);
    setOpenDropdownId(null);
    router.refresh();
  };

  const handleEditClick = (id: string) => {
    setOpenDropdownId(null);
    setEditingId(id);
  };

  const handleToggleClick = (pkg: Package) => {
    setOpenDropdownId(null);
    handleToggleActive(pkg);
  };

  const handleDeleteClick = (pkg: Package) => {
    setOpenDropdownId(null);
    handleDelete(pkg);
  };

  if (packages.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="p-12 text-center text-[var(--muted-foreground)]">
          No packages yet. Add one to get started.
        </div>
      </div>
    );
  }

  const sorted = [...packages].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                <th className="px-4 py-4 text-left font-medium text-[var(--muted-foreground)] sm:px-6">
                  Package
                </th>
                <th className="px-6 py-4 text-left font-medium text-[var(--muted-foreground)]">
                  Credits
                </th>
                <th className="px-6 py-4 text-left font-medium text-[var(--muted-foreground)]">
                  Price
                </th>
                <th className="px-6 py-4 text-left font-medium text-[var(--muted-foreground)]">
                  Offer
                </th>
                <th className="px-6 py-4 text-left font-medium text-[var(--muted-foreground)]">
                  Status
                </th>
                <th className="px-6 py-4 text-left font-medium text-[var(--muted-foreground)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((pkg) => {
                const id = pkg._id ?? "";
                const isBusy = loading === id;
                return (
                  <tr
                    key={id}
                    className="border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--muted)]/30"
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {pkg.name}
                        </p>
                        {pkg.description && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-1">
                            {pkg.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[var(--muted-foreground)] sm:px-6">
                      {pkg.includedCredits?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <span className="text-[var(--muted-foreground)] line-through">
                        {formatPrice(pkg.actualPrice ?? 0)}
                      </span>
                      <span className="ml-2 font-medium text-[var(--foreground)]">
                        {formatPrice(pkg.currentPrice ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[var(--muted-foreground)] sm:px-6">
                      {pkg.offer ? (
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {pkg.offer}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          pkg.isActive !== false
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                        }`}
                      >
                        {pkg.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative" ref={openDropdownId === id ? dropdownRef : undefined}>
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId(openDropdownId === id ? null : id)}
                          disabled={isBusy}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
                          aria-label="Actions"
                          aria-expanded={openDropdownId === id}
                          aria-haspopup="true"
                        >
                          <MoreVerticalIcon />
                        </button>
                        {openDropdownId === id && (
                          <div
                            className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg"
                            role="menu"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleEditClick(id)}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
                            >
                              <PencilIcon />
                              Edit
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleToggleClick(pkg)}
                              disabled={isBusy}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-amber-600 dark:text-amber-400 transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
                            >
                              <PowerIcon />
                              {isBusy
                                ? "Updating..."
                                : pkg.isActive !== false
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => handleDeleteClick(pkg)}
                              disabled={isBusy}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
                            >
                              <TrashIcon />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingId && (() => {
        const pkg = packages.find((p) => p._id === editingId);
        if (!pkg) return null;
        return (
          <EditPackageForm
            pkg={pkg}
            onClose={handleEditClose}
          />
        );
      })()}
    </>
  );
}
