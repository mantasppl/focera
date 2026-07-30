import type { Metadata } from "next";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ToolsCatalog from "@/components/ToolsCatalog";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Free Online Tools",
  description: `Browse every ${SITE_NAME} utility — PDF, image, video, AI, and file tools. Ready tools and upcoming releases.`,
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        <section className="page-hero">
          <p className="page-hero__brand">{SITE_NAME}</p>
          <h1 className="page-hero__title">All free online tools</h1>
          <p className="page-hero__lede">
            One catalog for every Focera utility. Search by name or shorthand,
            or browse by category — work privately in your browser.
          </p>
        </section>

        <ToolsCatalog />

        <div className="page-section">
          <CTA
            title="Looking for something specific?"
            description="Start from the homepage for categories and top tools, or search above."
            href="/"
            label="Back to home"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
