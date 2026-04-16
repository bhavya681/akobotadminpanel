"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createConfigAction } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20";

export function CreateConfigForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    setLoading(true);
    try {
      const result = await createConfigAction(formData);
      if (result.ok) {
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create configuration.");
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
      >
        + Add config
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-semibold text-[var(--foreground)]">
              Create configuration
            </h3>
            <p className="mb-6 text-sm text-[var(--muted-foreground)]">
              POST <code className="text-xs">/api/configs</code> — admin only
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Key *
                </label>
                <input
                  name="key"
                  required
                  placeholder="FEATURE_FLAGS"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Category
                </label>
                <input
                  name="category"
                  placeholder="smtp"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Description
                </label>
                <input
                  name="description"
                  placeholder="Human-readable description"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Value type *
                </label>
                <select name="valueType" required defaultValue="string" className={inputClass}>
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="json">json</option>
                  <option value="array">array</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Value
                </label>
                <textarea
                  name="value"
                  rows={4}
                  placeholder={'String, number, true/false, JSON, or array values.\nFor arrays: use a JSON array like ["a", "b"] or one item per line.'}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  For <strong>json</strong>, paste valid JSON. For <strong>boolean</strong>, use{" "}
                  <code>true</code> or <code>false</code>. For <strong>array</strong>, use a JSON array or enter one item per line.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    name="isSecret"
                    value="true"
                    className="rounded border-[var(--border)]"
                  />
                  Secret
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked
                    className="rounded border-[var(--border)]"
                  />
                  Active
                </label>
                <input type="hidden" name="isActive" value="false" />
              </div>
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                >
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
