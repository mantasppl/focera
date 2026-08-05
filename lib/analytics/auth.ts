/**
 * @deprecated Import from `@/lib/admin/auth` instead.
 * Re-exports kept temporarily for any residual imports.
 */
export {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions as adminSessionCookieOptions,
  createAdminSessionToken,
  generateAdminSessionSecret,
  getAdminSessionSecret,
  isAdminAuthConfigured,
  isAdminAuthenticated,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";
