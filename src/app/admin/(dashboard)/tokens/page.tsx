import { getTokens } from "@/lib/api/admin-client";
import { TokensTable } from "./tokens-table";

export default async function TokensPage() {
  const { ok, data } = await getTokens();
  const tokens = ok && Array.isArray(data) ? data : [];

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

      <TokensTable tokens={tokens} />
    </div>
  );
}
