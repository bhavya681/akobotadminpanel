"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { UsersTable } from "./users-table";
import { CreateUserForm } from "./create-user-form";
import { getUsers, searchUserByEmail, type User } from "@/lib/api/admin-api";

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

export default function UsersPage() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limitParam = parseInt(searchParams.get("limit") ?? "10", 10);
  const limit = LIMIT_OPTIONS.includes(limitParam as (typeof LIMIT_OPTIONS)[number])
    ? limitParam
    : 10;

  const [usersData, setUsersData] = useState<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    const email = searchParams.get("email")?.trim();
    const username = searchParams.get("username")?.trim();
    const isActive = searchParams.get("isActive");
    const isBanned = searchParams.get("isBanned");

    if (email) {
      const res = await searchUserByEmail(email);
      if (res.ok && res.data && !("message" in res.data)) {
        setUsersData({
          users: [res.data as User],
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
        });
      } else {
        setUsersData({
          users: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
      }
    } else {
      const res = await getUsers({
        page,
        limit,
        username: username || undefined,
        email: email || undefined,
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
        isBanned: isBanned === "true" ? true : isBanned === "false" ? false : undefined,
      });
      const data = res.ok
        ? res.data
        : { users: [], total: 0, page: 1, limit, totalPages: 0 };
      setUsersData({
        ...data,
        totalPages: data.totalPages ?? Math.max(1, Math.ceil(data.total / data.limit)),
      });
    }
    setLoading(false);
  }, [page, limit, searchParams]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const refetch = useCallback(() => {
    setLoading(true);
    loadUsers();
  }, [loadUsers]);

  if (loading || !usersData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px]">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  return (
    <div className="p-8 transition-colors duration-300">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Users</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Manage user accounts, search, and moderation
          </p>
        </div>
        <CreateUserForm onCreated={refetch} />
      </header>

      <UsersTable
        users={usersData.users}
        total={usersData.total}
        page={usersData.page}
        limit={usersData.limit}
        totalPages={usersData.totalPages}
        onRefetch={refetch}
        filters={{
          email: searchParams.get("email") ?? undefined,
          username: searchParams.get("username") ?? undefined,
          isActive: searchParams.get("isActive") ?? undefined,
          isBanned: searchParams.get("isBanned") ?? undefined,
          limit: searchParams.get("limit") ?? "10",
        }}
      />
    </div>
  );
}
