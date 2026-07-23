import type { Metadata } from "next";
import ComingSoon from "@/components/tools/ComingSoon";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { getToolBySlug } from "@/data/tools";
import { toolMetadata } from "@/lib/seo";

const tool = getToolBySlug("image-converter")!;

export const metadata: Metadata = toolMetadata(tool);

export default function ImageConverterPage() {
  return (
    <ToolPageShell slug="image-converter">
      <ComingSoon name={tool.name} />
    </ToolPageShell>
  );
}
