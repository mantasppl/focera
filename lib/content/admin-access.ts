import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  readCookieFromRequest,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";

export function isAdminApiRequest(request: Request): boolean {
  const token = readCookieFromRequest(request, ADMIN_SESSION_COOKIE);
  return verifyAdminSessionToken(token).ok;
}

export async function isAdminPageRequest(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value).ok;
}
