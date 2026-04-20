"use server";

import { revalidatePath } from "next/cache";
import {
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  banUser as banUserApi,
  unbanUser as unbanUserApi,
  resetUserPassword as resetUserPasswordApi,
  makeUserAdmin as makeUserAdminApi,
  unlinkUserOAuth as unlinkUserOAuthApi,
  revokeToken as revokeTokenApi,
  createModel as createModelApi,
  updateModel as updateModelApi,
  deleteModel as deleteModelApi,
  seedModels as seedModelsApi,
  updateGalleryItem as updateGalleryItemApi,
  deleteGalleryItem as deleteGalleryItemApi,
  createPackage as createPackageApi,
  updatePackage as updatePackageApi,
  deletePackage as deletePackageApi,
  walletAction as walletActionApi,
  createConfig as createConfigApi,
  updateConfig as updateConfigApi,
  deleteConfig as deleteConfigApi,
  getConfigByKey as getConfigByKeyApi,
  type User,
  type CreateModelInput,
  type CreatePackageInput,
  type CreateConfigInput,
  type PackageRule,
} from "@/lib/api/admin-client";

function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  const raw = value?.toString()?.trim();
  if (!raw) {
    return fallback;
  }

  return JSON.parse(raw) as T;
}

function parsePackageRules(value: FormDataEntryValue | null): PackageRule[] {
  const parsed = parseJsonField<PackageRule[]>(value, []);
  if (!Array.isArray(parsed)) {
    throw new Error("Rules must be a JSON array.");
  }

  return parsed
    .map((rule) => ({
      key: String(rule?.key ?? "").trim() || undefined,
      label: String(rule?.label ?? "").trim(),
      value: String(rule?.value ?? "").trim(),
      description: String(rule?.description ?? "").trim() || undefined,
      resource: String(rule?.resource ?? "").trim() || undefined,
      limit:
        rule?.limit === undefined || rule?.limit === null || String(rule.limit).trim() === ""
          ? undefined
          : Number(rule.limit),
      window: String(rule?.window ?? "").trim() || undefined,
      unit: String(rule?.unit ?? "").trim() || undefined,
    }))
    .filter((rule) => rule.label && rule.value);
}

function parseAllowedModelIds(value: FormDataEntryValue | null): string[] {
  const parsed = parseJsonField<string[]>(value, []);
  if (!Array.isArray(parsed)) {
    throw new Error("Allowed models must be a JSON array.");
  }

  return [...new Set(parsed.map((item) => String(item).trim()).filter(Boolean))];
}

function parseAllowedToolNames(value: FormDataEntryValue | null): string[] {
  const parsed = parseJsonField<string[]>(value, []);
  if (!Array.isArray(parsed)) {
    throw new Error("Allowed tools must be a JSON array.");
  }

  return [...new Set(parsed.map((item) => String(item).trim()).filter(Boolean))];
}

function parseConfigArrayValue(raw: string | null | undefined): unknown[] {
  const input = raw?.trim() ?? "";
  if (!input) {
    throw new Error("Array items are required.");
  }

  try {
    const parsed = JSON.parse(input) as unknown;
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall back to line-by-line parsing below.
  }

  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as unknown;
      } catch {
        return line;
      }
    });
}

export async function createUserAction(formData: FormData) {
  const username = formData.get("username")?.toString()?.trim();
  const email = formData.get("email")?.toString()?.trim();
  const password = formData.get("password")?.toString();
  if (!username || !email || !password) {
    return { ok: false, error: "All fields are required." };
  }
  const { ok, data } = await createUserApi({ username, email, password });
  if (ok && data && !("message" in data)) {
    revalidatePath("/admin/users");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to create user.",
  };
}

export async function updateUserAction(id: string, formData: FormData) {
  const username = formData.get("username")?.toString()?.trim();
  const email = formData.get("email")?.toString()?.trim();
  const password = formData.get("password")?.toString()?.trim();
  const isActive = formData.get("isActive");
  const isBanned = formData.get("isBanned");
  const body: Partial<User> = {};
  if (username) body.username = username;
  if (email) body.email = email;
  if (password) body.password = password;
  if (isActive !== null && isActive !== undefined) body.isActive = isActive === "true";
  if (isBanned !== null && isBanned !== undefined) body.isBanned = isBanned === "true";
  const { ok, data } = await updateUserApi(id, body);
  if (ok && data && !("message" in data)) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to update user.",
  };
}

export async function deleteUserAction(id: string) {
  const { ok, data } = await deleteUserApi(id);
  if (ok) {
    revalidatePath("/admin/users");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to delete user.",
  };
}

export async function banUserAction(id: string) {
  const { ok, data } = await banUserApi(id);
  if (ok) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to ban user.",
  };
}

export async function unbanUserAction(id: string) {
  const { ok, data } = await unbanUserApi(id);
  if (ok) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to unban user.",
  };
}

export async function resetUserPasswordAction(id: string, newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  const { ok, data } = await resetUserPasswordApi(id, newPassword);
  if (ok) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to reset password.",
  };
}

export async function makeUserAdminAction(userId: string) {
  const { ok, data } = await makeUserAdminApi(userId);
  if (ok) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to make admin.",
  };
}

function generateAutoPassword() {
  return `Auto#${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}aA1`;
}

export async function unlinkUserOAuthAction(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, error: "Email is required." };
  }
  const generatedPassword = generateAutoPassword();
  const { ok, data } = await unlinkUserOAuthApi(normalizedEmail, generatedPassword);
  if (ok) {
    revalidatePath("/admin/users");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to unlink Google account.",
  };
}

export async function revokeTokenAction(tokenId: string) {
  const { ok, data } = await revokeTokenApi(tokenId);
  if (ok) {
    revalidatePath("/admin/tokens");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to revoke token.",
  };
}

// --- Model Registry ---
export async function createModelAction(formData: FormData) {
  const modelId = formData.get("modelId")?.toString()?.trim();
  const displayName = formData.get("displayName")?.toString()?.trim();
  const category = formData.get("category")?.toString()?.trim();
  if (!modelId || !displayName || !category) {
    return { ok: false, error: "modelId, displayName, and category are required." };
  }
  const body: CreateModelInput = {
    modelId,
    displayName,
    category: category as CreateModelInput["category"],
    provider: formData.get("provider")?.toString()?.trim() || undefined,
    costPerRequest: formData.get("costPerRequest")
      ? parseInt(String(formData.get("costPerRequest")), 10)
      : undefined,
    endpoint: formData.get("endpoint")?.toString()?.trim() || undefined,
    description: formData.get("description")?.toString()?.trim() || undefined,
    isActive: formData.get("isActive") !== "false",
    sortOrder: formData.get("sortOrder")
      ? parseInt(String(formData.get("sortOrder")), 10)
      : undefined,
  };
  const { ok, data } = await createModelApi(body);
  if (ok && data && !("message" in data)) {
    revalidatePath("/admin/models");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to create model.",
  };
}

export async function updateModelAction(id: string, formData: FormData) {
  const body: Partial<CreateModelInput> = {};
  const modelId = formData.get("modelId")?.toString()?.trim();
  const displayName = formData.get("displayName")?.toString()?.trim();
  const category = formData.get("category")?.toString()?.trim();
  if (modelId) body.modelId = modelId;
  if (displayName) body.displayName = displayName;
  if (category) body.category = category as CreateModelInput["category"];
  const provider = formData.get("provider")?.toString()?.trim();
  if (provider !== undefined) body.provider = provider || undefined;
  const costPerRequest = formData.get("costPerRequest")?.toString();
  if (costPerRequest !== undefined)
    body.costPerRequest = costPerRequest ? parseInt(costPerRequest, 10) : undefined;
  const endpoint = formData.get("endpoint")?.toString()?.trim();
  if (endpoint !== undefined) body.endpoint = endpoint || undefined;
  const description = formData.get("description")?.toString()?.trim();
  if (description !== undefined) body.description = description || undefined;
  const isActive = formData.get("isActive");
  if (isActive !== null && isActive !== undefined)
    body.isActive = isActive === "true";
  const sortOrder = formData.get("sortOrder")?.toString();
  if (sortOrder !== undefined)
    body.sortOrder = sortOrder ? parseInt(sortOrder, 10) : undefined;

  const { ok, data } = await updateModelApi(id, body);
  if (ok && data && !("message" in data)) {
    revalidatePath("/admin/models");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to update model.",
  };
}

export async function deleteModelAction(id: string) {
  const { ok, data } = await deleteModelApi(id);
  if (ok) {
    revalidatePath("/admin/models");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to delete model.",
  };
}

export async function seedModelsAction(models: CreateModelInput[]) {
  const { ok, data } = await seedModelsApi(models);
  if (ok) {
    revalidatePath("/admin/models");
    return { ok: true, data };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to seed models.",
  };
}

// --- Gallery ---
export async function updateGalleryItemAction(id: string, body: { isPrivate?: boolean }) {
  const { ok, data } = await updateGalleryItemApi(id, body);
  if (ok && data && !("message" in data)) {
    revalidatePath("/admin/gallery");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to update gallery item.",
  };
}

export async function deleteGalleryItemAction(id: string) {
  const { ok, data } = await deleteGalleryItemApi(id);
  if (ok) {
    revalidatePath("/admin/gallery");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to delete gallery item.",
  };
}

// --- Packages ---
export async function createPackageAction(formData: FormData) {
  const name = formData.get("name")?.toString()?.trim();
  const planType = formData.get("planType")?.toString()?.trim() || "credits";
  const isQuotaPlan = planType === "quota";
  const includedCredits = formData.get("includedCredits")?.toString();
  const actualPrice = formData.get("actualPrice")?.toString();
  const currentPrice = formData.get("currentPrice")?.toString();
  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (!isQuotaPlan && (!includedCredits || !actualPrice || !currentPrice)) {
    return { ok: false, error: "Credits, actual price, and current price are required for credit-based plans." };
  }
  let rules: PackageRule[] = [];
  let allowedModelIds: string[] = [];
  let allowedToolNames: string[] = [];
  try {
    rules = parsePackageRules(formData.get("rulesJson"));
    allowedModelIds = parseAllowedModelIds(formData.get("allowedModelIdsJson"));
    allowedToolNames = parseAllowedToolNames(formData.get("allowedToolNamesJson"));
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid package metadata.",
    };
  }

  const currencyRaw = formData.get("currency")?.toString();
  const currency = currencyRaw === "USD" ? "USD" : "INR";

  const body: CreatePackageInput = {
    name,
    planType: planType as "credits" | "quota",
    isFreeDefault: formData.get("isFreeDefault") === "true",
    includedCredits: includedCredits ? parseInt(includedCredits, 10) : 0,
    actualPrice: actualPrice ? parseInt(actualPrice, 10) : 0,
    currentPrice: currentPrice ? parseInt(currentPrice, 10) : 0,
    currency,
    description: formData.get("description")?.toString()?.trim() || undefined,
    offer: formData.get("offer")?.toString()?.trim() || null,
    isActive: formData.get("isActive") !== "false",
    sortOrder: formData.get("sortOrder")
      ? parseInt(String(formData.get("sortOrder")), 10)
      : undefined,
    rules,
    allowedModelIds,
    allowedToolNames,
  };
  const { ok, data } = await createPackageApi(body);
  if (ok && data && !("message" in data)) {
    revalidatePath("/admin/packages");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to create package.",
  };
}

export async function updatePackageAction(id: string, formData: FormData) {
  const body: Partial<CreatePackageInput> = {};
  const name = formData.get("name")?.toString()?.trim();
  if (name) body.name = name;
  const planType = formData.get("planType")?.toString()?.trim();
  if (planType === "credits" || planType === "quota") body.planType = planType;
  const isFreeDefault = formData.get("isFreeDefault");
  if (isFreeDefault !== null && isFreeDefault !== undefined)
    body.isFreeDefault = isFreeDefault === "true";
  const includedCredits = formData.get("includedCredits")?.toString();
  if (includedCredits !== undefined && includedCredits !== null) body.includedCredits = includedCredits ? parseInt(includedCredits, 10) : 0;
  const actualPrice = formData.get("actualPrice")?.toString();
  if (actualPrice !== undefined && actualPrice !== null) body.actualPrice = actualPrice ? parseInt(actualPrice, 10) : 0;
  const currentPrice = formData.get("currentPrice")?.toString();
  if (currentPrice !== undefined && currentPrice !== null) body.currentPrice = currentPrice ? parseInt(currentPrice, 10) : 0;
  const currencyRaw = formData.get("currency")?.toString();
  if (currencyRaw === "INR" || currencyRaw === "USD") body.currency = currencyRaw;
  const description = formData.get("description")?.toString()?.trim();
  if (description !== undefined) body.description = description || undefined;
  const offer = formData.get("offer")?.toString()?.trim();
  if (offer !== undefined) body.offer = offer || null;
  const isActive = formData.get("isActive");
  if (isActive !== null && isActive !== undefined)
    body.isActive = isActive === "true";
  const sortOrder = formData.get("sortOrder")?.toString();
  if (sortOrder !== undefined)
    body.sortOrder = sortOrder ? parseInt(sortOrder, 10) : undefined;

  try {
    body.rules = parsePackageRules(formData.get("rulesJson"));
    body.allowedModelIds = parseAllowedModelIds(formData.get("allowedModelIdsJson"));
    body.allowedToolNames = parseAllowedToolNames(formData.get("allowedToolNamesJson"));
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid package metadata.",
    };
  }

  const { ok, data } = await updatePackageApi(id, body);
  if (ok && data && !("message" in data)) {
    revalidatePath("/admin/packages");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to update package.",
  };
}

export async function deletePackageAction(id: string) {
  const { ok, data } = await deletePackageApi(id);
  if (ok) {
    revalidatePath("/admin/packages");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to delete package.",
  };
}

// --- Wallet ---
// --- App configuration ---
function parseConfigValue(
  valueType: string,
  raw: string | null | undefined
): unknown {
  const v = raw?.trim() ?? "";
  if (valueType === "array") {
    return parseConfigArrayValue(raw);
  }
  if (valueType === "json") {
    if (!v) return undefined;
    try {
      return JSON.parse(v) as unknown;
    } catch {
      throw new Error("Invalid JSON for value.");
    }
  }
  if (valueType === "number") {
    if (!v) return undefined;
    const n = Number(v);
    if (Number.isNaN(n)) throw new Error("Value must be a number.");
    return n;
  }
  if (valueType === "boolean") {
    return v === "true" || v === "1";
  }
  return v || undefined;
}

export async function createConfigAction(formData: FormData) {
  const key = formData.get("key")?.toString()?.trim();
  const valueType = formData.get("valueType")?.toString()?.trim() ?? "string";
  if (!key) {
    return { ok: false, error: "Key is required." };
  }
  const category = formData.get("category")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim();
  let value: unknown;
  try {
    value = parseConfigValue(valueType, formData.get("value")?.toString());
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid value." };
  }
  const body: CreateConfigInput = {
    key,
    valueType,
    category: category || undefined,
    description: description || undefined,
    isSecret: formData.get("isSecret") === "true",
    isActive: formData.get("isActive") !== "false",
    ...(valueType === "array"
      ? { arrayItems: Array.isArray(value) ? value : [] }
      : value !== undefined
        ? { value }
        : {}),
  };
  const { ok, data } = await createConfigApi(body);
  if (ok) {
    revalidatePath("/admin/configs");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to create configuration.",
  };
}

export async function updateConfigAction(key: string, formData: FormData) {
  const valueType = formData.get("valueType")?.toString()?.trim();
  const category = formData.get("category")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim();
  const body: Partial<CreateConfigInput> = {};
  if (category !== undefined) body.category = category || undefined;
  if (description !== undefined) body.description = description || undefined;
  if (valueType) body.valueType = valueType;
  const isSecret = formData.get("isSecret");
  if (isSecret !== null && isSecret !== undefined) body.isSecret = isSecret === "true";
  const isActive = formData.get("isActive");
  if (isActive !== null && isActive !== undefined) body.isActive = isActive === "true";
  const vt = valueType ?? "string";
  try {
    const value = parseConfigValue(vt, formData.get("value")?.toString());
    if (vt === "array") {
      body.arrayItems = Array.isArray(value) ? value : [];
      body.value = null;
    } else if (value !== undefined) {
      body.value = value;
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid value." };
  }
  const { ok, data } = await updateConfigApi(key, body);
  if (ok) {
    revalidatePath("/admin/configs");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to update configuration.",
  };
}

export async function deleteConfigAction(key: string) {
  const { ok, data } = await deleteConfigApi(key);
  if (ok) {
    revalidatePath("/admin/configs");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to delete configuration.",
  };
}

/** GET /api/configs/{key} — response is value or {} (no enumeration leak). */
export async function lookupConfigByKeyAction(key: string) {
  const k = key?.trim();
  if (!k) {
    return { ok: false as const, error: "Enter a config key." };
  }
  const { ok, data } = await getConfigByKeyApi(k);
  if (!ok) {
    return {
      ok: false as const,
      error: (data as { message?: string })?.message ?? "Lookup failed.",
    };
  }
  return {
    ok: true as const,
    preview: JSON.stringify(data, null, 2),
  };
}

export async function walletActionAction(formData: FormData) {
  const userId = formData.get("userId")?.toString()?.trim();
  const amountStr = formData.get("amount")?.toString();
  const action = formData.get("action")?.toString()?.trim();
  if (!userId || !amountStr || !action) {
    return { ok: false, error: "User ID, amount, and action are required." };
  }
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be a positive number." };
  }
  if (action !== "credit" && action !== "debit") {
    return { ok: false, error: "Action must be credit or debit." };
  }
  const remark = formData.get("remark")?.toString()?.trim();
  const { ok, data } = await walletActionApi({
    userId,
    amount,
    action: action as "credit" | "debit",
    remark: remark || undefined,
  });
  if (ok) {
    revalidatePath("/admin/wallet");
    return { ok: true };
  }
  return {
    ok: false,
    error: (data as { message?: string })?.message ?? "Failed to perform wallet action.",
  };
}
