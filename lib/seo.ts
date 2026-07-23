import type { Metadata } from "next";
import type { Tool } from "@/data/tools";

const SITE_NAME = "ToolHub";
const SITE_DESCRIPTION =
  "A hub of free web utilities — generators, calculators, converters, and developer tools.";

export function siteMetadata(overrides: Metadata = {}): Metadata {
  return {
    title: {
      default: `${SITE_NAME} — Free Online Tools`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    ...overrides,
  };
}

export function toolMetadata(tool: Tool): Metadata {
  return {
    title: tool.name,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: `${tool.name} | ${SITE_NAME}`,
      description: tool.description,
      type: "website",
    },
  };
}

export { SITE_NAME, SITE_DESCRIPTION };
