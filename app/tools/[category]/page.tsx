import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategorySeoIntro from "@/components/CategorySeoIntro";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import ToolsCatalog from "@/components/ToolsCatalog";
import { getCategorySeo } from "@/data/category-seo";
import {
  categoryLabels,
  categoryOrder,
  getToolsByCategory,
  isToolCategory,
} from "@/data/tools";
import {
  breadcrumbSchema,
  collectionPageSchema,
  pageMetadata,
  SITE_NAME,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return categoryOrder.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: raw } = await params;
  if (!isToolCategory(raw)) {
    return pageMetadata({
      title: "Category not found",
      description: `Browse free online tools on ${SITE_NAME}.`,
      path: "/tools",
      noIndex: true,
    });
  }

  const seo = getCategorySeo(raw);

  return pageMetadata({
    title: categoryLabels[raw],
    description: seo.metaDescription,
    path: `/tools/${raw}`,
    keywords: seo.keywords,
  });
}

export default async function CategoryToolsPage({ params }: PageProps) {
  const { category: raw } = await params;
  if (!isToolCategory(raw)) notFound();

  const category = raw;
  const label = categoryLabels[category];
  const seo = getCategorySeo(category);
  const tools = getToolsByCategory(category);
  const count = tools.length;
  const path = `/tools/${category}`;

  return (
    <div className="page-shell">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", href: "/" },
            { name: "All tools", href: "/tools" },
            { name: label, href: path },
          ]),
          collectionPageSchema({
            name: label,
            description: seo.metaDescription,
            path,
            tools,
          }),
        ]}
      />
      <Header />
      <main className="page-main">
        <section className="page-hero">
          <p className="page-hero__brand">{SITE_NAME}</p>
          <h1 className="page-hero__title">{label}</h1>
          <p className="page-hero__lede">
            {seo.lede}{" "}
            {count > 0
              ? `${count} tool${count === 1 ? "" : "s"} ready to browse below.`
              : "Tools for this category are coming soon."}
          </p>
        </section>

        <ToolsCatalog category={category} />

        <CategorySeoIntro category={category} />

        <div className="page-section">
          <CTA
            title="Need a different category?"
            description="Browse the full catalog — PDF, image, video, AI, and file tools in one place."
            href="/tools"
            label="Browse all tools"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
