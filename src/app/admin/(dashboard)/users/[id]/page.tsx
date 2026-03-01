import Link from "next/link";
import { getUserById } from "@/lib/api/admin-client";
import { UserEditForm } from "./user-edit-form";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ok, data } = await getUserById(id);

  if (!ok || !data || "message" in data) {
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

  const user = data as import("@/lib/api/admin-client").User;

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

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Edit user
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">{user.email}</p>
      </header>

      <div className="max-w-xl">
        <UserEditForm user={user} />
      </div>
    </div>
  );
}
