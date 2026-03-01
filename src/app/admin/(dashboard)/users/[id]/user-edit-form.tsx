"use client";

import { useState } from "react";
import type { User } from "@/lib/api/admin-api";
import { updateUser } from "@/lib/api/admin-api";

export function UserEditForm({
  user,
  onSaved,
}: {
  user: User;
  onSaved?: () => void;
}) {
  const id = user._id ?? user.id ?? "";
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(user.isActive !== false);
  const [isBanned, setIsBanned] = useState(!!user.isBanned);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const body: Partial<User> = { username, email, isActive, isBanned };
    if (password.trim()) body.password = password;

    setLoading(true);
    try {
      const { ok, data } = await updateUser(id, body);
      if (ok && (data && !("message" in data))) {
        setSuccess(true);
        setPassword("");
        onSaved?.();
      } else {
        setError((data as { message?: string })?.message ?? "Failed to update user.");
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-colors duration-300"
    >
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          New password (leave blank to keep current)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="isActive"
            checked={isActive}
            onChange={() => setIsActive(true)}
            className="rounded-full"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="isActive"
            checked={!isActive}
            onChange={() => setIsActive(false)}
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
            checked={!isBanned}
            onChange={() => setIsBanned(false)}
            className="rounded-full"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Not banned</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="isBanned"
            checked={isBanned}
            onChange={() => setIsBanned(true)}
            className="rounded-full"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Banned</span>
        </label>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          User updated successfully.
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
