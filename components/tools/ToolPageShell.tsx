import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import ToolLayout from "@/components/ToolLayout";
import { ToolAnalyticsProvider } from "@/lib/analytics/client";
import { getToolBySlug } from "@/data/tools";

type ToolPageShellProps = {
  slug: string;
  children: ReactNode;
  content?: ReactNode;
  workspaceId?: string;
  ctaTitle?: string;
  ctaDescription?: string;
};

export default function ToolPageShell({
  slug,
  children,
  content,
  workspaceId,
  ctaTitle,
  ctaDescription,
}: ToolPageShellProps) {
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <ToolAnalyticsProvider toolId={tool.slug}>
      <ToolLayout
        tool={tool}
        content={content}
        workspaceId={workspaceId}
        ctaTitle={ctaTitle}
        ctaDescription={ctaDescription}
      >
        {children}
      </ToolLayout>
    </ToolAnalyticsProvider>
  );
}
