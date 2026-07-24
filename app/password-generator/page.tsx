import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import PasswordGeneratorLanding from "@/components/tools/PasswordGeneratorLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("password-generator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PasswordGeneratorPage() {
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
        slug="password-generator"
        workspaceId="password-generator-tool"
        content={<PasswordGeneratorLanding />}
        ctaTitle="Explore more free security and utility tools"
        ctaDescription="From password utilities to QR codes and developer helpers, Focera keeps everyday tools fast, private, and free."
      >
        <PasswordGenerator />
      </ToolPageShell>
    </>
  );
}
