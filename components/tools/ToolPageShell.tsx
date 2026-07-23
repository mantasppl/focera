import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import ToolLayout from "@/components/ToolLayout";
import { getToolBySlug } from "@/data/tools";

type ToolPageShellProps = {
  slug: string;
  children: ReactNode;
};

export default function ToolPageShell({ slug, children }: ToolPageShellProps) {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return <ToolLayout tool={tool}>{children}</ToolLayout>;
}
