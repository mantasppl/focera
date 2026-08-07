import Link from "next/link";
import ToolIcon from "@/components/ToolIcon";
import type { Tool } from "@/data/tools";
import { toolCardDescription, toolSeoTag } from "@/data/tools";
import { cn } from "@/lib/utils";

type ToolChipProps = {
  tool: Tool;
  className?: string;
};

export default function ToolChip({ tool, className }: ToolChipProps) {
  const tag = toolSeoTag(tool);
  const desc = toolCardDescription(tool, 64);

  return (
    <Link
      href={tool.href}
      className={cn(
        "tool-chip",
        tool.status === "soon" && "is-soon",
        className,
      )}
      title={tool.name}
    >
      <span className="tool-chip__icon" aria-hidden="true">
        <ToolIcon slug={tool.slug} />
      </span>
      <span className="tool-chip__body">
        <span className="tool-chip__tag">
          {tag}
          {tool.status === "soon" ? (
            <span className="tool-chip__badge">Soon</span>
          ) : null}
        </span>
        <span className="tool-chip__desc">{desc}</span>
      </span>
    </Link>
  );
}
