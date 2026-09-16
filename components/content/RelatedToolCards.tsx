import Link from "next/link";
import ToolIcon from "@/components/ToolIcon";
import type { ContentTool } from "@/lib/content/types";
import { getPrimaryCategory, getToolBySlug } from "@/data/tools";

const categoryHint: Record<string, string> = {
  pdf: "PDF",
  image: "Image",
  video: "Video",
  ai: "AI",
  file: "Utility",
};

export default function RelatedToolCards({ tools }: { tools: ContentTool[] }) {
  if (!tools.length) return null;

  return (
    <section className="related-tools blog-related" aria-labelledby="blog-related-heading">
      <div className="related-tools__intro">
        <h2 id="blog-related-heading" className="related-tools__title">
          Related tools
        </h2>
      </div>
      <ul className="related-tools__list">
        {tools.map((tool, index) => {
          const catalog = getToolBySlug(tool.slug);
          const category = catalog
            ? categoryHint[getPrimaryCategory(catalog)]
            : "Tool";
          return (
            <li
              key={tool.id}
              className="related-tools__item"
              style={{ ["--rt-i" as string]: index }}
            >
              <Link href={tool.href} className="related-tools__link">
                <span className="related-tools__top">
                  <span className="related-tools__icon" aria-hidden="true">
                    <ToolIcon slug={tool.slug} className="related-tools__svg" />
                  </span>
                  <span className="related-tools__category">{category}</span>
                </span>
                <span className="related-tools__name">{catalog?.shortName || tool.name}</span>
                <span className="related-tools__desc">{tool.description}</span>
                <span className="related-tools__cta">
                  Open tool
                  <span className="related-tools__arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
