import { getAdminPackages } from "@/lib/api/admin-client";
import { PackagesTable } from "./packages-table";
import { CreatePackageForm } from "./create-package-form";

function parsePackages(data: unknown): import("@/lib/api/admin-client").Package[] {
  if (Array.isArray(data)) return data;
  return [];
}

export default async function PackagesPage() {
  const { ok, data } = await getAdminPackages();
  const packages = ok ? parsePackages(data) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Packages
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Manage credit packages for the pricing page. Active packages appear on the frontend.
          </p>
        </div>
        <CreatePackageForm />
      </header>

      <PackagesTable packages={packages} />
    </div>
  );
}
