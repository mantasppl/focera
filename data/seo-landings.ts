import type { ToolFaq } from "@/data/tools";

/**
 * Long-tail SEO entry pages that wrap an existing tool.
 *
 * These are NOT tools. Never add them to `data/tools.ts`, category lists,
 * homepage grids, related-tool maps, or search catalogs.
 */
export type SeoLandingPage = {
  slug: string;
  href: string;
  keyword: string;
  title: string;
  h1: string;
  description: string;
  intro: string[];
  keywords: string[];
  faq: ToolFaq[];
  parentToolSlug: string;
  parentHref: string;
  parentName: string;
};

export const seoLandings: SeoLandingPage[] = [
  {
    slug: "remove-background-from-image",
    href: "/remove-background-from-image",
    keyword: "remove background from image",
    title: "Remove Background from Image Online Free",
    h1: "Remove Background From Your Image in One Click",
    description:
      "Remove background from image files online for free. Isolate a person or product in your browser and download a transparent PNG or WebP — no account required.",
    intro: [
      "A busy room, a leftover studio sweep, or a random wall behind a product can lock a photo into the wrong layout. Cropping just shrinks the problem. If the subject still sits on its original scene, it will never sit cleanly on a listing, slide, or story.",
      "This page is built so you can remove background from image files without installing an editor. Upload a JPG, PNG, or WebP, run the same browser cutout as Focera's Make Background Transparent workspace, and export a file with real alpha.",
      "Nothing is sent to a remote farm for processing. After a one-time model download, the work stays on your device — free, private, and ready for storefronts, stickers, and design tools.",
    ],
    keywords: [
      "remove background from image",
      "remove background from image online",
      "remove background from image free",
      "erase photo background",
      "cut out image background",
      "transparent png from photo",
      "isolate subject from photo",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "How do I remove background from an image online for free?",
        answer:
          "Drop a JPG, PNG, or WebP onto this page, run the cutout, inspect the edges with the before/after slider, then download a transparent PNG or WebP. There is no account, watermark, or paid credit gate.",
      },
      {
        question: "Is it safe to remove background from an image in my browser?",
        answer:
          "Yes. The segmentation model runs locally after it is cached on your device. Your photo is not uploaded to Focera’s servers to produce the cutout.",
      },
      {
        question: "Why remove background from an image instead of cropping it?",
        answer:
          "Cropping still leaves the original scene around the subject. A transparent cutout lets you place a person or product on any new color, photo, or layout without a leftover rectangle.",
      },
      {
        question: "Can I remove background from an image with flyaway hair or product edges?",
        answer:
          "The AI mask is meant for portraits, packaged goods, and graphics. After the cutout, crop empty pixels, add padding, a drop shadow, or a sticker outline so thin edges read more clearly on a new backdrop.",
      },
      {
        question: "What file should I download after I remove background from an image?",
        answer:
          "Choose PNG when you need the widest compatibility in shops and design apps. Choose WebP when you want a smaller transparent file for the web.",
      },
      {
        question: "Do I need Photoshop or an account to remove background from an image?",
        answer:
          "No. Open this page in a modern browser, process the file, and download. Desktop software and sign-up are not required.",
      },
    ],
  },
];

export function getSeoLandingBySlug(slug: string): SeoLandingPage | undefined {
  return seoLandings.find((page) => page.slug === slug);
}
