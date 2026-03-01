"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUserById, type User } from "@/lib/api/admin-api";
import { UserEditForm } from "./user-edit-form";

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadUser = useCallback(async () => {
    const { ok, data } = await getUserById(id);
    if (!ok || !data || "message" in data) {
      setNotFound(true);
    } else {
      setUser(data as User);
    }
  }, [id]);

  useEffect(() => {
    loadUser().finally(() => setLoading(false));
  }, [loadUser]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px]">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="p-8">
        <p className="text-zinc-500 dark:text-zinc-400">User not found</p>
        <Link
          href="/admin/users"
          className="mt-4 inline-block text-sm text-zinc-600 dark:text-zinc-300 hover:underline"
        >
          ← Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 transition-colors duration-300">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← Back to users
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Edit user
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">{user.email}</p>
      </header>

      <div className="max-w-xl">
        <UserEditForm user={user} onSaved={loadUser} />
      </div>
    </div>
  );
}
