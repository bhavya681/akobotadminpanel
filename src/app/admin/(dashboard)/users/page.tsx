import { UsersTable } from "./users-table";
import { CreateUserForm } from "./create-user-form";
import { getUsers, searchUserByEmail, type User } from "@/lib/api/admin-client";

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string; email?: string; username?: string; isActive?: string; isBanned?: string }>;
}

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limitParam = parseInt(params.limit ?? "10", 10);
  const limit = LIMIT_OPTIONS.includes(limitParam as (typeof LIMIT_OPTIONS)[number])
    ? limitParam
    : 10;

  let usersData: { users: User[]; total: number; page: number; limit: number; totalPages: number };
  if (params.email?.trim()) {
    const searchRes = await searchUserByEmail(params.email.trim());
    if (searchRes.ok && searchRes.data && !("message" in searchRes.data)) {
      usersData = {
        users: [searchRes.data as User],
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      };
    } else {
      usersData = { users: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  } else {
    const res = await getUsers({
      page,
      limit,
      username: params.username?.trim() || undefined,
      email: params.email?.trim() || undefined,
      isActive: params.isActive === "true" ? true : params.isActive === "false" ? false : undefined,
      isBanned: params.isBanned === "true" ? true : params.isBanned === "false" ? false : undefined,
    });
    usersData = res.ok
      ? { ...res.data, totalPages: res.data.totalPages ?? Math.max(1, Math.ceil(res.data.total / res.data.limit)) }
      : { users: [], total: 0, page: 1, limit, totalPages: 0 };
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
        <CreateUserForm />
      </header>

      <UsersTable
        users={usersData.users}
        total={usersData.total}
        page={page}
        limit={usersData.limit}
        totalPages={usersData.totalPages ?? (Math.ceil(usersData.total / usersData.limit) || 1)}
        filters={{
          email: params.email,
          username: params.username,
          isActive: params.isActive,
          isBanned: params.isBanned,
          limit: params.limit ?? "10",
        }}
      />
    </div>
  );
}
