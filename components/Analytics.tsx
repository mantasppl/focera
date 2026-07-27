import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js).
 * Override with NEXT_PUBLIC_GA_MEASUREMENT_ID if needed.
 * Verify Search Console ownership via DNS or HTML tag in your host dashboard.
 */
export default function Analytics() {
  const measurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-9RZ4VQ21XV";

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
