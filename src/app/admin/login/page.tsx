"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black px-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="absolute top-4 left-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
        ← Back
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-xl transition-colors duration-300">
        <div className="mb-6 flex justify-center">
          <Image src="/logo.png" alt="Akeo" width={48} height={48} className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
          Admin Login
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Sign in with your admin credentials
        </p>

        <form action="/api/admin/login" method="POST" className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Email or username
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              placeholder="user@example.com or johndoe"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors duration-300"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors duration-300"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <input type="hidden" name="from" value="/admin/login" />
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium py-2.5 px-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition-colors duration-300"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white dark:bg-black"><div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
