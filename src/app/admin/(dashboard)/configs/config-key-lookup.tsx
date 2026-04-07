"use client";

import { useState } from "react";
import { lookupConfigByKeyAction } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]";

/** GET /api/configs/{key} — returns value or {} if missing (no key enumeration). */
export function ConfigKeyLookup() {
  const [key, setKey] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await lookupConfigByKeyAction(key);
      if (res.ok) {
        setResult(res.preview);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-w-0 flex-1 lg:max-w-xl">
      <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">
        Lookup by key (same as GET <code className="text-[var(--foreground)]">/api/configs/&#123;key&#125;</code>)
      </p>
      <form onSubmit={handleLookup} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="SMTP_HOST"
          className={inputClass}
          aria-label="Config key"
        />
        <button
          type="submit"
          disabled={loading || !key.trim()}
          className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "…" : "Lookup"}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {result !== null && (
        <pre className="mt-3 max-h-48 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-3 text-xs text-[var(--foreground)]">
          {result}
        </pre>
      )}
    </div>
  );
}
