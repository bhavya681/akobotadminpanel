import { redirect } from "next/navigation";

/** Short URL → admin configuration UI */
export default function ConfigsRedirectPage() {
  redirect("/admin/configs");
}
