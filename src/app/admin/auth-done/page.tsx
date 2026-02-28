"use client";

import { useEffect } from "react";

export default function AuthDonePage() {
  useEffect(() => {
    const hasAuth = document.cookie.includes("admin_authenticated=true");
    if (hasAuth) {
      window.location.replace("/admin");
    } else {
      window.location.replace("/admin/login?error=" + encodeURIComponent("Session failed. Please try again."));
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}
