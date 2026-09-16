import ToolCta from "@/components/content/ToolCta";
import ToolEmbed from "@/components/content/ToolEmbed";
import { autoLinkToolKeywords } from "@/lib/content/internal-links";
import type { ContentBlock, ContentTool } from "@/lib/content/types";
import { youtubeEmbedUrl } from "@/lib/content/youtube";
import { contentMarkdownToHtml } from "@/lib/content/markdown";
import { sanitizeHtmlBasic } from "@/lib/security/sanitize-html";

type ContentRendererProps = {
  blocks: ContentBlock[];
  tools: ContentTool[];
  slug: string;
};

function toolById(tools: ContentTool[], id: string): ContentTool | null {
  return tools.find((tool) => tool.id === id || tool.slug === id) || null;
}

function TextHtml({ html, tools }: { html: string; tools: ContentTool[] }) {
  const rendered = autoLinkToolKeywords(contentMarkdownToHtml(html), tools);
  return (
    <div
      className="blog-prose"
      dangerouslySetInnerHTML={{ __html: sanitizeHtmlBasic(rendered) }}
    />
  );
}

export default function ContentRenderer({
  blocks,
  tools,
  slug,
}: ContentRendererProps) {
  if (!blocks.length) return null;

  return (
    <div className="blog-blocks">
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} tools={tools} slug={slug} />
      ))}
    </div>
  );
}

function BlockView({
  block,
  tools,
  slug,
}: {
  block: ContentBlock;
  tools: ContentTool[];
  slug: string;
}) {
  switch (block.type) {
    case "text":
      return <TextHtml html={block.html} tools={tools} />;
    case "image":
      if (!block.url) return null;
      return (
        <figure className="blog-figure">
          {/* User-supplied image URLs; avoid next/image remote host config. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.url} alt={block.alt || ""} loading="lazy" />
          {block.alt ? <figcaption>{block.alt}</figcaption> : null}
        </figure>
      );
    case "video": {
      const embed = youtubeEmbedUrl(block.url);
      if (!embed) return null;
      return (
        <div className="blog-video">
          <iframe
            src={embed}
            title="YouTube video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    case "cta": {
      const tool = toolById(tools, block.toolId);
      if (!tool) return null;
      return (
        <div className="blog-cta blog-cta--inline">
          <ToolCta tool={tool} label={block.label} slug={slug} />
        </div>
      );
    }
    case "tool_embed": {
      const tool = toolById(tools, block.toolId);
      if (!tool) return null;
      return <ToolEmbed tool={tool} slug={slug} />;
    }
    case "faq":
      if (!block.items.length) return null;
      return (
        <dl className="blog-faq">
          {block.items.map((item, index) => (
            <div key={`${block.id}-${index}`} className="blog-faq__item">
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      );
    case "list": {
      const items = block.items.filter((item) => item.trim());
      if (!items.length) return null;
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag className="blog-list">
          {items.map((item, index) => (
            <li key={`${block.id}-${index}`}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case "table":
      if (!block.headers.length && !block.rows.length) return null;
      return (
        <div className="blog-table-wrap">
          <table className="blog-table">
            {block.headers.length ? (
              <thead>
                <tr>
                  {block.headers.map((header, index) => (
                    <th key={`${block.id}-h-${index}`}>{header}</th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${block.id}-r-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${block.id}-c-${rowIndex}-${cellIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}
