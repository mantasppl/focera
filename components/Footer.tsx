import Link from "next/link";
import { cn } from "@/lib/utils";

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("site-footer", className)}>
      <div className="site-footer__inner">
        <Link href="/" className="site-footer__brand">
          ToolHub
        </Link>
        <p className="site-footer__copy">
          Free browser-based tools. No sign-up required.
        </p>
        <nav className="site-footer__nav" aria-label="Footer">
          <Link href="/tools">Browse tools</Link>
        </nav>
      </div>
    </footer>
  );
}
