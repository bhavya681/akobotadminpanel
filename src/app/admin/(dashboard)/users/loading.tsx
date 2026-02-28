import { UsersTableSkeleton } from "./users-table-skeleton";

export default function UsersLoading() {
  return (
    <div className="p-8 transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-32 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
      </div>
      <UsersTableSkeleton />
    </div>
  );
}
