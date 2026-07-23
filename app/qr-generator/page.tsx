import type { Metadata } from "next";
import ToolPageShell from "@/components/tools/ToolPageShell";
import QRGenerator from "@/components/tools/QRGenerator";
import { getToolBySlug } from "@/data/tools";
import { toolMetadata } from "@/lib/seo";

const tool = getToolBySlug("qr-generator")!;

export const metadata: Metadata = toolMetadata(tool);

export default function QRGeneratorPage() {
  return (
    <ToolPageShell slug="qr-generator">
      <QRGenerator />
    </ToolPageShell>
  );
}
