import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserById, type User } from "@/lib/api/admin-client";
import { UserEditForm } from "./user-edit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { ok, data } = await getUserById(id);

  if (!ok || !data || "message" in data) {
    notFound();
  }

  const user = data as User;

  return (
    <div className="p-8 transition-colors duration-300">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← Back to users
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Edit user
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          {user.email}
        </p>
      </header>

      <div className="max-w-xl">
        <UserEditForm user={user} />
      </div>
    </div>
  );
}
