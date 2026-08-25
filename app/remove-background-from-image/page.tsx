import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import RemoveBackgroundFromImageSeoLanding from "@/components/tools/RemoveBackgroundFromImageSeoLanding";
import SeoClusterPageShell from "@/components/tools/SeoClusterPageShell";
import { MakeBackgroundTransparentLazy } from "@/components/tools/HeavyTools";
import { getSeoLandingBySlug } from "@/data/seo-landings";
import {
  breadcrumbSchema,
  faqPageSchema,
  pageMetadata,
  seoLandingPageSchema,
} from "@/lib/seo";

const page = getSeoLandingBySlug("remove-background-from-image")!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.href,
  keywords: page.keywords,
});

export default function RemoveBackgroundFromImagePage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: page.parentName, href: page.parentHref },
    { name: "Remove background from image", href: page.href },
  ];

  const schema = [
    seoLandingPageSchema({
      title: page.title,
      description: page.description,
      path: page.href,
      parentName: page.parentName,
      parentHref: page.parentHref,
    }),
    faqPageSchema(page.faq),
    breadcrumbSchema(crumbs),
  ];

  return (
    <>
      <JsonLd data={schema} />
      <SeoClusterPageShell
        parentToolSlug={page.parentToolSlug}
        title={page.h1}
        intro={page.intro}
        faq={page.faq}
        workspaceId="remove-background-from-image-tool"
        breadcrumbs={crumbs}
        content={<RemoveBackgroundFromImageSeoLanding />}
        ctaTitle="Continue in Make Background Transparent"
        ctaDescription="This landing page is only an entry point. The editor above is the same Make Background Transparent workspace — open the main tool URL anytime you want the canonical page."
        ctaHref={page.parentHref}
        ctaLabel="Open Make Background Transparent"
      >
        <MakeBackgroundTransparentLazy />
      </SeoClusterPageShell>
    </>
  );
}
