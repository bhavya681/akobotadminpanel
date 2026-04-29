import { Suspense } from "react";
import { getUsers, searchUserByEmail } from "@/lib/api/admin-server-client";
import { UsersTable } from "./users-table";
import { CreateUserForm } from "./create-user-form";

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function parseBooleanParam(value: string | undefined): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseNumberParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

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

  // Build filters from search params
  const email = String(params?.email ?? "").trim();
  const username = String(params?.username ?? "").trim();
  const isActive = parseBooleanParam(params?.isActive as string | undefined);
  const isBanned = parseBooleanParam(params?.isBanned as string | undefined);
  const role = params?.role as "admin" | "user" | undefined;
  const hasPurchasedCredits = parseBooleanParam(params?.hasPurchasedCredits as string | undefined);
  const creditsMin = parseNumberParam(params?.creditsMin as string | undefined);
  const creditsMax = parseNumberParam(params?.creditsMax as string | undefined);
  const planType = String(params?.planType ?? "").trim() || undefined;
  const createdAfter = String(params?.createdAfter ?? "").trim() || undefined;
  const createdBefore = String(params?.createdBefore ?? "").trim() || undefined;
  const sortBy = params?.sortBy as "createdAt" | "lastLogin" | "credits" | "username" | undefined;
  const sortOrder = params?.sortOrder as "asc" | "desc" | undefined;

  let usersData: {
    users: import("@/lib/api/admin-client").User[];
    pagination: import("@/lib/api/admin-client").PaginatedUsers["pagination"];
    filters: Record<string, any>;
  };

  if (email) {
    const res = await searchUserByEmail(email);
    if (res.ok && res.data && typeof res.data === "object" && !("message" in res.data)) {
      usersData = {
        users: [res.data as import("@/lib/api/admin-client").User],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          limit: 1,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        },
        filters: { email },
      };
    } else {
      usersData = {
        users: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        },
        filters: { email },
      };
    }
  } else {
    const res = await getUsers({
      page,
      limit,
      username: username || undefined,
      email: email || undefined,
      isActive,
      isBanned,
      role,
      hasPurchasedCredits,
      creditsMin,
      creditsMax,
      planType,
      createdAfter,
      createdBefore,
      sortBy,
      sortOrder,
    });
    const data = (res.ok && typeof res.data === "object" && res.data
      ? res.data
      : { users: [], pagination: { currentPage: 1, totalPages: 0, totalCount: 0, limit: 10, hasNextPage: false, hasPrevPage: false, nextPage: null, prevPage: null }, filters: {} }) as any;
    usersData = {
      users: data.users || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      },
      filters: data.filters || {},
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
          total={usersData.pagination.totalCount}
          page={usersData.pagination.currentPage}
          limit={usersData.pagination.limit}
          totalPages={usersData.pagination.totalPages}
          filters={{
            email: params?.email ? String(params.email) : undefined,
            username: params?.username ? String(params.username) : undefined,
            isActive: params?.isActive ? String(params.isActive) : undefined,
            isBanned: params?.isBanned ? String(params.isBanned) : undefined,
            role: params?.role ? String(params.role) : undefined,
            hasPurchasedCredits: params?.hasPurchasedCredits ? String(params.hasPurchasedCredits) : undefined,
            creditsMin: params?.creditsMin ? String(params.creditsMin) : undefined,
            creditsMax: params?.creditsMax ? String(params.creditsMax) : undefined,
            planType: params?.planType ? String(params.planType) : undefined,
            createdAfter: params?.createdAfter ? String(params.createdAfter) : undefined,
            createdBefore: params?.createdBefore ? String(params.createdBefore) : undefined,
            sortBy: params?.sortBy ? String(params.sortBy) : undefined,
            sortOrder: params?.sortOrder ? String(params.sortOrder) : undefined,
            limit: params?.limit ? String(params.limit) : "10",
          }}
        />
      </Suspense>
    </div>
  );
}
