import {
  getToolsByCategory,
  type Tool,
  type ToolCategory,
} from "@/data/tools";

export type NicheTone = "sky" | "teal" | "violet" | "warm" | "slate";

export type NicheIconKind =
  | "edit"
  | "format"
  | "adjust"
  | "protect"
  | "audio"
  | "download"
  | "write"
  | "speech"
  | "generate"
  | "code";

export type CategoryNicheDef = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  tone: NicheTone;
  icon: NicheIconKind;
  slugs: readonly string[];
  remainder?: boolean;
};

export type CategoryNicheGroup = {
  niche: CategoryNicheDef;
  tools: Tool[];
};

const IMAGE_NICHES: CategoryNicheDef[] = [
  {
    id: "edit-image",
    name: "Edit image",
    shortName: "Edit",
    description:
      "Cut backgrounds, clean photos, and shape pictures without extra software.",
    tone: "sky",
    icon: "edit",
    slugs: [
      "background-remover",
      "change-background",
      "blur-background",
      "make-background-transparent",
      "cleanup-picture",
      "remove-objects",
      "remove-person",
      "remove-watermark",
      "unblur-image",
      "add-images-to-image",
      "add-border-to-image",
      "round-image",
    ],
  },
  {
    id: "size-color-text",
    name: "Size, color, text",
    shortName: "Size",
    description:
      "Resize, compress, recolor, stamp text, and finish everyday photo tasks.",
    tone: "violet",
    icon: "adjust",
    remainder: true,
    slugs: [
      "resize-image",
      "crop-image",
      "upscale-image",
      "image-compressor",
      "image-splitter",
      "flip-image",
      "combine-photo",
      "photo-collage",
      "profile-photo-maker",
      "color-palette-generator",
      "black-and-white-photo",
      "colorize-photo",
      "pixelate-image",
      "ai-image-generator",
      "add-text-on-image",
      "image-to-text",
      "translate-your-image",
      "view-metadata-for-your-image",
      "add-images-to-pdf",
      "pdf-watermark",
    ],
  },
  {
    id: "change-image-format",
    name: "Change image format",
    shortName: "Format",
    description:
      "Convert photos and documents between JPG, PNG, WebP, PDF, HEIC, and more.",
    tone: "teal",
    icon: "format",
    slugs: [
      "gif-to-mp4",
      "heic-to-jpg",
      "heic-to-png",
      "pdf-to-jpg",
      "extract-images-from-pdf",
      "pdf-to-png",
      "pdf-to-tiff",
      "image-to-pdf",
      "png-to-pdf",
      "png-to-jpg",
      "png-to-webp",
      "png-to-svg",
      "png-to-eps",
      "eps-to-png",
      "psd-to-jpg",
      "psd-to-png",
      "psd-to-ai",
      "png-to-gif",
      "jpg-to-svg",
      "jpg-to-png",
      "svg-to-png",
      "jpg-to-webp",
      "jpg-to-gif",
      "jpg-to-tiff",
      "webp-to-jpg",
      "webp-to-png",
      "webp-to-gif",
      "webp-to-pdf",
      "gif-to-pdf",
      "tiff-to-jpg",
      "tiff-to-pdf",
    ],
  },
];

const PDF_NICHES: CategoryNicheDef[] = [
  {
    id: "edit-pdf",
    name: "Edit PDF",
    shortName: "Edit",
    description:
      "Merge, split, annotate, sign, and rearrange pages in your browser.",
    tone: "teal",
    icon: "edit",
    slugs: [
      "pdf-editor",
      "pdf-creator",
      "merge-pdf",
      "split-pdf",
      "rotate-pdf",
      "rearrange-pdf",
      "delete-pdf-pages",
      "esign-pdf",
      "add-page-numbers-to-pdf",
      "annotate-pdf",
      "add-text-to-pdf",
      "add-images-to-pdf",
      "crop-pdf",
    ],
  },
  {
    id: "compress-protect",
    name: "Compress & protect",
    shortName: "Protect",
    description:
      "Shrink file size, lock or unlock a PDF, and stamp a watermark.",
    tone: "warm",
    icon: "protect",
    slugs: ["compress-pdf", "protect-pdf", "unlock-pdf", "pdf-watermark"],
  },
  {
    id: "change-pdf-format",
    name: "Change PDF format",
    shortName: "Format",
    description:
      "Convert PDFs to Word, Excel, images, ebooks, and back again.",
    tone: "slate",
    icon: "format",
    remainder: true,
    slugs: [
      "pdf-to-word",
      "word-to-pdf",
      "pdf-to-excel",
      "pdf-to-csv",
      "pdf-to-powerpoint",
      "powerpoint-to-pdf",
      "url-to-pdf",
      "outlook-to-pdf",
      "pdf-to-text",
      "pdf-translator",
      "pdf-to-jpg",
      "pdf-to-png",
      "pdf-to-tiff",
      "extract-images-from-pdf",
      "image-to-pdf",
      "png-to-pdf",
      "webp-to-pdf",
      "gif-to-pdf",
      "tiff-to-pdf",
      "eps-to-pdf",
      "pdf-to-epub",
      "pdf-to-mobi",
      "pdf-to-azw3",
      "epub-to-pdf",
      "mobi-to-pdf",
      "azw3-to-pdf",
    ],
  },
];

const VIDEO_NICHES: CategoryNicheDef[] = [
  {
    id: "edit-video",
    name: "Edit video",
    shortName: "Edit",
    description:
      "Compress, trim, and convert clips for upload, chat, and social posts.",
    tone: "warm",
    icon: "edit",
    slugs: ["compress-video", "trim-video", "video-to-gif", "gif-to-mp4"],
  },
  {
    id: "audio-captions",
    name: "Audio & captions",
    shortName: "Audio",
    description:
      "Extract soundtracks, add captions, and turn speech into text.",
    tone: "teal",
    icon: "audio",
    slugs: [
      "extract-audio",
      "mp4-to-mp3",
      "video-autocaption",
      "video-to-text",
      "audio-to-text",
      "youtube-to-text",
      "youtube-summarize",
    ],
  },
  {
    id: "download-video",
    name: "Download video",
    shortName: "Save",
    description:
      "Save clips from TikTok, Instagram, X, and Facebook when you have the right to use them.",
    tone: "slate",
    icon: "download",
    remainder: true,
    slugs: [
      "tiktok-video-downloader",
      "instagram-video-downloader",
      "twitter-video-downloader",
      "facebook-video-downloader",
    ],
  },
];

const AI_NICHES: CategoryNicheDef[] = [
  {
    id: "ai-images",
    name: "AI images",
    shortName: "Images",
    description:
      "Generate pictures and clean photos with background, blur, and color tools.",
    tone: "teal",
    icon: "generate",
    slugs: [
      "ai-image-generator",
      "background-remover",
      "change-background",
      "blur-background",
      "make-background-transparent",
      "unblur-image",
      "colorize-photo",
    ],
  },
  {
    id: "ai-writing",
    name: "AI writing",
    shortName: "Write",
    description:
      "Draft essays, paragraphs, and stories, or tighten existing copy.",
    tone: "violet",
    icon: "write",
    slugs: [
      "essay-writer",
      "content-improver",
      "ai-story-generator",
      "ai-paragraph-generator",
    ],
  },
  {
    id: "speech-text",
    name: "Speech & text",
    shortName: "Text",
    description:
      "Transcribe video and audio, summarize YouTube, OCR photos, and translate.",
    tone: "sky",
    icon: "speech",
    remainder: true,
    slugs: [
      "youtube-summarize",
      "youtube-to-text",
      "video-to-text",
      "audio-to-text",
      "image-to-text",
      "translate-your-image",
      "pdf-translator",
    ],
  },
];

const FILE_NICHES: CategoryNicheDef[] = [
  {
    id: "generators",
    name: "Generators",
    shortName: "Make",
    description:
      "Create QR codes, passwords, invoices, UTMs, and everyday numbers or text.",
    tone: "slate",
    icon: "generate",
    slugs: [
      "qr-generator",
      "password-generator",
      "invoice-generator",
      "lorem-ipsum-generator",
      "utm-builder",
      "profit-calculator",
      "unit-converter",
      "word-counter",
      "text-case-converter",
    ],
  },
  {
    id: "code-text",
    name: "Code & text",
    shortName: "Code",
    description:
      "Format JSON, edit Markdown, minify front-end files, and improve writing.",
    tone: "teal",
    icon: "code",
    slugs: [
      "json-formatter",
      "markdown-editor",
      "html-css-js-minifier",
      "content-improver",
      "essay-writer",
      "ai-paragraph-generator",
    ],
  },
  {
    id: "convert-files",
    name: "Convert files",
    shortName: "Convert",
    description:
      "Turn office docs, ebooks, design files, and media into the format you need.",
    tone: "sky",
    icon: "format",
    remainder: true,
    slugs: [
      "pdf-to-word",
      "word-to-pdf",
      "pdf-to-excel",
      "pdf-to-csv",
      "pdf-to-powerpoint",
      "powerpoint-to-pdf",
      "url-to-pdf",
      "outlook-to-pdf",
      "pdf-to-text",
      "pdf-to-epub",
      "pdf-to-mobi",
      "pdf-to-azw3",
      "epub-to-pdf",
      "mobi-to-pdf",
      "azw3-to-pdf",
      "psd-to-jpg",
      "psd-to-png",
      "psd-to-ai",
      "eps-to-pdf",
      "video-to-gif",
      "extract-audio",
      "mp4-to-mp3",
    ],
  },
];

export const categoryNiches: Record<ToolCategory, CategoryNicheDef[]> = {
  pdf: PDF_NICHES,
  image: IMAGE_NICHES,
  video: VIDEO_NICHES,
  ai: AI_NICHES,
  file: FILE_NICHES,
};

function pickInOrder(
  bySlug: Map<string, Tool>,
  slugs: readonly string[],
  used: Set<string>,
): Tool[] {
  const picked: Tool[] = [];
  for (const slug of slugs) {
    const tool = bySlug.get(slug);
    if (!tool || used.has(slug)) continue;
    picked.push(tool);
    used.add(slug);
  }
  return picked;
}

export function getCategoryNiches(category: ToolCategory): CategoryNicheDef[] {
  return categoryNiches[category];
}

export function groupCategoryTools(
  category: ToolCategory,
  tools: Tool[],
): CategoryNicheGroup[] {
  const niches = getCategoryNiches(category);
  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));
  const used = new Set<string>();
  const picked = niches.map((niche) => ({
    niche,
    tools: pickInOrder(bySlug, niche.slugs, used),
  }));

  const leftover = tools.filter((tool) => !used.has(tool.slug));
  if (leftover.length) {
    const remainder =
      picked.find((group) => group.niche.remainder) ?? picked.at(-1);
    if (remainder) remainder.tools.push(...leftover);
  }

  return picked;
}

export function flattenGroupedCategoryTools(category: ToolCategory): Tool[] {
  return groupCategoryTools(category, getToolsByCategory(category)).flatMap(
    (group) => group.tools,
  );
}

export function categoryNicheSectionId(
  category: ToolCategory,
  id: string,
): string {
  return `${category}-niche-${id}`;
}
