export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const SCHEMA_TYPES = ["article", "faq", "howto"] as const;
export type SchemaType = (typeof SCHEMA_TYPES)[number];

export const ROBOTS_OPTIONS = ["index,follow", "noindex,follow", "noindex,nofollow"] as const;
export type RobotsDirective = (typeof ROBOTS_OPTIONS)[number];

export const CTA_POSITIONS = ["top", "middle", "bottom"] as const;
export type CtaPosition = (typeof CTA_POSITIONS)[number];

export const CTA_VARIANTS = ["button", "embed"] as const;
export type CtaVariant = (typeof CTA_VARIANTS)[number];

export const BLOCK_TYPES = [
  "text",
  "image",
  "video",
  "cta",
  "tool_embed",
  "faq",
  "list",
  "table",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export type FaqItem = {
  question: string;
  answer: string;
};

export type TextBlock = {
  id: string;
  type: "text";
  html: string;
};

export type ImageBlock = {
  id: string;
  type: "image";
  url: string;
  alt: string;
};

export type VideoBlock = {
  id: string;
  type: "video";
  url: string;
};

export type CtaBlock = {
  id: string;
  type: "cta";
  label: string;
  toolId: string;
};

export type ToolEmbedBlock = {
  id: string;
  type: "tool_embed";
  toolId: string;
};

export type FaqBlock = {
  id: string;
  type: "faq";
  items: FaqItem[];
};

export type ListBlock = {
  id: string;
  type: "list";
  ordered?: boolean;
  items: string[];
};

export type TableBlock = {
  id: string;
  type: "table";
  headers: string[];
  rows: string[][];
};

export type ContentBlock =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | CtaBlock
  | ToolEmbedBlock
  | FaqBlock
  | ListBlock
  | TableBlock;

export type CtaConfig = {
  positions: CtaPosition[];
  labels: Partial<Record<CtaPosition, string>>;
  variant?: CtaVariant;
};

export type ContentTool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  href: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  content: ContentBlock[];
  seoTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: RobotsDirective;
  schemaType: SchemaType;
  schemaJson: string;
  primaryToolId: string | null;
  relatedToolIds: string[];
  ctaConfig: CtaConfig;
  status: PostStatus;
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: PostStatus;
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type PostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  content?: ContentBlock[];
  contentJson?: string;
  seoTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: RobotsDirective;
  schemaType?: SchemaType;
  schemaJson?: string;
  schema?: unknown;
  primaryToolId?: string | null;
  relatedToolIds?: string[];
  relatedToolsJson?: string;
  ctaConfig?: CtaConfig;
  ctaConfigJson?: string;
  status?: PostStatus;
  publishedAt?: number | null;
};

export const DEFAULT_CTA_CONFIG: CtaConfig = {
  positions: ["top", "bottom"],
  labels: {},
  variant: "button",
};

export const BLOG_REVALIDATE_SECONDS = 60;
