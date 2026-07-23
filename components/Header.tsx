import Link from "next/link";
import { cn } from "@/lib/utils";

type HeaderProps = {
  className?: string;
};

export default function Header({ className }: HeaderProps) {
  return (
    <header className={cn("site-header", className)}>
      <div className="site-header__inner">
        <Link href="/" className="site-logo">
          ToolHub
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/tools">All tools</Link>
        </nav>
      </div>
    </header>
  );
}
