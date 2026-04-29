import { Suspense } from "react";
import { getAllUserUpdateLogs } from "@/lib/api/admin-server-client";
import { LogsTable } from "./logs-table";
import { LogsFilter } from "./logs-filter";

const LIMIT_OPTIONS = [25, 50, 100] as const;
const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "USER_CREATED", label: "User Created" },
  { value: "USER_UPDATED", label: "User Updated" },
  { value: "PASSWORD_CHANGED", label: "Password Changed" },
  { value: "OAUTH_LINKED", label: "OAuth Linked" },
  { value: "BANNED", label: "Banned" },
  { value: "ACTIVATION_CHANGED", label: "Activation Changed" },
  { value: "CREDITS_CHANGED", label: "Credits Changed" },
  { value: "PROFILE_CHANGED", label: "Profile Changed" },
  { value: "USER_DELETED", label: "User Deleted" },
];

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function LogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(String(params?.page ?? "1"), 10));
  const limitParam = parseInt(String(params?.limit ?? "25"), 10);
  const limit = LIMIT_OPTIONS.includes(limitParam as (typeof LIMIT_OPTIONS)[number])
    ? limitParam
    : 25;
  const action = String(params?.action ?? "").trim();
  const email = String(params?.email ?? "").trim();
  const userId = String(params?.userId ?? "").trim();

  const res = await getAllUserUpdateLogs({
    page,
    limit,
    ...(action ? { action } : {}),
    ...(email ? { email } : {}),
    ...(userId ? { userId } : {}),
  });

  const data = res.ok && res.data
    ? (res.data as {
        logs: any[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      })
    : { logs: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            User Update Logs
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Track every change made to user accounts — password changes, OAuth linking, bans, and more
          </p>
        </div>
      </header>

      <LogsFilter
        actionOptions={ACTION_OPTIONS}
        currentAction={action}
        currentEmail={email}
        currentUserId={userId}
      />

      <Suspense fallback={<LogsSkeleton />}>
        <LogsTable
          logs={data.logs}
          pagination={data.pagination}
          limitOptions={LIMIT_OPTIONS}
        />
      </Suspense>
    </div>
  );
}

function LogsSkeleton() {
  return (
    <div className="mt-6 animate-pulse">
      <div className="h-10 bg-[var(--muted)] rounded-lg mb-4"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-[var(--muted)] rounded-lg mb-2"></div>
      ))}
    </div>
  );
}
