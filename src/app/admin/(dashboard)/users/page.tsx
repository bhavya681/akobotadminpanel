import { Suspense } from "react";
import { getUsers, searchUserByEmail } from "@/lib/api/admin-client";
import { UsersTable } from "./users-table";
import { CreateUserForm } from "./create-user-form";

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(String(params?.page ?? "1"), 10));
  const limitParam = parseInt(String(params?.limit ?? "10"), 10);
  const limit = LIMIT_OPTIONS.includes(limitParam as (typeof LIMIT_OPTIONS)[number])
    ? limitParam
    : 10;
  const email = String(params?.email ?? "").trim();
  const username = String(params?.username ?? "").trim();
  const isActive = params?.isActive as string | undefined;
  const isBanned = params?.isBanned as string | undefined;

  let usersData: {
    users: import("@/lib/api/admin-client").User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  if (email) {
    const res = await searchUserByEmail(email);
    if (res.ok && res.data && !("message" in res.data)) {
      usersData = {
        users: [res.data as import("@/lib/api/admin-client").User],
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      };
    } else {
      usersData = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
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
    usersData = {
      ...data,
      totalPages: data.totalPages ?? Math.max(1, Math.ceil(data.total / data.limit)),
    };
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Users
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Manage user accounts, search, and moderation
          </p>
        </div>
        <CreateUserForm />
      </header>

      <Suspense
        fallback={
          <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
            <div className="h-10 w-48 animate-pulse rounded-xl bg-[var(--muted)]" />
          </div>
        }
      >
        <UsersTable
          users={usersData.users}
          total={usersData.total}
          page={usersData.page}
          limit={usersData.limit}
          totalPages={usersData.totalPages}
          filters={{
            email: params?.email ? String(params.email) : undefined,
            username: params?.username ? String(params.username) : undefined,
            isActive: params?.isActive ? String(params.isActive) : undefined,
            isBanned: params?.isBanned ? String(params.isBanned) : undefined,
            limit: params?.limit ? String(params.limit) : "10",
          }}
        />
      </Suspense>
    </div>
  );
}
