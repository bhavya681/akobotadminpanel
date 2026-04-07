import { getAdminConfigs } from "@/lib/api/admin-client";
import { CreateConfigForm } from "./create-config-form";
import { ConfigsTable } from "./configs-table";
import { ConfigKeyLookup } from "./config-key-lookup";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ConfigsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category : undefined;

  const res = await getAdminConfigs(category);
  const configs = res.ok ? res.data : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Configuration
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--muted-foreground)]">
            Manage server-side config keys (feature flags, SMTP, URLs). Maps to{" "}
            <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm">
              GET/PATCH/DELETE /api/configs/&#123;key&#125;
            </code>{" "}
            and{" "}
            <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm">
              GET/POST /api/configs
            </code>
            .
          </p>
        </div>
        <CreateConfigForm />
      </header>

      <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        <h2 className="mb-3 text-sm font-medium text-[var(--foreground)]">
          Filter &amp; lookup
        </h2>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <form
            className="flex w-full max-w-md flex-wrap items-end gap-2"
            action="/admin/configs"
            method="get"
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor="category"
                className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]"
              >
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                defaultValue={category ?? ""}
                placeholder="e.g. smtp"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:opacity-90"
            >
              Apply
            </button>
            {category ? (
              <a
                href="/admin/configs"
                className="rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Clear
              </a>
            ) : null}
          </form>
          <ConfigKeyLookup />
        </div>
      </section>

      <ConfigsTable configs={configs} />
    </div>
  );
}
