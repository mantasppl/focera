import {
  getToolsByCategory,
  type Tool,
} from "@/data/tools";

export const imageNicheOrder = [
  "edit-image",
  "size-color-text",
  "change-image-format",
] as const;

export type ImageNicheId = (typeof imageNicheOrder)[number];

export type ImageNicheMeta = {
  id: ImageNicheId;
  name: string;
  shortName: string;
  description: string;
};

export const imageNicheMeta: Record<ImageNicheId, ImageNicheMeta> = {
  "edit-image": {
    id: "edit-image",
    name: "Edit image",
    shortName: "Edit",
    description:
      "Cut backgrounds, clean photos, and shape pictures without extra software.",
  },
  "change-image-format": {
    id: "change-image-format",
    name: "Change image format",
    shortName: "Format",
    description:
      "Convert photos and documents between JPG, PNG, WebP, PDF, HEIC, and more.",
  },
  "size-color-text": {
    id: "size-color-text",
    name: "Size, color, text",
    shortName: "Size",
    description:
      "Resize, compress, recolor, stamp text, and finish everyday photo tasks.",
  },
};

/** Curated order for the Edit image niche. */
const EDIT_IMAGE_SLUGS = [
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
] as const;

/** Curated order for format converters. */
const CHANGE_FORMAT_SLUGS = [
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
] as const;

/**
 * Preferred order for leftover image tools (size, color, text, and adjacent
 * finishing utilities). Any unlisted image tool is appended after these.
 */
const SIZE_COLOR_TEXT_SLUGS = [
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
] as const;

export type ImageNicheGroup = {
  niche: ImageNicheMeta;
  tools: Tool[];
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

export function groupImageTools(tools: Tool[]): ImageNicheGroup[] {
  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));
  const used = new Set<string>();

  const edit = pickInOrder(bySlug, EDIT_IMAGE_SLUGS, used);
  const format = pickInOrder(bySlug, CHANGE_FORMAT_SLUGS, used);
  const sizePreferred = pickInOrder(bySlug, SIZE_COLOR_TEXT_SLUGS, used);
  const leftover = tools.filter((tool) => !used.has(tool.slug));

  return [
    { niche: imageNicheMeta["edit-image"], tools: edit },
    {
      niche: imageNicheMeta["size-color-text"],
      tools: [...sizePreferred, ...leftover],
    },
    { niche: imageNicheMeta["change-image-format"], tools: format },
  ];
}

export function getGroupedImageTools(): ImageNicheGroup[] {
  return groupImageTools(getToolsByCategory("image"));
}

export function flattenGroupedImageTools(): Tool[] {
  return getGroupedImageTools().flatMap((group) => group.tools);
}

export function imageNicheSectionId(id: ImageNicheId): string {
  return `image-niche-${id}`;
}
