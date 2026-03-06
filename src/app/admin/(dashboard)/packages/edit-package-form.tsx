"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Package } from "@/lib/api/admin-client";
import { updatePackageAction } from "@/app/admin/actions";

export function EditPackageForm({
  pkg: initialPackage,
  onClose,
}: {
  pkg: Package;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const form = e.currentTarget;
    const formData = new FormData(form);
    setLoading(true);
    try {
      const result = await updatePackageAction(initialPackage._id, formData);
      if (result.ok) {
        setSuccess(true);
        onClose();
        router.refresh();
      } else {
        setError(result.error ?? "Failed to update package.");
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
          Edit package
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Update package details
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Name *
            </label>
            <input
              name="name"
              required
              defaultValue={initialPackage.name}
              placeholder="Pro Pack"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Included credits *
              </label>
              <input
                name="includedCredits"
                type="number"
                required
                min="1"
                defaultValue={initialPackage.includedCredits}
                placeholder="60000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Sort order
              </label>
              <input
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={initialPackage.sortOrder ?? ""}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Actual price (₹) *
              </label>
              <input
                name="actualPrice"
                type="number"
                required
                min="0"
                defaultValue={initialPackage.actualPrice}
                placeholder="299"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Current price (₹) *
              </label>
              <input
                name="currentPrice"
                type="number"
                required
                min="0"
                defaultValue={initialPackage.currentPrice}
                placeholder="200"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              defaultValue={initialPackage.description ?? ""}
              placeholder="Get 60,000 credits for just ₹200!"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Offer badge
            </label>
            <input
              name="offer"
              defaultValue={initialPackage.offer ?? ""}
              placeholder="New Year Offer"
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              id="edit-isActive"
              defaultChecked={initialPackage.isActive !== false}
              value="true"
              className="rounded border-[var(--border)]"
            />
            <input type="hidden" name="isActive" value="false" />
            <label htmlFor="edit-isActive" className="text-sm text-[var(--foreground)]">
              Active (visible on pricing page)
            </label>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Package updated successfully.
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
