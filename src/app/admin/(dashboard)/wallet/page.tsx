import { Suspense } from "react";
import {
  searchUserByEmail,
  getUserById,
  getWalletBalance,
  getWalletHistory,
} from "@/lib/api/admin-client";
import { WalletView } from "./wallet-view";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function WalletPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const userId = params?.userId as string | undefined;
  const email = params?.email as string | undefined;

  let user: { _id?: string; username?: string; email?: string } | null = null;
  let balance: number | null = null;
  let transactions: import("@/lib/api/admin-client").WalletTransaction[] = [];
  let total = 0;
  let page = 1;
  let limit = 20;
  let totalPages = 1;

  if (email && !userId) {
    const res = await searchUserByEmail(email);
    if (res.ok && res.data && !("message" in res.data)) {
      user = res.data as { _id?: string; username?: string; email?: string };
    }
  } else if (userId) {
    const [userRes, balanceRes, historyRes] = await Promise.all([
      getUserById(userId),
      getWalletBalance(userId),
      getWalletHistory(userId, {
        page: parseInt(String(params?.page ?? "1"), 10),
        limit: parseInt(String(params?.limit ?? "20"), 10),
        type: params?.type as string | undefined,
        fromDate: params?.fromDate as string | undefined,
        toDate: params?.toDate as string | undefined,
        sortOrder: (params?.sortOrder as "asc" | "desc") ?? "desc",
      }),
    ]);

    if (userRes.ok && userRes.data && !("message" in userRes.data)) {
      user = userRes.data as { _id?: string; username?: string; email?: string };
    } else {
      user = { _id: userId, username: "User", email: "" };
    }

    if (balanceRes.ok && balanceRes.data && !("message" in balanceRes.data)) {
      balance = (balanceRes.data as { balance?: number }).balance ?? 0;
    }
    if (historyRes.ok && historyRes.data && !("message" in historyRes.data)) {
      const h = historyRes.data as {
        transactions?: import("@/lib/api/admin-client").WalletTransaction[];
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      };
      transactions = h.transactions ?? [];
      total = h.total ?? 0;
      page = h.page ?? 1;
      limit = h.limit ?? 20;
      totalPages = h.totalPages ?? Math.max(1, Math.ceil(total / limit));
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Wallet
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Credit or debit user wallets. View balance and transaction history.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
            <div className="h-10 w-64 animate-pulse rounded-lg bg-[var(--muted)]" />
          </div>
        }
      >
        <WalletView
          user={user}
          userId={userId}
          balance={balance}
          transactions={transactions}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          filters={{
            type: params?.type ? String(params.type) : undefined,
            fromDate: params?.fromDate ? String(params.fromDate) : undefined,
            toDate: params?.toDate ? String(params.toDate) : undefined,
            sortOrder: params?.sortOrder ? String(params.sortOrder) : "desc",
          }}
        />
      </Suspense>
    </div>
  );
}
