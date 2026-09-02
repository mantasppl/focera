"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type AdminPathContextValue = {
  adminPath: string;
  analyticsPath: string;
  ratingsPath: string;
  loginPath: string;
  api: (subpath: string) => string;
};

const AdminPathContext = createContext<AdminPathContextValue | null>(null);

export function AdminPathProvider({
  adminPath,
  children,
}: {
  adminPath: string;
  children: ReactNode;
}) {
  const value = useMemo<AdminPathContextValue>(() => {
    const base = adminPath.replace(/\/+$/, "");
    return {
      adminPath: base,
      analyticsPath: `${base}/analytics`,
      ratingsPath: `${base}/ratings`,
      loginPath: `${base}/login`,
      api(subpath: string) {
        const clean = subpath.startsWith("/") ? subpath : `/${subpath}`;
        return `${base}/api${clean}`;
      },
    };
  }, [adminPath]);

  return (
    <AdminPathContext.Provider value={value}>
      {children}
    </AdminPathContext.Provider>
  );
}

export function useAdminPath(): AdminPathContextValue {
  const ctx = useContext(AdminPathContext);
  if (!ctx) {
    throw new Error("useAdminPath must be used within AdminPathProvider");
  }
  return ctx;
}
