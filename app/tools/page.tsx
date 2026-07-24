import type { Metadata } from "next";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ToolCard from "@/components/ToolCard";
import { categoryLabels, tools, type ToolCategory } from "@/data/tools";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Free Online Tools",
  description: `Browse every ${SITE_NAME} utility — generators, converters, calculators, image tools, and developer helpers. Ready tools and upcoming releases.`,
  path: "/tools",
});

const categoryOrder: ToolCategory[] = [
  "generators",
  "converters",
  "marketing",
  "finance",
  "images",
  "security",
  "developers",
];

export default function ToolsPage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        <section className="page-hero">
          <p className="page-hero__brand">{SITE_NAME}</p>
          <h1 className="page-hero__title">All free online tools</h1>
          <p className="page-hero__lede">
            One catalog for every Focera utility. Pick a category, open a tool,
            and work privately in your browser.
          </p>
        </section>

        {categoryOrder.map((category) => {
          const items = tools.filter((tool) => tool.category === category);
          if (!items.length) return null;

          return (
            <section
              key={category}
              className="page-section"
              aria-labelledby={`cat-${category}`}
            >
              <h2 id={`cat-${category}`} className="section-heading">
                {categoryLabels[category]}
              </h2>
              <div className="tool-card-grid">
                {items.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}

        <div className="page-section">
          <CTA
            title="Looking for something specific?"
            description="Start from the homepage for featured tools, or open any category above."
            href="/"
            label="Back to home"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
