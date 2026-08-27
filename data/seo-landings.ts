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
  {
    slug: "qr-code-generator",
    href: "/qr-code-generator",
    keyword: "qr code generator",
    title: "QR Code Generator Online Free",
    h1: "QR Code Generator",
    shortName: "QR Codes",
    description:
      "Use a QR code generator online for free — branded codes for URLs, Wi‑Fi, vCards, events, and more, with PNG, SVG, or PDF download in your browser.",
    keywords: [
      "qr code generator",
      "qr code generator online",
      "qr code generator free",
      "online qr code generator",
      "free qr code generator online",
      "create qr code online",
      "make a qr code",
    ],
    parentToolSlug: "qr-generator",
    parentHref: "/qr-generator",
    parentName: "QR Code Generator",
    faq: [
      {
        question: "Is this QR code generator free to use?",
        answer:
          "Yes. Create, preview, and download codes with no payment, account, or daily cap.",
      },
      {
        question: "Does this QR code generator upload my content?",
        answer:
          "No. Codes are built in your browser. The URL, Wi‑Fi details, or other payload never leave this device during generation.",
      },
      {
        question: "What files can I download from this QR code generator?",
        answer:
          "PNG, SVG, or a print-ready PDF. Transparent backgrounds and batch ZIP exports are available too.",
      },
      {
        question: "What can I encode with this QR code generator?",
        answer:
          "URL, text, Wi‑Fi, vCard, email, phone, SMS, calendar events, geo locations, and app store links — each with guided fields.",
      },
      {
        question: "Can I check a code before I print it?",
        answer:
          "Yes. Scan to verify with your camera, or decode an existing QR image to import its payload.",
      },
      {
        question: "Do I need an account to use this QR code generator?",
        answer:
          "No signup is required. Open the page, enter your content, and download the code right away.",
      },
      {
        question: "What print size works best?",
        answer:
          "It depends on scan distance. Cards often work from 2–3 cm; posters need a larger code. Test with a phone before you print a batch.",
      },
      {
        question: "Can I use these codes in commercial work?",
        answer:
          "Yes. Codes you create here are yours for marketing, packaging, events, and client projects.",
      },
      {
        question: "How is a QR code different from a barcode?",
        answer:
          "A classic barcode stores a short numeric string in one dimension. A QR code holds more data in two dimensions and scans from any angle with a phone camera.",
      },
    ],
  },
  {
    slug: "free-qr-code-generator",
    href: "/free-qr-code-generator",
    keyword: "free qr code generator",
    title: "Free QR Code Generator Online",
    h1: "Free QR Code Generator",
    shortName: "Free QR",
    description:
      "Use a free QR code generator online — branded codes for URLs, Wi‑Fi, vCards, and events, then download PNG, SVG, or PDF in your browser.",
    keywords: [
      "free qr code generator",
      "free qr code generator online",
      "qr code generator free",
      "free qr generator",
      "no signup qr code",
      "free qr png",
      "unlimited qr code generator",
    ],
    parentToolSlug: "qr-generator",
    parentHref: "/qr-generator",
    parentName: "QR Code Generator",
    faq: [
      {
        question: "Is this free QR code generator actually free?",
        answer:
          "Yes. Preview and download as many codes as you need with no payment, account, or daily limit.",
      },
      {
        question: "Does the free QR code generator send my data to a server?",
        answer:
          "No. Encoding runs in your browser. URLs, Wi‑Fi details, and other payloads stay on this device.",
      },
      {
        question: "What can I download from this free QR code generator?",
        answer:
          "PNG, SVG, or a print-ready PDF. Transparent backgrounds and batch ZIP exports are included.",
      },
      {
        question: "What can I encode for free?",
        answer:
          "URL, text, Wi‑Fi, vCard, email, phone, SMS, calendar events, geo locations, and app store links — each with guided fields.",
      },
      {
        question: "Can I check a free code before I print it?",
        answer:
          "Yes. Scan to verify with your camera, or decode an existing QR image to import its payload.",
      },
      {
        question: "Do I need an account for this free QR code generator?",
        answer:
          "No. Open the page, enter the payload, and download. There is no signup wall.",
      },
      {
        question: "What print size should I use?",
        answer:
          "Match scan distance. Cards often work from 2–3 cm; posters need a larger mark. Test with a phone before a bulk run.",
      },
      {
        question: "Can I use free downloads in commercial work?",
        answer:
          "Yes. Files you export here are yours for marketing, packaging, events, and client projects.",
      },
      {
        question: "How is a QR code different from a barcode?",
        answer:
          "A barcode stores a short numeric string in one dimension. A QR code stores more data in two dimensions and scans from any angle with a phone camera.",
      },
    ],
  },
  {
    slug: "create-qr-code",
    href: "/create-qr-code",
    keyword: "create qr code",
    title: "Create QR Code Online Free",
    h1: "Create QR Code",
    shortName: "Create QR",
    description:
      "Create a QR code online for free — customize colors and logo for URLs, Wi‑Fi, vCards, and more, then download PNG, SVG, or PDF in your browser.",
    keywords: [
      "create qr code",
      "create qr code online",
      "create qr code free",
      "create a qr code",
      "make qr code",
      "create qr png",
      "create wifi qr code",
    ],
    parentToolSlug: "qr-generator",
    parentHref: "/qr-generator",
    parentName: "QR Code Generator",
    faq: [
      {
        question: "Is it free to create a QR code here?",
        answer:
          "Yes. Create, preview, and download with no payment, account, or cap on how many files you make.",
      },
      {
        question: "When I create a QR code, does it leave my device?",
        answer:
          "No. The pattern is built in your browser. The payload never uploads during creation.",
      },
      {
        question: "What file do I get after I create a QR code?",
        answer:
          "PNG, SVG, or a print-ready PDF. You can also export a transparent background or a ZIP of several codes.",
      },
      {
        question: "What can I put in a QR code I create?",
        answer:
          "URL, text, Wi‑Fi, vCard, email, phone, SMS, calendar events, geo locations, and app store links — each with guided fields.",
      },
      {
        question: "Can I verify a code I just created?",
        answer:
          "Yes. Scan to verify with your camera, or decode an existing QR image to import its payload.",
      },
      {
        question: "Do I need to sign up to create a QR code?",
        answer:
          "No account is required. Enter your content and download as soon as the preview looks right.",
      },
      {
        question: "How large should a created QR code be in print?",
        answer:
          "It depends on scan distance. Cards often work from 2–3 cm; posters need more size. Test with a phone first.",
      },
      {
        question: "Can I use a QR code I create for client work?",
        answer:
          "Yes. Codes you make here are yours for marketing, packaging, events, and commercial projects.",
      },
      {
        question: "How is a QR code different from a barcode?",
        answer:
          "A barcode is a one-line numeric mark. A QR code is a 2D grid that holds more data and reads from any angle on a phone.",
      },
    ],
  },
  {
    slug: "generate-qr-code",
    href: "/generate-qr-code",
    keyword: "generate qr code",
    title: "Generate QR Code Online Free",
    h1: "Generate QR Code",
    shortName: "Generate QR",
    description:
      "Generate a QR code online for free — encode URLs, Wi‑Fi, vCards, events, and more, then download PNG, SVG, or PDF in your browser.",
    keywords: [
      "generate qr code",
      "generate qr code online",
      "generate qr code free",
      "generate a qr code",
      "qr code generate",
      "generate qr png",
      "generate wifi qr",
    ],
    parentToolSlug: "qr-generator",
    parentHref: "/qr-generator",
    parentName: "QR Code Generator",
    faq: [
      {
        question: "Is it free to generate a QR code here?",
        answer:
          "Yes. Generate, preview, and download without paying, creating an account, or hitting a daily limit.",
      },
      {
        question: "Where is the QR code generated?",
        answer:
          "On your device. The browser builds the pattern locally, so the payload is not uploaded for encoding.",
      },
      {
        question: "What formats can I generate?",
        answer:
          "PNG, SVG, or a print-ready PDF. Transparent backgrounds and batch ZIP exports are available.",
      },
      {
        question: "What payloads can I generate a QR code from?",
        answer:
          "URL, text, Wi‑Fi, vCard, email, phone, SMS, calendar events, geo locations, and app store links — each with guided fields.",
      },
      {
        question: "Can I scan a generated code before printing?",
        answer:
          "Yes. Use Scan to verify with your camera, or decode an existing QR image to import its payload.",
      },
      {
        question: "Do I need an account to generate a QR code?",
        answer:
          "No. Open the page, enter the content, and download as soon as the live preview is ready.",
      },
      {
        question: "What size should a generated QR code be?",
        answer:
          "Size follows scan distance. Cards often work from 2–3 cm; posters need a larger mark. Always test with a phone.",
      },
      {
        question: "Can generated codes be used commercially?",
        answer:
          "Yes. Files you generate here are yours for marketing, packaging, events, and client work.",
      },
      {
        question: "How is a QR code different from a barcode?",
        answer:
          "Barcodes hold a short number in one dimension. QR codes hold more information in two dimensions and scan from any angle.",
      },
    ],
  },
  {
    slug: "qr-code-maker",
    href: "/qr-code-maker",
    keyword: "qr code maker",
    title: "QR Code Maker Online Free",
    h1: "QR Code Maker",
    shortName: "QR Maker",
    description:
      "Use a QR code maker online for free — style colors, frames, and logos for URLs, Wi‑Fi, vCards, and more, then download PNG, SVG, or PDF in your browser.",
    keywords: [
      "qr code maker",
      "qr code maker online",
      "qr code maker free",
      "online qr code maker",
      "free qr maker",
      "png qr code maker",
      "wifi qr code maker",
    ],
    parentToolSlug: "qr-generator",
    parentHref: "/qr-generator",
    parentName: "QR Code Generator",
    faq: [
      {
        question: "Is this QR code maker free?",
        answer:
          "Yes. Make, preview, and download codes with no payment, account, or daily cap.",
      },
      {
        question: "Does this QR code maker upload what I type?",
        answer:
          "No. The maker runs in your browser. Payloads stay on this device while the image is built.",
      },
      {
        question: "What files does the QR code maker export?",
        answer:
          "PNG, SVG, or a print-ready PDF. Transparent backgrounds and batch ZIP exports are included.",
      },
      {
        question: "What can this QR code maker encode?",
        answer:
          "URL, text, Wi‑Fi, vCard, email, phone, SMS, calendar events, geo locations, and app store links — each with guided fields.",
      },
      {
        question: "Can I test a code from this QR code maker before print?",
        answer:
          "Yes. Scan to verify with your camera, or decode an existing QR image to import its payload.",
      },
      {
        question: "Do I need to register to use the QR code maker?",
        answer:
          "No signup. Open the page, set the content and style, and download when the preview looks right.",
      },
      {
        question: "How big should a made QR code be on paper?",
        answer:
          "It depends on how far the camera will be. Cards often work from 2–3 cm; posters need more size. Test first.",
      },
      {
        question: "Can I use codes from this maker in paid campaigns?",
        answer:
          "Yes. Exports are yours for marketing, packaging, events, and client projects.",
      },
      {
        question: "How is a QR code different from a barcode?",
        answer:
          "A barcode is a 1D numeric stripe. A QR code is a 2D grid that stores more data and reads from any angle on a phone.",
      },
    ],
  },
  {
    slug: "qr-code-creator",
    href: "/qr-code-creator",
    keyword: "qr code creator",
    title: "QR Code Creator Online Free",
    h1: "QR Code Creator",
    shortName: "QR Creator",
    description:
      "Use a QR code creator online for free — design branded codes for URLs, Wi‑Fi, vCards, and events, then download PNG, SVG, or PDF in your browser.",
    keywords: [
      "qr code creator",
      "qr code creator online",
      "qr code creator free",
      "online qr code creator",
      "free qr creator",
      "branded qr code creator",
      "logo qr code creator",
    ],
    parentToolSlug: "qr-generator",
    parentHref: "/qr-generator",
    parentName: "QR Code Generator",
    faq: [
      {
        question: "Is this QR code creator free to use?",
        answer:
          "Yes. Design, preview, and download with no payment, account, or usage cap.",
      },
      {
        question: "Does the QR code creator upload my designs?",
        answer:
          "No. Creation stays in the browser. Your URL, vCard, or other payload never leaves this device for encoding.",
      },
      {
        question: "What can I download from this QR code creator?",
        answer:
          "PNG, SVG, or a print-ready PDF. Transparent backgrounds and batch ZIP exports are available.",
      },
      {
        question: "What content can this QR code creator hold?",
        answer:
          "URL, text, Wi‑Fi, vCard, email, phone, SMS, calendar events, geo locations, and app store links — each with guided fields.",
      },
      {
        question: "Can I verify a designed code before printing?",
        answer:
          "Yes. Scan to verify with your camera, or decode an existing QR image to import its payload.",
      },
      {
        question: "Do I need an account for this QR code creator?",
        answer:
          "No. Open the page, style the code, and download as soon as the live preview is ready.",
      },
      {
        question: "What print size works for a designed QR code?",
        answer:
          "Match the viewing distance. Cards often work from 2–3 cm; posters need a larger mark. Test with a phone.",
      },
      {
        question: "Can I use created codes in commercial projects?",
        answer:
          "Yes. Codes you design here are yours for marketing, packaging, events, and client work.",
      },
      {
        question: "How is a QR code different from a barcode?",
        answer:
          "Barcodes store limited numbers in a single line. QR codes store more in a square grid and scan from any angle.",
      },
    ],
  },
  {
    slug: "qr-code-builder",
    href: "/qr-code-builder",
    keyword: "qr code builder",
    title: "QR Code Builder Online Free",
    h1: "QR Code Builder",
    shortName: "QR Builder",
    description:
      "Use a QR code builder online for free — assemble content, colors, and a logo for URLs, Wi‑Fi, vCards, and more, then download PNG, SVG, or PDF in your browser.",
    keywords: [
      "qr code builder",
      "qr code builder online",
      "qr code builder free",
      "online qr code builder",
      "free qr builder",
      "build qr code",
      "qr builder png",
    ],
    parentToolSlug: "qr-generator",
    parentHref: "/qr-generator",
    parentName: "QR Code Generator",
    faq: [
      {
        question: "Is this QR code builder free?",
        answer:
          "Yes. Build, preview, and download codes with no payment, account, or daily limit.",
      },
      {
        question: "Does the QR code builder send my payload to a server?",
        answer:
          "No. The builder encodes in your browser. Fields you fill in stay on this device.",
      },
      {
        question: "What files can I build and download?",
        answer:
          "PNG, SVG, or a print-ready PDF. Transparent backgrounds and batch ZIP exports are included.",
      },
      {
        question: "What can I assemble in this QR code builder?",
        answer:
          "URL, text, Wi‑Fi, vCard, email, phone, SMS, calendar events, geo locations, and app store links — each with guided fields.",
      },
      {
        question: "Can I check a built code before a print run?",
        answer:
          "Yes. Scan to verify with your camera, or decode an existing QR image to import its payload.",
      },
      {
        question: "Do I need to sign up to use the QR code builder?",
        answer:
          "No account. Fill in the content, adjust style, and download when the preview is ready.",
      },
      {
        question: "How large should a built QR code print?",
        answer:
          "It depends on scan distance. Cards often work from 2–3 cm; posters need more size. Always test with a phone.",
      },
      {
        question: "Can I use built codes in commercial work?",
        answer:
          "Yes. Files you build here are yours for marketing, packaging, events, and client projects.",
      },
      {
        question: "How is a QR code different from a barcode?",
        answer:
          "A barcode is a 1D stripe with a short number. A QR code is a 2D grid with more capacity and all-angle phone scanning.",
      },
    ],
  },
];

export function getSeoLandingBySlug(slug: string): SeoLandingPage | undefined {
  return seoLandings.find((page) => page.slug === slug);
}
