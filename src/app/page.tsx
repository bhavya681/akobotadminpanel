"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { login } from "@/lib/api/admin-api";

function HomeLoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

    if (!identifier || !password) {
      setSubmitError("Identifier and password are required.");
      setIsPending(false);
      return;
    }

    try {
      const result = await login(identifier, password);
      if (result.ok) {
        router.replace("/admin");
      } else {
        setSubmitError(result.error ?? "Login failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const displayError = error || submitError;

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300" suppressHydrationWarning>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Akeo" width={36} height={36} priority className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">Akeo</span>
          </Link>
          <div className="flex items-center gap-4" suppressHydrationWarning>
            <ThemeToggle />
            <Link
              href="/admin/login"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 pt-16 pb-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image src="/logo.png" alt="Akeo" width={64} height={64} className="mb-4 h-16 w-16 rounded-xl" priority />
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Email or username
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20"
                />
              </div>
              {displayError && (
                <div role="alert" className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {displayError}
                </div>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-[var(--primary)] py-3 px-4 font-semibold text-[var(--primary-foreground)] transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
