"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface LogsFilterProps {
  actionOptions: { value: string; label: string }[];
  currentAction: string;
  currentEmail: string;
  currentUserId: string;
}

export function LogsFilter({
  actionOptions,
  currentAction,
  currentEmail,
  currentUserId,
}: LogsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          Filter by Action
        </label>
        <select
          value={currentAction}
          onChange={(e) => updateParam("action", e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {actionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          Filter by Email
        </label>
        <input
          type="text"
          value={currentEmail}
          onChange={(e) => updateParam("email", e.target.value)}
          placeholder="user@example.com"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          Filter by User ID
        </label>
        <input
          type="text"
          value={currentUserId}
          onChange={(e) => updateParam("userId", e.target.value)}
          placeholder="User ObjectId"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
    </div>
  );
}
