import Link from "next/link";
import type { Tool } from "@/data/tools";
import { formatToolCategories, toolCardDescription } from "@/data/tools";
import { cn } from "@/lib/utils";

type ToolCardProps = {
  tool: Tool;
  className?: string;
};

export default function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <Link
      href={tool.href}
      className={cn("tool-card", tool.status === "soon" && "is-soon", className)}
    >
      <div className="tool-card__meta">
        <span className="tool-card__category">
          {formatToolCategories(tool)}
        </span>
        {tool.status === "soon" ? (
          <span className="tool-card__badge">Soon</span>
        ) : null}
      </div>
      <h3 className="tool-card__title">{tool.name}</h3>
      <p className="tool-card__desc">{toolCardDescription(tool)}</p>
    </Link>
  );
}
