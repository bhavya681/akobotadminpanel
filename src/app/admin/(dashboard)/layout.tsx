import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminNav } from "./admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_authenticated")?.value === "true";

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors duration-300">
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Akeo" width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Admin Panel</span>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <AdminNav />
        </nav>
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <span>🚪</span>
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-white dark:bg-black transition-colors duration-300">
        {children}
      </main>
    </div>
  );
}
