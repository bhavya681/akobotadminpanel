"use server";

import { revalidatePath } from "next/cache";
import { revokeToken } from "@/lib/api/admin-client";

export async function revokeTokenAction(tokenId: string) {
  const { ok, status, data } = await revokeToken(tokenId);

  if (ok && status === 200) {
    revalidatePath("/admin/tokens");
    return { success: true };
  }

  const msg = (data as { message?: string }).message;
  return { error: msg ?? "Failed to revoke token." };
}
