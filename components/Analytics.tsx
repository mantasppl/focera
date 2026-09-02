"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect } from "react";
import { useSiteTrafficTracker } from "@/lib/analytics/client";
import { isAdminClientPath } from "@/lib/analytics/paths";

const MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-9RZ4VQ21XV";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || typeof window.gtag !== "function") return;

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag("config", MEASUREMENT_ID, {
      page_path: pagePath,
    });
  }, [pathname, searchParams]);

  return null;
}

function SiteTrafficTracker() {
  const pathname = usePathname();
  const trackedPath =
    pathname && !isAdminClientPath(pathname) ? pathname : null;
  useSiteTrafficTracker(trackedPath);
  return null;
}

/**
 * Google Analytics 4 (gtag.js).
 * Override with NEXT_PUBLIC_GA_MEASUREMENT_ID if needed.
 */
export default function Analytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsPageViews />
        <SiteTrafficTracker />
      </Suspense>
    </>
  );
}
