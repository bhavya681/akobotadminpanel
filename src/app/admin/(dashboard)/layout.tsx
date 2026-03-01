"use client";

import { AdminAuthProvider } from "@/components/admin-auth-provider";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
