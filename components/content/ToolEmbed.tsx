import Link from "next/link";
import ToolCta from "@/components/content/ToolCta";
import ToolIcon from "@/components/ToolIcon";
import type { ContentTool } from "@/lib/content/types";

type ToolEmbedProps = {
  tool: ContentTool;
  slug: string;
};

export default function ToolEmbed({ tool, slug }: ToolEmbedProps) {
  return (
    <aside className="blog-embed">
      <div className="blog-embed__icon" aria-hidden="true">
        <ToolIcon slug={tool.slug} />
      </div>
      <div className="blog-embed__body">
        <p className="blog-embed__eyebrow">Free tool</p>
        <h3 className="blog-embed__title">
          <Link href={tool.href}>{tool.name}</Link>
        </h3>
        <p className="blog-embed__desc">{tool.description}</p>
        <ToolCta tool={tool} slug={slug} label={`Use ${tool.name}`} />
      </div>
    </aside>
  );
}
