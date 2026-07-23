import type { Metadata } from "next";
import Calculator from "@/components/Calculator";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { getToolBySlug } from "@/data/tools";
import { toolMetadata } from "@/lib/seo";

const tool = getToolBySlug("profit-calculator")!;

export const metadata: Metadata = toolMetadata(tool);

export default function ProfitCalculatorPage() {
  return (
    <ToolPageShell slug="profit-calculator">
      <Calculator />
    </ToolPageShell>
  );
}
