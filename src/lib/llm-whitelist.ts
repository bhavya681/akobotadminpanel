import type { RegistryModel } from "@/lib/api/admin-client";

/**
 * Display names of the only LLM models that should be exposed in the admin UI.
 * Other LLM models returned by the backend are hidden (filtered out) wherever
 * this list is enforced. Non-LLM categories (image, video, audio, etc.) are
 * unaffected.
 *
 * Match is case-insensitive and ignores extra whitespace.
 */
export const ALLOWED_LLM_DISPLAY_NAMES = [
  "GLM 4.7 flash",
  "GLM 4.7 standard",
  "Kimi 2.5",
  "Deepseek v3",
  "Deepseek v4 flash",
] as const;

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

const NORMALIZED_ALLOWED = new Set(
  ALLOWED_LLM_DISPLAY_NAMES.map((name) => normalize(name))
);

export function isAllowedLlmModel(model: Pick<RegistryModel, "displayName">): boolean {
  if (!model?.displayName) return false;
  return NORMALIZED_ALLOWED.has(normalize(model.displayName));
}

/**
 * Filter a list of registry models so that LLM-category entries are restricted
 * to the whitelisted display names. Non-LLM entries pass through untouched.
 */
export function filterLlmWhitelist<T extends { category?: string; displayName?: string }>(
  models: T[]
): T[] {
  return models.filter((model) => {
    if (model.category !== "llm") return true;
    return isAllowedLlmModel(model as { displayName?: string } as RegistryModel);
  });
}
