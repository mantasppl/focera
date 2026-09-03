/**
 * Server-only admin path / API prefix helpers.
 * Never import this into client components — pass values via AdminPathProvider.
 */

const DEFAULT_DEV_PATH = "/admin-dev-local";

function normalizeAdminPath(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let path = raw.trim();
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/+$/, "");
  // Must be obscure: /admin-<token>, not bare /admin
  if (!/^\/admin-[a-zA-Z0-9]{8,64}$/.test(path)) return null;
  if (path === "/admin") return null;
  return path;
}

/** Public-facing admin base path from ADMIN_PATH (e.g. /admin-9xk2q7v8m). */
export function getAdminPath(): string {
  const configured = normalizeAdminPath(process.env.ADMIN_PATH);
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    // Fail closed in production — proxy will 404 admin UI.
    return "/admin-unconfigured";
  }
  return DEFAULT_DEV_PATH;
}

export function isAdminPathConfigured(): boolean {
  return Boolean(normalizeAdminPath(process.env.ADMIN_PATH));
}

/** Rewrite target used by the App Router (internal filesystem routes). */
export const INTERNAL_ADMIN_BASE = "/admin";
export const INTERNAL_ADMIN_API_BASE = "/api/admin";

export function toInternalAdminPath(pathname: string): string | null {
  const adminPath = getAdminPath();
  if (pathname === adminPath) return `${INTERNAL_ADMIN_BASE}`;
  if (pathname.startsWith(`${adminPath}/`)) {
    const rest = pathname.slice(adminPath.length);
    // /admin-xxx/api/... → /api/admin/...
    if (rest === "/api" || rest.startsWith("/api/")) {
      const apiRest = rest.slice("/api".length); // "" or "/auth/login"
      return `${INTERNAL_ADMIN_API_BASE}${apiRest || ""}`;
    }
    return `${INTERNAL_ADMIN_BASE}${rest}`;
  }
  return null;
}

export function isSecretAdminRequest(pathname: string): boolean {
  const adminPath = getAdminPath();
  return pathname === adminPath || pathname.startsWith(`${adminPath}/`);
}

export function isLegacyAdminRequest(pathname: string): boolean {
  return (
    pathname === INTERNAL_ADMIN_BASE ||
    pathname.startsWith(`${INTERNAL_ADMIN_BASE}/`) ||
    pathname === INTERNAL_ADMIN_API_BASE ||
    pathname.startsWith(`${INTERNAL_ADMIN_API_BASE}/`)
  );
}

export function adminLoginPath(): string {
  return `${getAdminPath()}/login`;
}

export function adminTrafficPath(): string {
  return `${getAdminPath()}/traffic`;
}

export function adminAnalyticsPath(): string {
  return `${getAdminPath()}/analytics`;
}

export function adminApiPath(subpath: string): string {
  const clean = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `${getAdminPath()}/api${clean}`;
}

export function getAllowedAdminIps(): string[] | null {
  const raw = process.env.ADMIN_ALLOWED_IPS?.trim();
  if (!raw) return null;
  const ips = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return ips.length ? ips : null;
}

export function isIpAllowed(ip: string): boolean {
  const allowlist = getAllowedAdminIps();
  if (!allowlist) return true;
  if (ip === "unknown") return false;
  // Strip IPv6-mapped IPv4
  const normalized = ip.replace(/^::ffff:/i, "");
  return allowlist.some((allowed) => {
    const a = allowed.replace(/^::ffff:/i, "");
    return a === normalized || a === ip;
  });
}
