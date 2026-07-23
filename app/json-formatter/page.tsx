import type { Metadata } from "next";
import ComingSoon from "@/components/tools/ComingSoon";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { getToolBySlug } from "@/data/tools";
import { toolMetadata } from "@/lib/seo";

const tool = getToolBySlug("json-formatter")!;

export const metadata: Metadata = toolMetadata(tool);

export default function JSONFormatterPage() {
  return (
    <ToolPageShell slug="json-formatter">
      <ComingSoon name={tool.name} />
    </ToolPageShell>
  );
}
