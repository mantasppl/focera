import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";
import { cn } from "@/lib/utils";

type HeaderProps = {
  className?: string;
};

export default function Header({ className }: HeaderProps) {
  return (
    <header className={cn("site-header", className)}>
      <div className="site-header__inner">
        <Link href="/" className="site-logo" aria-label={`${SITE_NAME} home`}>
          <span className="site-logo__mark" aria-hidden="true" />
          {SITE_NAME}
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/#categories">Categories</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/tools" className="site-nav__cta">
            All tools
          </Link>
        </nav>
      </div>
    </header>
  );
}
