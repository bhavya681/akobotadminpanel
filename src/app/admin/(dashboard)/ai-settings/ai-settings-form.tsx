"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAiSettingsAction } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]";

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <span>
        <span className="block text-sm font-medium text-[var(--foreground)]">
          {label}
        </span>
        <span className="mt-1 block text-sm text-[var(--muted-foreground)]">
          {description}
        </span>
      </span>
      <input type="hidden" name={name} value="false" />
      <input
        name={name}
        type="checkbox"
        value="true"
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)]"
      />
    </label>
  );
}

export function AiSettingsForm({
  systemPrompt,
  rawChatEndpointsEnabled,
  customAgentCreationRequiresPaid,
}: {
  systemPrompt: string;
  rawChatEndpointsEnabled: boolean;
  customAgentCreationRequiresPaid: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveAiSettingsAction(formData);
      if (result.ok) {
        setSaved(true);
        router.refresh();
        return;
      }
      setError(result.error ?? "Failed to save AI settings.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Global chat prompt
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Stored as AKOBOT_CHAT_SYSTEM_PROMPT and applied by the backend across chat entry points.
          </p>
        </div>
        <textarea
          name="systemPrompt"
          defaultValue={systemPrompt}
          rows={18}
          className={`${inputClass} font-mono leading-6`}
          required
        />
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Access controls
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            These write to backend config flags, so changes take effect without redeploying the admin panel.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Toggle
            name="rawChatEndpointsEnabled"
            label="Raw LLM text endpoints"
            description="Allow non-admin users to call low-level text completion endpoints directly."
            defaultChecked={rawChatEndpointsEnabled}
          />
          <Toggle
            name="customAgentCreationRequiresPaid"
            label="Paid access for agent creation"
            description="Require paid access or purchased credits before a user can create custom agents."
            defaultChecked={customAgentCreationRequiresPaid}
          />
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          AI settings saved.
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
