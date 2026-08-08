import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ProfilePhotoMakerLanding from "@/components/tools/ProfilePhotoMakerLanding";
import { ProfilePhotoMakerLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("profile-photo-maker")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ProfilePhotoMakerPage() {
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
        slug="profile-photo-maker"
        workspaceId="profile-photo-maker-tool"
        content={<ProfilePhotoMakerLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Remove backgrounds, resize dimensions, or compress files — Focera keeps everyday image tools fast, private, and free."
      >
        <ProfilePhotoMakerLazy />
      </ToolPageShell>
    </>
  );
}
