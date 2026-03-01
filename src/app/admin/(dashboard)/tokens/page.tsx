"use client";

import { useEffect, useState } from "react";
import { getTokens, type Token } from "@/lib/api/admin-api";
import { TokensTable } from "./tokens-table";

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  function parseTokens(data: unknown): Token[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "tokens" in data && Array.isArray((data as { tokens: Token[] }).tokens)) {
      return (data as { tokens: Token[] }).tokens;
    }
    return [];
  }

  useEffect(() => {
    async function load() {
      const { ok, data } = await getTokens();
      setTokens(ok ? parseTokens(data) : []);
      setLoading(false);
    }
    load();
  }, []);

  const onRevoked = () => {
    getTokens().then(({ ok, data }) => {
      if (ok) setTokens(parseTokens(data));
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px]">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
      </div>
    );
  }

  return (
    <div className="p-8 transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Active tokens
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Manage user sessions and revoke tokens
        </p>
      </header>

      <TokensTable tokens={tokens} onRevoked={onRevoked} />
    </div>
  );
}
