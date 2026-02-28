"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.akobot.ai";

function HomeLoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setIsPending(true);
    const form = e.currentTarget;
    const identifier = (form.elements.namedItem("identifier") as HTMLInputElement)?.value?.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;

    try {
      const base = API_URL.replace(/\/$/, "");
      let res: Response;
      let data: { accessToken?: string; token?: string; message?: string };
      try {
        res = await fetch(`${base}/admin/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });
        data = (await res.json().catch(() => ({}))) as typeof data;
      } catch {
        const proxyRes = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });
        const proxyData = (await proxyRes.json().catch(() => ({}))) as { success?: boolean; token?: string; error?: string };
        if (proxyData.success && proxyData.token) {
          await fetch("/api/admin/set-session?t=" + encodeURIComponent(proxyData.token), { credentials: "include" });
          window.location.href = "/admin";
          return;
        }
        setSubmitError(proxyData.error || "Login failed. Please try again.");
        return;
      }
      const token = data.accessToken ?? data.token;
      if (token && (res.status === 200 || res.status === 201)) {
        await fetch("/api/admin/set-session?t=" + encodeURIComponent(token), { credentials: "include" });
        window.location.href = "/admin";
        return;
      }
      const errMsg = res.status === 401 ? "Invalid credentials or insufficient privileges." : (data.message || "Login failed. Please try again.");
      setSubmitError(errMsg);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const displayError = error || submitError;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300" suppressHydrationWarning>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Akeo" width={36} height={36} priority className="h-9 w-9" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Akeo</span>
          </Link>
          <div className="flex items-center gap-4" suppressHydrationWarning>
            <ThemeToggle />
            <Link
              href="/admin/login"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image src="/logo.png" alt="Akeo" width={64} height={64} className="mb-4 h-16 w-16" priority />
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 transition-colors duration-300">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email or username
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 transition-colors duration-300"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 transition-colors duration-300"
                />
              </div>
              {displayError && (
                <div role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {displayError}
                </div>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="w-full cursor-pointer rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold py-2.5 px-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {isPending ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center"><div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" /></div>}>
      <HomeLoginForm />
    </Suspense>
  );
}
