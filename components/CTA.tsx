import Link from "next/link";
import { cn } from "@/lib/utils";

type CTAProps = {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
  className?: string;
};

export default function CTA({
  title = "Need another free tool?",
  description = "Browse the full collection — more utilities ship regularly.",
  href = "/tools",
  label = "Browse all tools",
  className,
}: CTAProps) {
  return (
    <section className={cn("cta", className)}>
      <div className="cta__inner">
        <h2 className="cta__title">{title}</h2>
        <p className="cta__desc">{description}</p>
        <Link href={href} className="cta__button">
          {label}
        </Link>
      </div>
    </section>
  );
}
