import type { Metadata } from "next";
import ComingSoon from "@/components/tools/ComingSoon";
import ComingSoonLanding from "@/components/tools/ComingSoonLanding";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("image-converter")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ImageConverterPage() {
  const schema = [
    webApplicationSchema(tool),
    faqPageSchema(tool.faq),
    breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "All tools", href: "/tools" },
      { name: tool.name, href: tool.href },
    ]),
  ];

  return (
    <>
      <JsonLd data={schema} />
      <ToolPageShell
        slug="image-converter"
        content={
          <ComingSoonLanding
            name="image converter"
            summary="Convert images between PNG, JPG, WebP, and more without installing desktop software. Focera will keep conversion local in your browser for a fast, private workflow."
            howTo={[
              "Choose a source image from your device.",
              "Pick the output format you need.",
              "Download the converted file.",
            ]}
          />
        }
        ctaTitle="Explore ready tools"
        ctaDescription="Use the AI background remover and other Focera image utilities while the converter is in progress."
      >
        <ComingSoon name={tool.name} />
      </ToolPageShell>
    </>
  );
}
