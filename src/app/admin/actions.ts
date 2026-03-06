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
  type User,
  type CreateModelInput,
  type CreatePackageInput,
} from "@/lib/api/admin-client";

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
  const includedCredits = formData.get("includedCredits")?.toString();
  const actualPrice = formData.get("actualPrice")?.toString();
  const currentPrice = formData.get("currentPrice")?.toString();
  if (!name || !includedCredits || !actualPrice || !currentPrice) {
    return { ok: false, error: "Name, credits, actual price, and current price are required." };
  }
  const body: CreatePackageInput = {
    name,
    includedCredits: parseInt(includedCredits, 10),
    actualPrice: parseInt(actualPrice, 10),
    currentPrice: parseInt(currentPrice, 10),
    description: formData.get("description")?.toString()?.trim() || undefined,
    offer: formData.get("offer")?.toString()?.trim() || null,
    isActive: formData.get("isActive") !== "false",
    sortOrder: formData.get("sortOrder")
      ? parseInt(String(formData.get("sortOrder")), 10)
      : undefined,
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
  const includedCredits = formData.get("includedCredits")?.toString();
  if (includedCredits) body.includedCredits = parseInt(includedCredits, 10);
  const actualPrice = formData.get("actualPrice")?.toString();
  if (actualPrice) body.actualPrice = parseInt(actualPrice, 10);
  const currentPrice = formData.get("currentPrice")?.toString();
  if (currentPrice) body.currentPrice = parseInt(currentPrice, 10);
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
