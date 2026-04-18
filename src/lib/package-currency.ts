/** Pure helpers — safe to import from Client Components (no `next/headers`). */

export type PackageCurrency = "INR" | "USD";

export function normalizePackageCurrency(value: unknown): PackageCurrency {
  return value === "USD" ? "USD" : "INR";
}

export function formatPackageMoney(amount: number, currency: PackageCurrency): string {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
