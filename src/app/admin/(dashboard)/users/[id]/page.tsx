import Link from "next/link";
import { getUserFullDetails } from "@/lib/api/admin-server-client";
import { UserDetailView } from "./user-detail-view";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ok, data } = await getUserFullDetails(id);

  if (!ok || !data || (typeof data === "object" && "message" in data)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-[var(--muted-foreground)]">User not found</p>
        <Link
          href="/admin/users"
          className="mt-4 inline-block text-sm text-[var(--foreground)] hover:underline"
        >
          ← Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to users
      </Link>

      <UserDetailView data={data as any} />
    </div>
  );
}
