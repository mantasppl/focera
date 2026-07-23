import type { Metadata } from "next";
import ToolPageShell from "@/components/tools/ToolPageShell";
import UTMBuilder from "@/components/tools/UTMBuilder";
import { getToolBySlug } from "@/data/tools";
import { toolMetadata } from "@/lib/seo";

const tool = getToolBySlug("utm-builder")!;

export const metadata: Metadata = toolMetadata(tool);

export default function UTMBuilderPage() {
  return (
    <ToolPageShell slug="utm-builder">
      <UTMBuilder />
    </ToolPageShell>
  );
}
