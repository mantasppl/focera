import Link from "next/link";
import type { Tool } from "@/data/tools";
import { getReadyTools } from "@/data/tools";
import { cn } from "@/lib/utils";

type RelatedToolsProps = {
  currentSlug: string;
  limit?: number;
  title?: string;
  className?: string;
};

export function getRelatedTools(currentSlug: string, limit = 4): Tool[] {
  const ready = getReadyTools();
  const current = ready.find((tool) => tool.slug === currentSlug);
  const sameCategory = ready.filter(
    (tool) =>
      tool.slug !== currentSlug &&
      current &&
      tool.category === current.category,
  );
  const others = ready.filter(
    (tool) =>
      tool.slug !== currentSlug &&
      (!current || tool.category !== current.category),
  );
  return [...sameCategory, ...others].slice(0, limit);
}

export default function RelatedTools({
  currentSlug,
  limit = 4,
  title = "Try these related tools",
  className,
}: RelatedToolsProps) {
  const related = getRelatedTools(currentSlug, limit);
  if (!related.length) return null;

  return (
    <section
      className={cn("related-tools", className)}
      aria-labelledby="related-tools-heading"
    >
      <h2 id="related-tools-heading" className="related-tools__title">
        {title}
      </h2>
      <p className="related-tools__lede">
        Keep working without leaving Focera — every tool runs locally in your
        browser.
      </p>
      <ul className="related-tools__list">
        {related.map((tool) => (
          <li key={tool.slug}>
            <Link href={tool.href} className="related-tools__link">
              <span className="related-tools__name">{tool.shortName}</span>
              <span className="related-tools__desc">{tool.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
