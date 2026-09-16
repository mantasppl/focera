import Link from "next/link";
import ToolIcon from "@/components/ToolIcon";
import type { Tool, ToolCategory } from "@/data/tools";
import {
  getPrimaryCategory,
  toolCardDescription,
} from "@/data/tools";
import { cn } from "@/lib/utils";

export type RankedToolsTone = "trending" | "top" | "best";

type RankedToolsSectionProps = {
  id: string;
  title: string;
  lede: string;
  tone: RankedToolsTone;
  tools: Tool[];
};

const categoryShort: Record<ToolCategory, string> = {
  pdf: "PDF",
  image: "Image",
  video: "Video",
  ai: "AI",
  file: "File",
};

function FireIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.6s1.7 2.2 1.7 4.6c0 1.5-.7 2.7-1.7 3.5-1-2.1-3.2-2.8-3.2-5.3 0-1.4.5-2.6 1.2-3.5C8.2 4.3 6 7.1 6 10.8c0 3.6 2.6 6.6 6 6.6s6-3 6-6.6c0-3.2-1.8-5.6-3.4-7.2-.2 1.6-1.1 2.8-2.6 3.5Z"
        fill="currentColor"
      />
      <path
        d="M12 19.8c-2.4 0-4.3-1.6-4.3-3.7 0-1.4.9-2.5 2.1-3.1-.2 1.3.5 2.4 1.6 2.9.6-1.2 1.8-1.8 1.8-3.3 1.7.8 2.9 2.4 2.9 4.2 0 2.1-1.8 3-4.1 3Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.2 13.5 9 19.4 10.5 13.5 12 12 17.8 10.5 12 4.6 10.5 10.5 9 12 3.2Z"
        fill="currentColor"
      />
      <path
        d="M18.2 14.6 19 17.1 21.5 18 19 18.8 18.2 21.3 17.4 18.8 14.9 18 17.4 17.1 18.2 14.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.6 17.4 3.2 8.2l4.6 3.2L12 5.4l4.2 6 4.6-3.2-1.4 9.2H4.6Z"
        fill="currentColor"
      />
      <path d="M5.2 19.2h13.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function toneIcon(tone: RankedToolsTone) {
  if (tone === "trending") return <FireIcon />;
  if (tone === "best") return <CrownIcon />;
  return <SparkIcon />;
}

export default function RankedToolsSection({
  id,
  title,
  lede,
  tone,
  tools,
}: RankedToolsSectionProps) {
  if (!tools.length) return null;

  const headingId = `${id}-heading`;

  return (
    <section
      className={cn("page-section ranked-tools", `ranked-tools--${tone}`)}
      aria-labelledby={headingId}
      id={id}
    >
      <div className="ranked-tools__head">
        <div className="ranked-tools__titles">
          <h2 id={headingId} className="ranked-tools__title">
            <span className="ranked-tools__mark" aria-hidden="true">
              {toneIcon(tone)}
            </span>
            {title}
          </h2>
          <p className="ranked-tools__lede">{lede}</p>
        </div>
        <Link href="/tools" className="ranked-tools__more">
          Browse catalog
        </Link>
      </div>

      <ol className="ranked-tools__grid">
        {tools.map((tool, index) => {
          const rank = index + 1;
          const lead = rank === 1;
          const category = categoryShort[getPrimaryCategory(tool)];

          return (
            <li
              key={tool.slug}
              className={cn("ranked-block-wrap", lead && "ranked-block-wrap--lead")}
            >
              <Link
                href={tool.href}
                className={cn("ranked-block", lead && "ranked-block--lead")}
              >
                <span className="ranked-block__rank">{String(rank).padStart(2, "0")}</span>
                <span className="ranked-block__icon" aria-hidden="true">
                  <ToolIcon slug={tool.slug} className="ranked-block__svg" />
                </span>
                <span className="ranked-block__body">
                  <span className="ranked-block__top">
                    <span className="ranked-block__category">{category}</span>
                    {tone === "trending" && lead ? (
                      <span className="ranked-block__hot">
                        <FireIcon />
                        Hot
                      </span>
                    ) : null}
                  </span>
                  <span className="ranked-block__name">{tool.shortName}</span>
                  {lead ? (
                    <span className="ranked-block__desc">
                      {toolCardDescription(tool, 72)}
                    </span>
                  ) : null}
                </span>
                <span className="ranked-block__go" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h12.5M13 6.5 18.5 12 13 17.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
