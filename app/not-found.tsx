import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export default function NotFound() {
  return (
    <div className="page-shell">
      <main className="page-main error-page">
        <p className="page-hero__brand">{SITE_NAME}</p>
        <h1 className="page-hero__title">Page not found</h1>
        <p className="page-hero__lede">
          That URL does not match a tool or page on {SITE_NAME}. Check the
          address or browse the catalog.
        </p>
        <div className="error-page__actions">
          <Link href="/" className="cta__button">
            Go home
          </Link>
          <Link href="/tools" className="error-page__secondary">
            Browse all tools
          </Link>
        </div>
        <p className="error-page__hint">{SITE_TAGLINE}</p>
      </main>
    </div>
  );
}
