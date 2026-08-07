import type { ToolCategory } from "@/data/tools";
import { getCategorySeo } from "@/data/category-seo";

type CategorySeoIntroProps = {
  category: ToolCategory;
};

export default function CategorySeoIntro({ category }: CategorySeoIntroProps) {
  const seo = getCategorySeo(category);
  const headingId = `category-seo-${category}`;

  return (
    <article className="page-section category-seo" aria-labelledby={headingId}>
      <div className="category-seo__panel">
        <h2 id={headingId} className="category-seo__heading">
          {seo.heading}
        </h2>
        {seo.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}

        <h3 className="category-seo__subheading">{seo.toolsHeading}</h3>
        <ul className="category-seo__list">
          {seo.tools.map((item) => (
            <li key={item.slice(0, 48)}>{item}</li>
          ))}
        </ul>

        <h3 className="category-seo__subheading">{seo.useCasesHeading}</h3>
        <ul className="category-seo__list">
          {seo.useCases.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong> — {item.description}
            </li>
          ))}
        </ul>

        <p>{seo.closing}</p>
      </div>
    </article>
  );
}
