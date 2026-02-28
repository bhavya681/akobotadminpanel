/**
 * Login endpoint paths to try when the default returns 404.
 * Set NEXT_PUBLIC_API_LOGIN_PATH in .env to use a specific path.
 */
export const LOGIN_PATHS = [
  "/admin/auth/login",
  "/api/admin/auth/login",
  "/api/auth/login",
  "/api/auth/admin/login",
  "/auth/login",
  "/admin/login",
] as const;

export function getLoginPaths(): string[] {
  const configured = process.env.NEXT_PUBLIC_API_LOGIN_PATH?.trim();
  if (configured) return [configured.startsWith("/") ? configured : `/${configured}`];
  return [...LOGIN_PATHS];
}
