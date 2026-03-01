"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types/admin";
import { updateUserAction } from "@/app/admin/actions";

export function UserEditForm({ user }: { user: User }) {
  const router = useRouter();
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
    const formData = new FormData();
    formData.set("username", username);
    formData.set("email", email);
    if (password.trim()) formData.set("password", password);
    formData.set("isActive", String(isActive));
    formData.set("isBanned", String(isBanned));
    setLoading(true);
    try {
      const result = await updateUserAction(id, formData);
      if (result.ok) {
        setSuccess(true);
        setPassword("");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to update user.");
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[var(--foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
    >
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          New password (leave blank to keep current)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
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
        className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
