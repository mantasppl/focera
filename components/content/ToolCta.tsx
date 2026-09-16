"use client";

import Link from "next/link";
import { trackToolClick } from "@/components/content/BlogAnalytics";
import type { ContentTool } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type ToolCtaProps = {
  tool: ContentTool;
  label?: string;
  slug: string;
  className?: string;
};

export default function ToolCta({ tool, label, slug, className }: ToolCtaProps) {
  return (
    <Link
      href={tool.href}
      className={cn("blog-cta__button", className)}
      onClick={() => trackToolClick(tool.id, slug)}
    >
      {label || `Open ${tool.name}`}
    </Link>
  );
}
