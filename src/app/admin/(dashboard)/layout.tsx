import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminAuthProvider } from "@/components/admin-auth-provider";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin/login");
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
