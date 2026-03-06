import { getAdminModels } from "@/lib/api/admin-client";
import { ModelsTable } from "./models-table";
import { CreateModelForm } from "./create-model-form";

const CATEGORIES = [
  "llm",
  "image",
  "video",
  "image_to_image",
  "audio",
  "music",
] as const;

function flattenModels(
  data: Record<string, unknown>
): { model: import("@/lib/api/admin-client").RegistryModel; category: string }[] {
  const out: { model: import("@/lib/api/admin-client").RegistryModel; category: string }[] = [];
  for (const cat of CATEGORIES) {
    const arr = data[cat];
    if (Array.isArray(arr)) {
      for (const m of arr) {
        if (m && typeof m === "object" && "modelId" in m) {
          out.push({ model: m as import("@/lib/api/admin-client").RegistryModel, category: cat });
        }
      }
    }
  }
  return out;
}

export default async function ModelsPage() {
  const { ok, data } = await getAdminModels();
  const modelsWithCategory = ok && data ? flattenModels(data as Record<string, unknown>) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Model Registry
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Manage AI models (LLM, image, video, audio, music). Add, edit, or deactivate models.
          </p>
        </div>
        <CreateModelForm />
      </header>

      <ModelsTable models={modelsWithCategory} />
    </div>
  );
}
