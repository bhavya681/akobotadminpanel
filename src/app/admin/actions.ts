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
  type User,
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
