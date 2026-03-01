import { getTokens } from "@/lib/api/admin-client";
import { TokensTable } from "./tokens-table";
import type { Token } from "@/lib/api/admin-client";

function parseTokens(data: unknown): Token[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    "tokens" in data &&
    Array.isArray((data as { tokens: Token[] }).tokens)
  ) {
    return (data as { tokens: Token[] }).tokens;
  }
  return [];
}

export default async function TokensPage() {
  const { ok, data } = await getTokens();
  const tokens = ok ? parseTokens(data) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Active tokens
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Manage user sessions and revoke tokens
        </p>
      </header>

      <TokensTable tokens={tokens} />
    </div>
  );
}
