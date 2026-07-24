"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-shell">
      <main className="page-main error-page">
        <p className="page-hero__brand">{SITE_NAME}</p>
        <h1 className="page-hero__title">Something went wrong</h1>
        <p className="page-hero__lede">
          An unexpected error interrupted this page. You can try again or return
          to the home page.
        </p>
        <div className="error-page__actions">
          <button type="button" className="cta__button" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="error-page__secondary">
            Go home
          </Link>
        </div>
      </main>
    </div>
  );
}
