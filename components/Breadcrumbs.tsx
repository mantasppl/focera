import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  name: string;
  href: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length < 2) return null;

  return (
    <nav className={cn("breadcrumbs", className)} aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.href}-${item.name}`} className="breadcrumbs__item">
              {isLast ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="breadcrumbs__link">
                  {item.name}
                </Link>
              )}
              {!isLast ? (
                <span className="breadcrumbs__sep" aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
