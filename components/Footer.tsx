import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { cn } from "@/lib/utils";

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("site-footer", className)}>
      <div className="site-footer__inner">
        <div className="site-footer__brand-block">
          <Link href="/" className="site-footer__brand">
            {SITE_NAME}
          </Link>
          <p className="site-footer__tagline">{SITE_TAGLINE}</p>
          <p className="site-footer__copy">
            Free browser-based tools. No sign-up required. © {year} {SITE_NAME}.
          </p>
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          <div className="site-footer__col">
            <p className="site-footer__col-title">Explore</p>
            <Link href="/tools">All tools</Link>
            <Link href="/">Home</Link>
          </div>
          <div className="site-footer__col">
            <p className="site-footer__col-title">Legal</p>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </nav>
      </div>
    </footer>
  );
}
