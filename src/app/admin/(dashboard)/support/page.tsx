import { Suspense } from "react";
import { getSupportFeedback } from "@/lib/api/admin-server-client";
import { SupportFeedbackTable } from "./support-feedback-table";

const LIMIT_OPTIONS = [10, 20, 50, 100] as const;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function SupportFeedbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(String(params?.page ?? "1"), 10));
  const limitParam = parseInt(String(params?.limit ?? "20"), 10);
  const limit = LIMIT_OPTIONS.includes(limitParam as (typeof LIMIT_OPTIONS)[number])
    ? limitParam
    : 20;

  const { ok, data } = await getSupportFeedback({ page, limit });
  const items = ok && data && typeof data === "object" && "items" in data ? (data as any).items : [];
  const pagination = ok && data && typeof data === "object" && "pagination" in data
    ? (data as any).pagination
    : { page: 1, limit, total: 0, totalPages: 1 };

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Support Feedback
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Review incoming support requests from users and troubleshoot context.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
            <div className="h-10 w-56 animate-pulse rounded-xl bg-[var(--muted)]" />
          </div>
        }
      >
        <SupportFeedbackTable
          items={items}
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={Math.max(1, pagination.totalPages)}
          filters={{
            limit: params?.limit ? String(params.limit) : "20",
          }}
        />
      </Suspense>
    </div>
  );
}
