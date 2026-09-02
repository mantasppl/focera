"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import BrandMark from "@/components/BrandMark";
import Button from "@/components/Button";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import { adminFetch } from "@/lib/admin/csrf-client";
import { cn } from "@/lib/utils";

type AdminChromeProps = {
  children: ReactNode;
  title?: string;
};

export default function AdminChrome({ children, title }: AdminChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { analyticsPath, ratingsPath, loginPath, api } = useAdminPath();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("focera_admin_theme");
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
        document.documentElement.dataset.adminTheme = stored;
        return;
      }
    } catch {
      // ignore
    }
    document.documentElement.dataset.adminTheme = "light";
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.adminTheme = next;
    try {
      window.localStorage.setItem("focera_admin_theme", next);
    } catch {
      // ignore
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await adminFetch(api("/auth/logout"), { method: "POST" });
      router.replace(loginPath);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__inner">
          <div className="admin-header__brand">
            <Link href={analyticsPath} className="site-logo">
              <BrandMark className="site-logo__mark" />
              Focera
            </Link>
            <span className="admin-header__badge">Analytics</span>
          </div>
          <nav className="admin-nav" aria-label="Admin">
            <Link
              href={analyticsPath}
              className={cn(
                "admin-nav__link",
                pathname.includes("/analytics") && "is-active",
              )}
            >
              Dashboard
            </Link>
            <Link
              href={ratingsPath}
              className={cn(
                "admin-nav__link",
                pathname.includes("/ratings") && "is-active",
              )}
            >
              Ratings
            </Link>
            <Link href="/" className="admin-nav__link">
              View site
            </Link>
          </nav>
          <div className="admin-header__actions">
            <button
              type="button"
              className="ui-btn ui-btn--ghost admin-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </div>
      </header>
      <main className="admin-main">
        {title ? <h1 className="admin-title">{title}</h1> : null}
        {children}
      </main>
    </div>
  );
}
