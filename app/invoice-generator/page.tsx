import type { Metadata } from "next";
import ComingSoon from "@/components/tools/ComingSoon";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { getToolBySlug } from "@/data/tools";
import { toolMetadata } from "@/lib/seo";

const tool = getToolBySlug("invoice-generator")!;

export const metadata: Metadata = toolMetadata(tool);

export default function InvoiceGeneratorPage() {
  return (
    <ToolPageShell slug="invoice-generator">
      <ComingSoon name={tool.name} />
    </ToolPageShell>
  );
}
