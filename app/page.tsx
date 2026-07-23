import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ToolCard from "@/components/ToolCard";
import { getReadyTools, tools } from "@/data/tools";

const homeFaq = [
  {
    question: "Are these tools really free?",
    answer:
      "Yes. ToolHub utilities run in your browser with no account required.",
  },
  {
    question: "Do you upload my files or data?",
    answer:
      "Ready tools process content locally. New tools follow the same privacy-first approach.",
  },
];

export default function HomePage() {
  const featured = getReadyTools();
  const upcoming = tools.filter((tool) => tool.status === "soon").slice(0, 3);

  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        <section className="page-hero">
          <p className="page-hero__brand">ToolHub</p>
          <h1 className="page-hero__title">Free online tools</h1>
          <p className="page-hero__lede">
            Generators, calculators, and converters — open a tool and get to
            work. No sign-up, no upload spam.
          </p>
        </section>

        <section aria-labelledby="ready-tools">
          <h2 id="ready-tools" className="section-heading">
            Ready to use
          </h2>
          <div className="tool-card-grid">
            {featured.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {upcoming.length ? (
          <section aria-labelledby="coming-soon" style={{ marginTop: "2.5rem" }}>
            <h2 id="coming-soon" className="section-heading">
              Coming soon
            </h2>
            <div className="tool-card-grid">
              {upcoming.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ) : null}

        <div style={{ marginTop: "2.5rem" }}>
          <FAQ items={homeFaq} title="About ToolHub" />
        </div>
        <div style={{ marginTop: "2.5rem" }}>
          <CTA
            title="See the full catalog"
            description="Every planned tool already has a route, SEO metadata, and shared layout."
            label="Browse all tools"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
