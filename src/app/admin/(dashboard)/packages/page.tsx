import { getAdminModels, getAdminPackages, getToolSummaries } from "@/lib/api/admin-server-client";
import { isAllowedLlmModel } from "@/lib/llm-whitelist";
import { PackagesTable } from "./packages-table";
import { CreatePackageForm } from "./create-package-form";

const MODEL_CATEGORIES = [
  "llm",
  "image",
  "video",
  "image_to_image",
  "audio",
  "music",
] as const;

function parsePackages(data: unknown): import("@/lib/api/admin-client").Package[] {
  if (Array.isArray(data)) return data;
  return [];
}

function flattenModels(
  data: Record<string, unknown>
): import("@/lib/api/admin-client").RegistryModel[] {
  const out: import("@/lib/api/admin-client").RegistryModel[] = [];

  for (const category of MODEL_CATEGORIES) {
    const models = data[category];
    if (!Array.isArray(models)) continue;

    for (const model of models) {
      if (model && typeof model === "object" && "modelId" in model) {
        const registryModel = model as import("@/lib/api/admin-client").RegistryModel;
        if (category === "llm" && !isAllowedLlmModel(registryModel)) continue;
        out.push(registryModel);
      }
    }
  }

  return out;
}

export default async function PackagesPage() {
  const [{ ok, data }, { ok: modelsOk, data: modelsData }, { ok: toolsOk, data: toolsData }] = await Promise.all([
    getAdminPackages(),
    getAdminModels(),
    getToolSummaries(),
  ]);
  const packages = ok ? parsePackages(data) : [];
  const models = modelsOk && modelsData ? flattenModels(modelsData as Record<string, unknown>) : [];
  const toolSummaries =
    toolsOk && toolsData && Array.isArray((toolsData as { tools?: unknown[] }).tools)
      ? ((toolsData as { tools: import("@/lib/api/admin-client").ToolSummary[] }).tools ?? [])
      : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Packages
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--muted-foreground)]">
            Manage pricing plans, custom rule rows, and which registry models each package can access.
            Package prices are always stored in the package currency (INR or USD). The admin panel does not convert currencies; Razorpay checkout conversion from USD to INR is handled by the backend.
          </p>
        </div>
        <CreatePackageForm models={models} toolSummaries={toolSummaries} />
      </header>

      <PackagesTable packages={packages} models={models} toolSummaries={toolSummaries} />
    </div>
  );
}
