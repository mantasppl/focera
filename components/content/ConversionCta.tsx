import ToolCta from "@/components/content/ToolCta";
import ToolEmbed from "@/components/content/ToolEmbed";
import type { ContentTool, CtaConfig, CtaPosition } from "@/lib/content/types";

type ConversionCtaProps = {
  position: CtaPosition;
  config: CtaConfig;
  tool: ContentTool | null;
  slug: string;
};

export default function ConversionCta({
  position,
  config,
  tool,
  slug,
}: ConversionCtaProps) {
  if (!tool || !config.positions.includes(position)) return null;

  const label =
    config.labels[position] ||
    (position === "top" ? `Try ${tool.name}` : `Open ${tool.name}`);

  return (
    <section className={`blog-cta blog-cta--${position}`}>
      <div className="blog-cta__copy">
        <p className="blog-cta__eyebrow">Recommended tool</p>
        <h2 className="blog-cta__title">{tool.name}</h2>
        <p className="blog-cta__desc">{tool.description}</p>
        <ToolCta tool={tool} label={label} slug={slug} />
      </div>
      {position === "top" && config.variant === "embed" ? (
        <ToolEmbed tool={tool} slug={slug} />
      ) : null}
    </section>
  );
}
