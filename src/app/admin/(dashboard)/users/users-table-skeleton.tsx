export function UsersTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="h-10 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        <div className="h-10 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        <div className="h-10 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        <div className="h-10 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-6 py-4">
          <div className="flex gap-4">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 last:border-0"
          >
            <div className="flex gap-4 items-center">
              <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              <div className="h-4 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
