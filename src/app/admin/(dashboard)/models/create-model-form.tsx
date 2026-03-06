"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createModelAction } from "@/app/admin/actions";

const CATEGORIES = [
  { value: "llm", label: "LLM" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "image_to_image", label: "Image to Image" },
  { value: "audio", label: "Audio" },
  { value: "music", label: "Music" },
] as const;

export function CreateModelForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const form = e.currentTarget;
    const formData = new FormData(form);
    setLoading(true);
    try {
      const result = await createModelAction(formData);
      if (result.ok) {
        setSuccess(true);
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create model.");
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
      >
        + Add model
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
              Add AI model
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Register a new model in the registry
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Model ID *
                </label>
                <input
                  name="modelId"
                  required
                  placeholder="ModelsLab/Llama-3.1-8b-Uncensored-Dare"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Display name *
                </label>
                <input
                  name="displayName"
                  required
                  placeholder="Llama 3.1 8B Uncensored"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Category *
                </label>
                <select name="category" required className={inputClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Provider
                </label>
                <input
                  name="provider"
                  placeholder="modelslab"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Cost per request (credits)
                </label>
                <input
                  name="costPerRequest"
                  type="number"
                  min="0"
                  placeholder="100"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Endpoint
                </label>
                <input
                  name="endpoint"
                  placeholder="/apimodule/v1/chat/completions"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Fast uncensored chat model"
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="create-isActive"
                  defaultChecked
                  value="true"
                  className="rounded border-[var(--border)]"
                />
                <input type="hidden" name="isActive" value="false" />
                <label htmlFor="create-isActive" className="text-sm text-[var(--foreground)]">
                  Active (visible in model pickers)
                </label>
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              {success && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Model created successfully.
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
