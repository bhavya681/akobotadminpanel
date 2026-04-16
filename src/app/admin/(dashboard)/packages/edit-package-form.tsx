"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Package, PackageRule, RegistryModel, ToolSummary } from "@/lib/api/admin-client";
import { updatePackageAction } from "@/app/admin/actions";

const QUOTA_RESOURCES = [
  { value: "chat_messages", label: "Chat messages" },
  { value: "agent_messages", label: "Agent messages" },
  { value: "image_generations", label: "Image generations" },
  { value: "video_generations", label: "Video generations" },
  { value: "speech_to_text_requests", label: "Speech-to-text requests" },
  { value: "text_to_speech_requests", label: "Text-to-speech requests" },
  { value: "deepgram_live_minutes", label: "Deepgram live minutes" },
  { value: "tool_calls", label: "Tool calls" },
];

const QUOTA_WINDOWS = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "lifetime", label: "Lifetime" },
];

const QUOTA_UNITS = [
  { value: "requests", label: "Requests" },
  { value: "minutes", label: "Minutes" },
];

function groupModels(models: RegistryModel[]) {
  return models.reduce<Record<string, RegistryModel[]>>((acc, model) => {
    const category = model.category ?? "other";
    acc[category] ??= [];
    acc[category].push(model);
    return acc;
  }, {});
}

export function EditPackageForm({
  pkg: initialPackage,
  models,
  toolSummaries,
  onClose,
}: {
  pkg: Package;
  models: RegistryModel[];
  toolSummaries: ToolSummary[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [rules, setRules] = useState<PackageRule[]>(
    Array.isArray(initialPackage.rules) ? initialPackage.rules : []
  );
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(
    Array.isArray(initialPackage.allowedModelIds) ? initialPackage.allowedModelIds : []
  );
  const [selectedToolNames, setSelectedToolNames] = useState<string[]>(
    Array.isArray(initialPackage.allowedToolNames) ? initialPackage.allowedToolNames : []
  );

  const groupedModels = groupModels(models);

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

  const addRule = () => {
    setRules((current) => [
      ...current,
      { key: "", label: "", value: "", description: "", resource: "", window: "", unit: "requests" },
    ]);
  };
  const updateRule = (index: number, field: keyof PackageRule, value: string) => {
    setRules((current) =>
      current.map((rule, ruleIndex) =>
        ruleIndex === index
          ? {
              ...rule,
              [field]: field === "limit" ? (value.trim() ? Number(value) : undefined) : value,
            }
          : rule
      )
    );
  };
  const removeRule = (index: number) => {
    setRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
  };
  const toggleModel = (modelId: string) => {
    setSelectedModelIds((current) =>
      current.includes(modelId)
        ? current.filter((value) => value !== modelId)
        : [...current, modelId]
    );
  };

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
          <input type="hidden" name="rulesJson" value={JSON.stringify(rules)} />
          <input
            type="hidden"
            name="allowedModelIdsJson"
            value={JSON.stringify(selectedModelIds)}
          />
          <input
            type="hidden"
            name="allowedToolNamesJson"
            value={JSON.stringify(selectedToolNames)}
          />
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

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">
                  Pricing rules
                </h4>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Maintain the bullet-style plan rules and limits shown for this package.
                </p>
              </div>
              <button
                type="button"
                onClick={addRule}
                className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                + Add rule
              </button>
            </div>

            {rules.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No rules configured.</p>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={`${index}-${rule.key ?? "rule"}`} className="rounded-lg border border-[var(--border)] p-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={rule.label ?? ""}
                        onChange={(event) => updateRule(index, "label", event.target.value)}
                        placeholder="Rule label"
                        className={inputClass}
                      />
                      <input
                        value={rule.value ?? ""}
                        onChange={(event) => updateRule(index, "value", event.target.value)}
                        placeholder="Rule value"
                        className={inputClass}
                      />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
                      <input
                        value={rule.key ?? ""}
                        onChange={(event) => updateRule(index, "key", event.target.value)}
                        placeholder="Optional machine key"
                        className={inputClass}
                      />
                      <input
                        value={rule.description ?? ""}
                        onChange={(event) => updateRule(index, "description", event.target.value)}
                        placeholder="Optional explanation"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
                      <select
                        value={rule.resource ?? ""}
                        onChange={(event) => updateRule(index, "resource", event.target.value)}
                        className={inputClass}
                      >
                        <option value="">Display only</option>
                        {QUOTA_RESOURCES.map((resource) => (
                          <option key={resource.value} value={resource.value}>
                            {resource.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={rule.limit ?? ""}
                        onChange={(event) => updateRule(index, "limit", event.target.value)}
                        placeholder="Limit"
                        className={inputClass}
                      />
                      <select
                        value={rule.window ?? ""}
                        onChange={(event) => updateRule(index, "window", event.target.value)}
                        className={inputClass}
                      >
                        <option value="">Window</option>
                        {QUOTA_WINDOWS.map((window) => (
                          <option key={window.value} value={window.value}>
                            {window.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={rule.unit ?? "requests"}
                        onChange={(event) => updateRule(index, "unit", event.target.value)}
                        className={inputClass}
                      >
                        {QUOTA_UNITS.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-[var(--foreground)]">Allowed tools</h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                Restrict this plan to specific AI tools, or leave empty for no package-level tool restriction.
              </p>
            </div>

            {toolSummaries.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No tool summaries available.</p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {toolSummaries.map((tool) => {
                  const checked = selectedToolNames.includes(tool.name);
                  return (
                    <label
                      key={tool.name}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--muted)]/40"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedToolNames((current) =>
                            current.includes(tool.name)
                              ? current.filter((value) => value !== tool.name)
                              : [...current, tool.name]
                          )
                        }
                        className="mt-1 rounded border-[var(--border)]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[var(--foreground)]">{tool.name}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">{tool.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-[var(--foreground)]">Allowed models</h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                Restrict this plan to specific model registry entries, or leave empty for no restriction.
              </p>
            </div>

            {models.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No registry models available.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedModels).map(([category, categoryModels]) => (
                  <div key={category}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      {category.replaceAll("_", " ")}
                    </p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {categoryModels.map((model) => {
                        const checked = selectedModelIds.includes(model.modelId);
                        return (
                          <label
                            key={model.modelId}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--muted)]/40"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleModel(model.modelId)}
                              className="mt-1 rounded border-[var(--border)]"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-[var(--foreground)]">
                                {model.displayName}
                              </span>
                              <span className="block truncate text-xs text-[var(--muted-foreground)]">
                                {model.modelId}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
