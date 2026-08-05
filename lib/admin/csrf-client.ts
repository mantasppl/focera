"use client";

const CSRF_COOKIE = "focera_admin_csrf";

export function readCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE}=`));
  if (!match) return "";
  return decodeURIComponent(match.slice(CSRF_COOKIE.length + 1));
}

export async function adminFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers || {});
  const method = (init.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    const token = readCsrfToken();
    if (token) headers.set("X-CSRF-Token", token);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: "same-origin",
  });
}
