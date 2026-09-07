import type { Tool, ToolCategory } from "@/data/tools";

export type SeedComment = {
  name: string;
  content: string;
  rating: number;
  likes: number;
  /** Hours ago from "now" when seeding. */
  hoursAgo: number;
  replies?: Array<{
    name: string;
    content: string;
    likes: number;
    hoursAgo: number;
  }>;
};

/** Bump to wipe old seeds and regenerate on next load. */
export const COMMENT_SEED_VERSION = "3";

const AUTHORS = [
  "Maya Chen",
  "Alex Rivera",
  "Priya Nair",
  "Chris Walsh",
  "Elena Voss",
  "Noah Park",
  "Riley Brooks",
  "Fatima Hassan",
  "Tomás Silva",
  "Hannah Kim",
  "Dev Patel",
  "Olivia Grant",
  "Marcus Webb",
  "Sofia Berg",
  "Jake Miller",
  "Aisha Rahman",
  "Jordan Lee",
  "Sam Okonkwo",
] as const;

type ToolCtx = {
  slug: string;
  name: string;
  shortName: string;
  categories: ToolCategory[];
};

type Template = {
  content: string;
  rating: number;
  reply?: string;
};

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length) % items.length]!;
}

function pickAuthor(rand: () => number, used: Set<string>): string {
  for (let i = 0; i < 12; i++) {
    const name = pick(rand, AUTHORS);
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const fallback = pick(rand, AUTHORS);
  used.add(fallback);
  return fallback;
}

function lowLikes(rand: () => number): number {
  // Mostly 0–3, rarely 4–5
  const roll = rand();
  if (roll < 0.35) return 0;
  if (roll < 0.65) return 1;
  if (roll < 0.85) return 2;
  if (roll < 0.95) return 3;
  return roll < 0.98 ? 4 : 5;
}

function hoursAgo(rand: () => number, min: number, max: number): number {
  return Math.floor(min + rand() * (max - min));
}

function fill(text: string, ctx: ToolCtx, extra: Record<string, string> = {}): string {
  return text
    .replaceAll("{tool}", ctx.name)
    .replaceAll("{short}", ctx.shortName)
    .replaceAll("{from}", extra.from ?? "")
    .replaceAll("{to}", extra.to ?? "");
}

function parseFormatPair(slug: string): { from: string; to: string } | null {
  const match = slug.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (!match) return null;
  return {
    from: match[1]!.toUpperCase(),
    to: match[2]!.toUpperCase(),
  };
}

/** Unique comments for tools with clear, distinct use cases. */
const SLUG_TEMPLATES: Record<string, Template[]> = {
  "compress-pdf": [
    {
      content:
        "Compressed a 28 MB client proposal down to 4 MB without making the text fuzzy. Good enough to email without bouncing.",
      rating: 5,
      reply: "Same — I use medium quality for decks and high only when print matters.",
    },
    {
      content:
        "Works well on scanned invoices. Tip: if the PDF is image-heavy, expect less reduction than on text PDFs.",
      rating: 4,
    },
    {
      content:
        "Slightly slow on a 90-page report, but the download was fine. Better than installing another desktop app.",
      rating: 3,
    },
  ],
  "merge-pdf": [
    {
      content:
        "Merged three quote PDFs into one packet for a vendor. Order stayed correct and page sizes didn’t get weird.",
      rating: 5,
    },
    {
      content:
        "Drag-and-drop reorder saved me. Combined a cover letter + resume + portfolio in under a minute.",
      rating: 5,
      reply: "Used it for the same job-application pack — clean result.",
    },
  ],
  "split-pdf": [
    {
      content:
        "Pulled just pages 12–18 out of a long contract for legal review. Exactly the range I needed.",
      rating: 5,
    },
    {
      content:
        "Split a scanned packet into individual forms. Straightforward, no account nagging.",
      rating: 4,
    },
  ],
  "background-remover": [
    {
      content:
        "Removed the messy kitchen background from a product shot. Edges on the bottle looked clean enough for our Shopify listing.",
      rating: 5,
      reply: "Hair edges are hit-or-miss for me, but products work great.",
    },
    {
      content:
        "Used it for a LinkedIn headshot. Background gone in one pass — I just dropped in a solid color after.",
      rating: 4,
    },
    {
      content:
        "Okay on simple subjects. Struggle a bit with semi-transparent glass, but still useful for drafts.",
      rating: 3,
    },
  ],
  "ai-image-generator": [
    {
      content:
        "Prompt that worked: “flat vector icon of a passport stamp, teal and cream, no text, white background.” Got a usable asset on try two.",
      rating: 5,
    },
    {
      content:
        "Good for moodboards. Less reliable when I ask for readable typography inside the image.",
      rating: 3,
      reply: "Yeah — I add text later in another tool instead.",
    },
  ],
  "qr-generator": [
    {
      content:
        "Made a QR for our Wi‑Fi card and a second one for the menu URL. Both scanned fine from a printed flyer.",
      rating: 5,
    },
    {
      content:
        "Simple and fast. Wish the download defaulted to SVG more obviously, but PNG worked for Canva.",
      rating: 4,
    },
  ],
  "password-generator": [
    {
      content:
        "Generated a 20-char password with symbols for a new banking login. Copy button made it painless.",
      rating: 5,
    },
    {
      content:
        "I dial symbols off when a site rejects them. Still better than reusing old passwords.",
      rating: 4,
    },
  ],
  "image-compressor": [
    {
      content:
        "Brought a 6 MB hero image down to ~400 KB for the homepage. Visual difference was tiny on desktop.",
      rating: 5,
    },
    {
      content:
        "Useful before uploading to a CMS with a 1 MB limit. Quality slider is clear.",
      rating: 4,
    },
  ],
  "compress-video": [
    {
      content:
        "Compressed a 4K phone clip for Slack. File went from ~400 MB to something shareable without looking awful.",
      rating: 5,
    },
    {
      content:
        "Takes a while on longer clips in-browser, but privacy-wise I prefer that over uploading to random sites.",
      rating: 4,
    },
  ],
  "trim-video": [
    {
      content:
        "Cut a 45s talking-head down to the 12s highlight for Stories. In/out handles were accurate enough.",
      rating: 5,
    },
  ],
  "video-to-gif": [
    {
      content:
        "Turned a 6s product spin into a GIF for the docs site. 10 fps + medium size kept it under email limits.",
      rating: 5,
    },
    {
      content:
        "Colors get posterized on gradients — expected for GIF. Still fine for UI demos.",
      rating: 3,
    },
  ],
  "pdf-to-word": [
    {
      content:
        "Converted a text-based quote PDF so I could edit prices in Word. Layout wasn’t perfect but editable.",
      rating: 4,
    },
    {
      content:
        "Scanned PDFs stay image-ish — don’t expect magic OCR here. Works best on digital text PDFs.",
      rating: 3,
    },
  ],
  "word-to-pdf": [
    {
      content:
        "Exported a resume DOCX to PDF for applications. Fonts and spacing looked the same as Word.",
      rating: 5,
    },
  ],
  "unlock-pdf": [
    {
      content:
        "Removed a password from an old tax PDF I own. Did exactly one job and got out of the way.",
      rating: 5,
    },
  ],
  "protect-pdf": [
    {
      content:
        "Added a password before sending a signed agreement. Recipient opened it fine with the passphrase we shared.",
      rating: 5,
    },
  ],
  "esign-pdf": [
    {
      content:
        "Signed a vendor W‑9 without printing. Placed the signature, downloaded, done.",
      rating: 5,
    },
    {
      content:
        "Signature looks a bit soft on a low-res trackpad draw, but typed initials worked for informal forms.",
      rating: 4,
    },
  ],
  "youtube-to-text": [
    {
      content:
        "Transcribed a 12‑minute tutorial so I could skim quotes for notes. Timestamps helped find sections again.",
      rating: 5,
    },
    {
      content:
        "Accent-heavy audio needed light cleanup, but way faster than typing it myself.",
      rating: 4,
    },
  ],
  "youtube-summarize": [
    {
      content:
        "Summarized a long podcast episode before a meeting. Bullet points were accurate enough to brief the team.",
      rating: 5,
    },
  ],
  "audio-to-text": [
    {
      content:
        "Transcribed a voice memo interview. Missed a few proper nouns, but dialogue structure was solid.",
      rating: 4,
    },
  ],
  "video-autocaption": [
    {
      content:
        "Auto captions on a product demo were ~90% right. Fixed brand names manually and exported.",
      rating: 4,
      reply: "Same — always spot-check names and numbers.",
    },
  ],
  "color-palette-generator": [
    {
      content:
        "Pulled a palette from a brand photo for a landing page. Hex values copied cleanly into Figma.",
      rating: 5,
    },
  ],
  "invoice-generator": [
    {
      content:
        "Built a one-off freelance invoice with tax line and downloaded PDF. No account required, which I needed.",
      rating: 5,
    },
  ],
  "content-improver": [
    {
      content:
        "Pastes my rough blog draft and asked for clearer structure. Kept my voice better than generic rewrites.",
      rating: 4,
    },
  ],
  "essay-writer": [
    {
      content:
        "Used it to outline a history essay, then rewrote in my own words. Helpful scaffold, not a final submit.",
      rating: 4,
    },
  ],
  "resize-image": [
    {
      content:
        "Resized product photos to 1200px wide for the store. Aspect lock saved me from stretching anything.",
      rating: 5,
    },
  ],
  "crop-image": [
    {
      content:
        "Cropped screenshots to a 1:1 for Instagram. Guides were precise enough on mobile too.",
      rating: 5,
    },
  ],
  "upscale-image": [
    {
      content:
        "Upscaled an old logo for a poster. Soft, but better than the pixelated original at print size.",
      rating: 4,
    },
  ],
  "heic-to-jpg": [
    {
      content:
        "Converted iPhone HEICs so a Windows teammate could open them in Outlook. Batch of 8 worked fine.",
      rating: 5,
    },
  ],
  "json-formatter": [
    {
      content:
        "Pretty-printed a messy API response and caught a missing comma immediately. Bookmark-worthy.",
      rating: 5,
    },
  ],
  "markdown-editor": [
    {
      content:
        "Drafted README content with live preview. Export was clean enough to paste into GitHub.",
      rating: 4,
    },
  ],
  "utm-builder": [
    {
      content:
        "Built campaign links for a newsletter CTA. Parameters were correct when I checked in the analytics debugger.",
      rating: 5,
    },
  ],
  "word-counter": [
    {
      content:
        "Checked a grant abstract against a 250-word limit. Character count matched what the portal showed.",
      rating: 5,
    },
  ],
  "text-case-converter": [
    {
      content:
        "Converted a slug list to Title Case for a CMS import. Dumb job, done in seconds.",
      rating: 5,
    },
  ],
  "lorem-ipsum-generator": [
    {
      content:
        "Generated a few paragraphs for a wireframe. Paragraph count control is all I needed.",
      rating: 4,
    },
  ],
  "unit-converter": [
    {
      content:
        "Converted cm ↔ inches for a packaging spec. No ads, no nonsense.",
      rating: 5,
    },
  ],
  "profit-calculator": [
    {
      content:
        "Ran margin math on a wholesale order before quoting the client. Clear inputs.",
      rating: 4,
    },
  ],
  "tiktok-video-downloader": [
    {
      content:
        "Saved my own TikTok draft without watermark for a client cutdown. Paste URL → download was enough.",
      rating: 4,
    },
  ],
  "instagram-video-downloader": [
    {
      content:
        "Downloaded a Reel I posted to reuse in a pitch deck. Quality was acceptable for slides.",
      rating: 4,
    },
  ],
  "make-background-transparent": [
    {
      content:
        "Made a logo PNG with transparency for a dark site header. Clean cut on solid colors.",
      rating: 5,
    },
  ],
  "change-background": [
    {
      content:
        "Swapped a dull office backdrop for a soft gradient on a headshot. Looked natural enough for the about page.",
      rating: 4,
    },
  ],
  "blur-background": [
    {
      content:
        "Blurred a busy café background on a Zoom still. Subject stayed sharp.",
      rating: 5,
    },
  ],
  "pdf-watermark": [
    {
      content:
        "Added a light “DRAFT” watermark diagonally across a proposal. Opacity control mattered.",
      rating: 5,
    },
  ],
  "add-page-numbers-to-pdf": [
    {
      content:
        "Numbered a 40-page handbook footer. Started at 1 after the cover by trimming first — workaround worked.",
      rating: 4,
    },
  ],
  "rotate-pdf": [
    {
      content:
        "Fixed sideways phone scans in a PDF packet. Rotated selected pages only.",
      rating: 5,
    },
  ],
  "delete-pdf-pages": [
    {
      content:
        "Removed blank scanner pages from a submission PDF before uploading to a portal.",
      rating: 5,
    },
  ],
  "rearrange-pdf": [
    {
      content:
        "Reordered appendix pages after a last-minute content swap. Thumbnails helped a lot.",
      rating: 5,
    },
  ],
  "url-to-pdf": [
    {
      content:
        "Saved a pricing page to PDF for offline review. Layout was close to the live site.",
      rating: 4,
    },
  ],
  "image-to-pdf": [
    {
      content:
        "Combined receipt photos into one PDF for expenses. Order matched upload order.",
      rating: 5,
    },
  ],
  "pdf-to-jpg": [
    {
      content:
        "Exported slide pages to JPG for a social carousel. Resolution was usable.",
      rating: 4,
    },
  ],
  "extract-images-from-pdf": [
    {
      content:
        "Pulled figures out of a research PDF for a slide. Beats screenshotting each one.",
      rating: 5,
    },
  ],
  "mp4-to-mp3": [
    {
      content:
        "Ripped audio from a lecture MP4 for commute listening. File size was reasonable.",
      rating: 5,
    },
  ],
  "extract-audio": [
    {
      content:
        "Extracted wav/mp3 from interview footage before editing. Sync-free and quick.",
      rating: 5,
    },
  ],
  "gif-to-mp4": [
    {
      content:
        "Converted a heavy GIF banner to MP4 for the site — much smaller, same loop.",
      rating: 5,
    },
  ],
  "remove-watermark": [
    {
      content:
        "Cleaned a soft corner watermark from a stock preview I licensed later. Not magic on bold overlays.",
      rating: 3,
    },
  ],
  "unblur-image": [
    {
      content:
        "Helped a slightly soft product photo. Don’t expect miracles on motion blur, but it sharpened texture.",
      rating: 3,
    },
  ],
  "colorize-photo": [
    {
      content:
        "Colorized a family B&W scan for a scrapbook. Skin tones were believable after one retry.",
      rating: 4,
    },
  ],
  "image-to-text": [
    {
      content:
        "OCR’d a whiteboard photo into notes. Handwriting was middling; printed slides were excellent.",
      rating: 4,
    },
  ],
  "ai-story-generator": [
    {
      content:
        "Prompted a short sci‑fi scene for a creative warm-up. Fun, needed editing for voice.",
      rating: 4,
    },
  ],
  "profile-photo-maker": [
    {
      content:
        "Cropped and framed a headshot for Slack/HR portals. Circle preview helped.",
      rating: 5,
    },
  ],
  "photo-collage": [
    {
      content:
        "Built a 2×2 collage of event photos for a newsletter header. Gaps were even.",
      rating: 4,
    },
  ],
  "html-css-js-minifier": [
    {
      content:
        "Minified a small widget CSS/JS before dropping into a CMS HTML block. Saved a few KB.",
      rating: 5,
    },
  ],
  "pdf-translator": [
    {
      content:
        "Translated a short French brochure PDF to English for internal reading. Layout shifted, text was usable.",
      rating: 3,
    },
  ],
  "pdf-editor": [
    {
      content:
        "Covered a typo on a one-page flyer PDF and re-exported. Fine for light edits, not InDesign.",
      rating: 4,
    },
  ],
  "annotate-pdf": [
    {
      content:
        "Highlighted clauses and left sticky notes on a lease PDF for my roommate.",
      rating: 5,
    },
  ],
  "add-text-to-pdf": [
    {
      content:
        "Stamped a date and “Approved” on a form PDF. Font size control was enough.",
      rating: 4,
    },
  ],
  "add-text-on-image": [
    {
      content:
        "Added a price overlay on a promo image for Stories. Positioning was fiddly on mobile but workable.",
      rating: 4,
    },
  ],
};

const CATEGORY_TEMPLATES: Record<ToolCategory, Template[]> = {
  pdf: [
    {
      content:
        "Used {short} on a real document workflow today. Output opened fine in Preview and Acrobat.",
      rating: 4,
    },
    {
      content:
        "Handy when I don’t want to install another PDF utility. Did the job on a multi-page file.",
      rating: 5,
    },
  ],
  image: [
    {
      content:
        "Ran a photo through {short} before uploading to the site. Result looked clean on retina.",
      rating: 4,
    },
    {
      content:
        "Quick edit with {tool} — faster than opening a heavy desktop editor for one change.",
      rating: 5,
    },
  ],
  video: [
    {
      content:
        "Processed a short clip with {short}. Browser stayed responsive enough on my laptop.",
      rating: 4,
    },
  ],
  ai: [
    {
      content:
        "Tried {short} for a real task, not a toy prompt. Useful starting point; I still edited the output.",
      rating: 4,
    },
  ],
  file: [
    {
      content:
        "Bookmarked {short} after using it once. Simple UI, no signup wall.",
      rating: 5,
    },
  ],
};

const CONVERTER_TEMPLATES: Template[] = [
  {
    content:
      "Converted {from} → {to} for a client handoff. File opened correctly afterward.",
    rating: 5,
  },
  {
    content:
      "Needed {to} from a {from} export. {short} did it without uploading to a sketchy converter site.",
    rating: 4,
  },
  {
    content:
      "One-off {from} to {to} conversion. Quality was fine for web use; I didn’t test print.",
    rating: 4,
  },
];

/** Slugs that are too thin / niche for fake social proof — stay at 0 unless overridden above. */
const SKIP_GENERIC = new Set([
  "pdf-to-mobi",
  "pdf-to-azw3",
  "mobi-to-pdf",
  "azw3-to-pdf",
  "eps-to-png",
  "eps-to-pdf",
  "psd-to-ai",
  "png-to-eps",
  "outlook-to-pdf",
  "pdf-to-tiff",
  "tiff-to-pdf",
  "webp-to-gif",
  "jpg-to-tiff",
  "png-to-gif",
  "gif-to-pdf",
  "webp-to-pdf",
  "view-metadata-for-your-image",
  "translate-your-image",
  "ai-paragraph-generator",
  "facebook-video-downloader",
  "twitter-video-downloader",
  "pixelate-image",
  "round-image",
  "flip-image",
  "add-border-to-image",
  "add-images-to-image",
  "image-splitter",
  "combine-photo",
  "cleanup-picture",
  "remove-person",
  "remove-objects",
  "black-and-white-photo",
  "crop-pdf",
  "add-images-to-pdf",
  "pdf-creator",
  "pdf-to-csv",
  "pdf-to-excel",
  "pdf-to-powerpoint",
  "powerpoint-to-pdf",
  "pdf-to-epub",
  "epub-to-pdf",
  "pdf-to-text",
  "pdf-to-png",
  "png-to-pdf",
  "png-to-svg",
  "jpg-to-svg",
  "svg-to-png",
  "psd-to-jpg",
  "psd-to-png",
  "tiff-to-jpg",
]);

function collectTemplates(ctx: ToolCtx): Template[] {
  const specific = SLUG_TEMPLATES[ctx.slug];
  if (specific?.length) return [...specific];

  if (SKIP_GENERIC.has(ctx.slug)) return [];

  const pair = parseFormatPair(ctx.slug);
  if (pair) {
    return CONVERTER_TEMPLATES.map((t) => ({
      ...t,
      content: fill(t.content, ctx, pair),
    }));
  }

  const primary = ctx.categories[0];
  const fromCategory = primary ? CATEGORY_TEMPLATES[primary] ?? [] : [];
  return fromCategory.map((t) => ({
    ...t,
    content: fill(t.content, ctx),
  }));
}

/**
 * Deterministic 0–5 tool-specific seed comments.
 * Returns [] when there isn’t a credible comment for the tool.
 */
export function buildSeedsForTool(tool: Pick<Tool, "slug" | "name" | "shortName" | "categories">): SeedComment[] {
  const ctx: ToolCtx = {
    slug: tool.slug,
    name: tool.name,
    shortName: tool.shortName,
    categories: tool.categories,
  };

  const templates = collectTemplates(ctx);
  if (templates.length === 0) return [];

  const rand = rng(hashSlug(tool.slug) ^ 0xc0ffee);
  const hasSpecific = Boolean(SLUG_TEMPLATES[tool.slug]?.length);

  // Skew toward fewer comments: 0–5 with weight on 0–3.
  // Tools with hand-written copy always get at least 1.
  const countRoll = rand();
  let count = 0;
  if (countRoll < 0.18) count = 0;
  else if (countRoll < 0.4) count = 1;
  else if (countRoll < 0.65) count = 2;
  else if (countRoll < 0.82) count = 3;
  else if (countRoll < 0.94) count = 4;
  else count = 5;

  if (hasSpecific && count === 0) count = 1;
  count = Math.min(count, templates.length, 5);
  if (count === 0) return [];

  // Shuffle templates deterministically
  const shuffled = [...templates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  const usedNames = new Set<string>();
  const seeds: SeedComment[] = [];

  for (let i = 0; i < count; i++) {
    const template = shuffled[i]!;
    const name = pickAuthor(rand, usedNames);
    const likes = lowLikes(rand);
    const ago = hoursAgo(rand, 8 + i * 18, 40 + i * 50);
    const content = template.content.includes("{")
      ? fill(template.content, ctx)
      : template.content;

    const seed: SeedComment = {
      name,
      content,
      rating: template.rating,
      likes,
      hoursAgo: ago,
    };

    // Occasional reply (~25%) when template provides one and count allows feel
    if (template.reply && rand() < 0.35) {
      seed.replies = [
        {
          name: pickAuthor(rand, usedNames),
          content: template.reply.includes("{")
            ? fill(template.reply, ctx)
            : template.reply,
          likes: lowLikes(rand) > 2 ? 1 : 0,
          hoursAgo: Math.max(2, ago - hoursAgo(rand, 2, 12)),
        },
      ];
    }

    seeds.push(seed);
  }

  return seeds;
}
