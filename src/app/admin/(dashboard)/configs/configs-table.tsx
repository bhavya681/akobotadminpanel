"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppConfig } from "@/lib/api/admin-client";
import { deleteConfigAction, updateConfigAction } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]";

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function valueToInputString(v: unknown, valueType?: string): string {
  if (v === null || v === undefined) return "";
  if (valueType === "json" || typeof v === "object") {
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

export function ConfigsTable({ configs }: { configs: AppConfig[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AppConfig | null>(null);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!deleteKey) return;
    setError("");
    setLoading(true);
    try {
      const result = await deleteConfigAction(deleteKey);
      if (result.ok) {
        setDeleteKey(null);
        router.refresh();
      } else {
        setError(result.error ?? "Delete failed.");
      }
    } catch {
      setError("Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing?.key) return;
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    setLoading(true);
    try {
      const result = await updateConfigAction(editing.key, formData);
      if (result.ok) {
        setEditing(null);
        router.refresh();
      } else {
        setError(result.error ?? "Update failed.");
      }
    } catch {
      setError("Update failed.");
    } finally {
      setLoading(false);
    }
  }

  if (configs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center text-[var(--muted-foreground)]">
        No configurations yet. Use <strong>Add config</strong> or adjust the category filter.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40">
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">Key</th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">Category</th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">Type</th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)]">Value</th>
              <th className="px-4 py-3 font-medium text-[var(--foreground)] w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((row) => (
              <tr
                key={row.key}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30"
              >
                <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                  {row.key}
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {row.category ?? "—"}
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {row.valueType ?? (Array.isArray(row.value) ? "array" : "—")}
                </td>
                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                  {row.isSecret ? "••••••••" : formatValue(row.value)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setEditing(row);
                      }}
                      className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium hover:bg-[var(--muted)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setDeleteKey(row.key);
                      }}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => !loading && setEditing(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-semibold text-[var(--foreground)]">
              Edit configuration
            </h3>
            <p className="mb-4 font-mono text-sm text-[var(--muted-foreground)]">{editing.key}</p>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="hidden" name="key" value={editing.key} readOnly />
              <div>
                <label className="mb-1.5 block text-sm font-medium">Category</label>
                <input
                  name="category"
                  defaultValue={editing.category ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Description</label>
                <input
                  name="description"
                  defaultValue={(editing.description as string) ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Value type</label>
                <select
                  name="valueType"
                  required
                  defaultValue={editing.valueType ?? (Array.isArray(editing.value) ? "array" : "string")}
                  className={inputClass}
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="json">json</option>
                  <option value="array">array</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Value</label>
                <textarea
                  name="value"
                  rows={5}
                  defaultValue={valueToInputString(editing.value, editing.valueType)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  For arrays, paste a JSON array or one item per line.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    name="isSecret"
                    value="true"
                    defaultChecked={editing.isSecret === true}
                    className="rounded border-[var(--border)]"
                  />
                  Secret
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked={editing.isActive !== false}
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
                  disabled={loading}
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !loading && setDeleteKey(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <p className="text-[var(--foreground)]">Delete configuration?</p>
            <p className="mt-2 font-mono text-sm text-[var(--muted-foreground)]">{deleteKey}</p>
            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setDeleteKey(null)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
