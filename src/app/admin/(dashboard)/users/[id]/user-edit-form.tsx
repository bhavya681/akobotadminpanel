"use client";

import { useActionState } from "react";
import type { User } from "@/lib/api/admin-client";
import { updateUserAction } from "../actions";

export function UserEditForm({ user }: { user: User }) {
  const id = user._id ?? user.id ?? "";
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, fd: FormData) => {
      return await updateUserAction(id, fd);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-colors duration-300">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Username
        </label>
        <input
          name="username"
          defaultValue={user.username}
          required
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Email
        </label>
        <input
          name="email"
          type="email"
          defaultValue={user.email}
          required
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          New password (leave blank to keep current)
        </label>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="isActive"
            value="true"
            defaultChecked={user.isActive !== false}
            className="rounded-full"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="isActive"
            value="false"
            defaultChecked={user.isActive === false}
            className="rounded-full"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Inactive</span>
        </label>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="isBanned"
            value="false"
            defaultChecked={!user.isBanned}
            className="rounded-full"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Not banned</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="isBanned"
            value="true"
            defaultChecked={!!user.isBanned}
            className="rounded-full"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Banned</span>
        </label>
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">User updated successfully.</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
