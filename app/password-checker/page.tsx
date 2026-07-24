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

const tool = getToolBySlug("password-checker")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PasswordCheckerPage() {
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
        slug="password-checker"
        content={
          <ComingSoonLanding
            name="password checker"
            summary="Estimate password strength and spot weak patterns locally in your browser. Focera will keep checks on-device so trial passwords do not need to leave your computer."
            howTo={[
              "Type or paste a password candidate.",
              "Review strength signals and common-pattern warnings.",
              "Generate a stronger alternative with the password generator.",
            ]}
          />
        }
        ctaTitle="Generate a strong password now"
        ctaDescription="The free password generator is ready today — Focera creates secrets locally with the Web Crypto API."
      >
        <ComingSoon name={tool.name} />
      </ToolPageShell>
    </>
  );
}
