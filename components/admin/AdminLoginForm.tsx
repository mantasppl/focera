"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { useAdminPath } from "@/components/admin/AdminPathContext";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminPath, analyticsPath, api } = useAdminPath();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadCsrf() {
      try {
        const response = await fetch(api("/auth/csrf"), {
          method: "GET",
          credentials: "same-origin",
        });
        if (!response.ok) return;
        const body = (await response.json()) as { csrfToken?: string };
        if (!cancelled && body.csrfToken) setCsrfToken(body.csrfToken);
      } catch {
        // ignore — submit will fail closed
      }
    }
    void loadCsrf();
    return () => {
      cancelled = true;
    };
  }, [api]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(api("/auth/login"), {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ username, password, csrfToken }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || "Invalid credentials");
      }
      const next = searchParams.get("next") || analyticsPath;
      router.replace(next.startsWith(adminPath) ? next : analyticsPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <div className="admin-login__brand">
          <span className="site-logo__mark" aria-hidden />
          <h1>Focera Admin</h1>
        </div>
        <p className="admin-login__copy">Sign in to continue.</p>
        <label className="admin-field">
          <span>Username</span>
          <input
            className="ui-field"
            type="text"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input
            className="ui-field"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        <Button type="submit" disabled={loading || !username || !password}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
