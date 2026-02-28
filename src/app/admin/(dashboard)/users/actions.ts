"use server";

import { revalidatePath } from "next/cache";
import {
  createUser,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  resetUserPassword,
  makeUserAdmin,
} from "@/lib/api/admin-client";

export async function createUserAction(formData: FormData) {
  const username = formData.get("username")?.toString()?.trim();
  const email = formData.get("email")?.toString()?.trim();
  const password = formData.get("password")?.toString();

  if (!username || !email || !password) {
    return { error: "All fields are required." };
  }

  const { ok, status, data } = await createUser({ username, email, password });

  if (ok && (status === 200 || status === 201)) {
    revalidatePath("/admin/users");
    return { success: true };
  }

  const msg = (data as { message?: string }).message;
  return { error: msg ?? "Failed to create user." };
}

export async function updateUserAction(id: string, formData: FormData) {
  const body: Record<string, unknown> = {};
  const username = formData.get("username")?.toString()?.trim();
  const email = formData.get("email")?.toString()?.trim();
  const password = formData.get("password")?.toString();
  const isActive = formData.get("isActive");
  const isBanned = formData.get("isBanned");

  if (username) body.username = username;
  if (email) body.email = email;
  if (password && password.length > 0) body.password = password;
  if (isActive === "true" || isActive === "false") body.isActive = isActive === "true";
  if (isBanned === "true" || isBanned === "false") body.isBanned = isBanned === "true";

  const { ok, status, data } = await updateUser(id, body);

  if (ok && status === 200) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { success: true };
  }

  const msg = (data as { message?: string }).message;
  return { error: msg ?? "Failed to update user." };
}

export async function deleteUserAction(id: string) {
  const { ok, status, data } = await deleteUser(id);

  if (ok && status === 200) {
    revalidatePath("/admin/users");
    return { success: true };
  }

  const msg = (data as { message?: string }).message;
  return { error: msg ?? "Failed to delete user." };
}

export async function banUserAction(id: string) {
  const { ok, status, data } = await banUser(id);

  if (ok && status === 200) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { success: true };
  }

  const msg = (data as { message?: string }).message;
  return { error: msg ?? "Failed to ban user." };
}

export async function unbanUserAction(id: string) {
  const { ok, status, data } = await unbanUser(id);

  if (ok && status === 200) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { success: true };
  }

  const msg = (data as { message?: string }).message;
  return { error: msg ?? "Failed to unban user." };
}

export async function resetPasswordAction(id: string, newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const { ok, status, data } = await resetUserPassword(id, newPassword);

  if (ok && status === 200) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { success: true };
  }

  const msg = (data as { message?: string }).message;
  return { error: msg ?? "Failed to reset password." };
}

export async function makeAdminAction(userId: string) {
  const { ok, status, data } = await makeUserAdmin(userId);

  if (ok && status === 200) {
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  }

  const msg = (data as { message?: string }).message;
  return { error: msg ?? "Failed to make user admin." };
}
