import type { Metadata } from "next";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ToolCard from "@/components/ToolCard";
import { categoryLabels, tools, type ToolCategory } from "@/data/tools";

export const metadata: Metadata = {
  title: "All tools",
  description: "Browse every ToolHub utility — ready tools and upcoming releases.",
};

const categoryOrder: ToolCategory[] = [
  "generators",
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
          <p className="page-hero__brand">ToolHub</p>
          <h1 className="page-hero__title">All tools</h1>
          <p className="page-hero__lede">
            One catalog for every utility. Add a tool in data/tools.ts and wire
            a page — the shell stays shared.
          </p>
        </section>

        {categoryOrder.map((category) => {
          const items = tools.filter((tool) => tool.category === category);
          if (!items.length) return null;

          return (
            <section
              key={category}
              aria-labelledby={`cat-${category}`}
              style={{ marginBottom: "2.5rem" }}
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

        <CTA
          title="Missing something?"
          description="New tools plug into the same layout, SEO helpers, and UI primitives."
          href="/"
          label="Back to home"
        />
      </main>
      <Footer />
    </div>
  );
}
