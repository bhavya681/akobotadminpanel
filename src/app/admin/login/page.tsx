"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

function LoginForm() {
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    setError("");
    if (!identifier.trim() || !password) {
      setError("Identifier and password are required.");
      e.preventDefault();
      return;
    }
    setLoading(true);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12 transition-colors duration-300">
      {/* Subtle grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <Link
        href="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </Link>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl shadow-black/5 dark:shadow-black/20 transition-colors duration-300">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--muted)]">
              <Image src="/logo.png" alt="Akobot" width={40} height={40} className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Admin Login
            </h1>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Sign in with your admin credentials to continue
            </p>
          </div>

          <form
            action="/api/admin/login"
            method="POST"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                Email or username
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--primary)] py-3 px-4 font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
        <div className="w-full max-w-md animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
          <div className="mb-8 h-14 w-14 rounded-xl bg-[var(--muted)]" />
          <div className="space-y-5">
            <div className="h-12 rounded-lg bg-[var(--muted)]" />
            <div className="h-12 rounded-lg bg-[var(--muted)]" />
            <div className="h-12 rounded-lg bg-[var(--muted)]" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
