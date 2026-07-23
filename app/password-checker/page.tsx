import type { Metadata } from "next";
import ComingSoon from "@/components/tools/ComingSoon";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { getToolBySlug } from "@/data/tools";
import { toolMetadata } from "@/lib/seo";

const tool = getToolBySlug("password-checker")!;

export const metadata: Metadata = toolMetadata(tool);

export default function PasswordCheckerPage() {
  return (
    <ToolPageShell slug="password-checker">
      <ComingSoon name={tool.name} />
    </ToolPageShell>
  );
}
