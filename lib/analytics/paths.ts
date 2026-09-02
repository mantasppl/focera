/** True for internal `/admin` routes and the secret `/admin-<token>` path. */
export function isAdminClientPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    /^\/admin-[a-zA-Z0-9]/.test(pathname)
  );
}
