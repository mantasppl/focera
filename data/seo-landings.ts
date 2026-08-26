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
  shortName: string;
  description: string;
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
    h1: "Remove Background from Image",
    shortName: "Remove BG",
    description:
      "Remove background from an image online for free — AI cutout to a clean PNG with alpha in your browser.",
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
        question: "Is this tool to remove background from an image free?",
        answer:
          "Yes. Upload a photo, remove the background, preview the cutout, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. The cutout runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What file do I get after I remove background from an image?",
        answer:
          "A PNG or WebP with alpha transparency — ready for store listings, slides, social graphics, and design layouts.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. After the background is cleared, crop to the subject, add padding, apply a drop shadow, or wrap the cutout in a white, black, or custom outline, then download PNG or WebP.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Download a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later cutouts on this device are significantly faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Transparent files you download are yours to use in marketing, e-commerce, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "background-transparent",
    href: "/background-transparent",
    keyword: "background transparent",
    title: "Background Transparent Online Free",
    h1: "Background Transparent",
    shortName: "BG Transparent",
    description:
      "Make a photo background transparent online for free — AI cutout to a clean PNG with alpha in your browser.",
    keywords: [
      "background transparent",
      "background transparent online",
      "background transparent free",
      "photo background transparent",
      "transparent photo background",
      "image background transparent",
      "png background transparent",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "Is this background transparent tool free?",
        answer:
          "Yes. Upload a photo, clear the backdrop, preview the result, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Processing stays in your browser. The original file never leaves your device.",
      },
      {
        question: "What file do I get after I make the background transparent?",
        answer:
          "A PNG or WebP that keeps true empty pixels — so the subject can sit on any new color, photo, or layout.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. Once the backdrop is gone, crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom outline before you download.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Export a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "Your browser downloads the AI model once and caches it. Later background transparent cutouts on this device are much faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Files you export are yours for shops, ads, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "transparent-background-maker",
    href: "/transparent-background-maker",
    keyword: "transparent background maker",
    title: "Transparent Background Maker Online Free",
    h1: "Transparent Background Maker",
    shortName: "BG Maker",
    description:
      "Use a transparent background maker online for free — AI cutout to a clean PNG with alpha in your browser.",
    keywords: [
      "transparent background maker",
      "transparent background maker online",
      "transparent background maker free",
      "png transparent background maker",
      "photo transparent background maker",
      "make transparent background",
      "free transparent background maker",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "Is this transparent background maker free?",
        answer:
          "Yes. Drop in a photo, run the cutout, check the preview, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. The maker runs in your browser. Your photos stay on this device.",
      },
      {
        question: "What file does the transparent background maker export?",
        answer:
          "A PNG or WebP with alpha so empty areas stay see-through in shops, slides, and social layouts.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. After the backdrop is cleared, crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom outline, then download.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Download a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached locally. Later runs of the transparent background maker on this device are much faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Exports are yours for listings, campaigns, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "make-image-transparent",
    href: "/make-image-transparent",
    keyword: "make image transparent",
    title: "Make Image Transparent Online Free",
    h1: "Make Image Transparent",
    shortName: "Transparent Image",
    description:
      "Make an image transparent online for free — AI cutout to a clean PNG with alpha in your browser.",
    keywords: [
      "make image transparent",
      "make image transparent online",
      "make image transparent free",
      "make a photo transparent",
      "transparent image online",
      "make png transparent",
      "turn image transparent",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "Is it free to make an image transparent here?",
        answer:
          "Yes. Upload a photo, run the cutout, preview the result, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. The cutout runs in your browser. Files stay on your device.",
      },
      {
        question: "What file do I get after I make an image transparent?",
        answer:
          "A PNG or WebP with alpha transparency, so the subject can sit on any new color, photo, or layout.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. After the backdrop is gone, crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom outline, then download.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Download a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later attempts to make an image transparent on this device are much faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Transparent files you download are yours for shops, ads, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "make-picture-transparent",
    href: "/make-picture-transparent",
    keyword: "make picture transparent",
    title: "Make Picture Transparent Online Free",
    h1: "Make Picture Transparent",
    shortName: "Transparent Picture",
    description:
      "Make a picture transparent online for free — AI cutout to a clean PNG with alpha in your browser.",
    keywords: [
      "make picture transparent",
      "make picture transparent online",
      "make picture transparent free",
      "make a picture transparent",
      "transparent picture online",
      "make photo picture transparent",
      "turn picture transparent",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "Is it free to make a picture transparent?",
        answer:
          "Yes. Drop in a photo, run the cutout, check the preview, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Processing stays in your browser. The picture never leaves this device.",
      },
      {
        question: "What file do I get after I make a picture transparent?",
        answer:
          "A PNG or WebP with true empty pixels, so the subject can sit on any new color, photo, or layout.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. Once the backdrop is cleared, crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom outline, then download.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Export a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "Your browser downloads the AI model once and caches it. Later cutouts on this device are much faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Files you export are yours for listings, ads, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "make-photo-transparent",
    href: "/make-photo-transparent",
    keyword: "make photo transparent",
    title: "Make Photo Transparent Online Free",
    h1: "Make Photo Transparent",
    shortName: "Transparent Photo",
    description:
      "Make a photo transparent online for free — AI cutout to a clean PNG with alpha in your browser.",
    keywords: [
      "make photo transparent",
      "make photo transparent online",
      "make photo transparent free",
      "make a photo transparent",
      "transparent photo online",
      "photo transparent png",
      "turn photo transparent",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "Is it free to make a photo transparent?",
        answer:
          "Yes. Upload a photo, run the cutout, preview the result, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. The cutout runs in your browser. Your photo stays on this device.",
      },
      {
        question: "What file do I get after I make a photo transparent?",
        answer:
          "A PNG or WebP with alpha transparency, ready for listings, slides, and social graphics.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. After the backdrop is gone, crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom outline, then download.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Download a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached locally. Later photo cutouts on this device are much faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Transparent photos you download are yours for shops, campaigns, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "make-picture-background-transparent",
    href: "/make-picture-background-transparent",
    keyword: "make picture background transparent",
    title: "Make Picture Background Transparent Online Free",
    h1: "Make Picture Background Transparent",
    shortName: "Picture BG Transparent",
    description:
      "Make a picture background transparent online for free — AI cutout to a clean PNG with alpha in your browser.",
    keywords: [
      "make picture background transparent",
      "make picture background transparent online",
      "make picture background transparent free",
      "picture background transparent",
      "transparent picture background",
      "clear picture background",
      "picture backdrop transparent",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "Is it free to make a picture background transparent?",
        answer:
          "Yes. Drop in a picture, run the cutout, check the preview, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Processing stays in your browser. The picture never leaves this device.",
      },
      {
        question: "What file do I get after I make a picture background transparent?",
        answer:
          "A PNG or WebP with true empty pixels, so the subject can sit on any new color, photo, or layout.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. Once the backdrop is cleared, crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom outline, then download.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Export a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "Your browser downloads the AI model once and caches it. Later cutouts on this device are much faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Files you export are yours for listings, ads, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "clear-background",
    href: "/clear-background",
    keyword: "clear background",
    title: "Clear Background Online Free",
    h1: "Clear Background",
    shortName: "Clear BG",
    description:
      "Clear a photo background online for free — AI cutout to a clean PNG with alpha in your browser.",
    keywords: [
      "clear background",
      "clear background online",
      "clear background free",
      "clear photo background",
      "clear image background",
      "clear background from photo",
      "clear backdrop",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "Is this clear background tool free?",
        answer:
          "Yes. Upload a photo, clear the backdrop, preview the cutout, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. The cutout runs in your browser. Your files stay on this device.",
      },
      {
        question: "What file do I get after I clear the background?",
        answer:
          "A PNG or WebP with alpha transparency, so the subject can sit on any new color, photo, or layout.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. After the background is cleared, crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom outline, then download.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Download a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later cutouts on this device are much faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Transparent files you download are yours for shops, ads, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "transparent-bg",
    href: "/transparent-bg",
    keyword: "transparent bg",
    title: "Transparent BG Online Free",
    h1: "Transparent BG",
    shortName: "Transparent BG",
    description:
      "Create a transparent BG online for free — AI cutout to a clean PNG with alpha in your browser.",
    keywords: [
      "transparent bg",
      "transparent bg online",
      "transparent bg free",
      "transparent bg png",
      "transparent bg maker",
      "photo transparent bg",
      "image transparent bg",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "Is this transparent BG tool free?",
        answer:
          "Yes. Drop in a photo, run the cutout, check the preview, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Processing stays in your browser. The original file never leaves this device.",
      },
      {
        question: "What file do I get with a transparent BG?",
        answer:
          "A PNG or WebP with true empty pixels, so the subject can sit on any new color, photo, or layout.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. Once the backdrop is gone, crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom outline, then download.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Export a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "Your browser downloads the AI model once and caches it. Later cutouts on this device are much faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Files you export are yours for listings, ads, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "make-image-background-transparent",
    href: "/make-image-background-transparent",
    keyword: "make image background transparent",
    title: "Make Image Background Transparent Online Free",
    h1: "Make Image Background Transparent",
    shortName: "Image BG Transparent",
    description:
      "Make an image background transparent online for free — AI cutout to a clean PNG with alpha in your browser.",
    keywords: [
      "make image background transparent",
      "make image background transparent online",
      "make image background transparent free",
      "image background transparent",
      "transparent image background",
      "clear image background",
      "image backdrop transparent",
    ],
    parentToolSlug: "make-background-transparent",
    parentHref: "/make-background-transparent",
    parentName: "Make Background Transparent",
    faq: [
      {
        question: "Is it free to make an image background transparent?",
        answer:
          "Yes. Upload an image, run the cutout, preview the result, and download a PNG or WebP with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. The cutout runs in your browser. Your files stay on this device.",
      },
      {
        question: "What file do I get after I make an image background transparent?",
        answer:
          "A PNG or WebP with alpha transparency, so the subject can sit on any new color, photo, or layout.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. After the backdrop is gone, crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom outline, then download.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Download a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later cutouts on this device are much faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Transparent files you download are yours for shops, ads, client work, and personal projects.",
      },
    ],
  },
];

export function getSeoLandingBySlug(slug: string): SeoLandingPage | undefined {
  return seoLandings.find((page) => page.slug === slug);
}
