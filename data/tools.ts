export type ToolCategory =
  | "generators"
  | "converters"
  | "marketing"
  | "finance"
  | "images"
  | "security"
  | "developers";

export type ToolStatus = "ready" | "soon";

export type ToolFaq = {
  question: string;
  answer: string;
};

export type Tool = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  href: string;
  keywords: string[];
  faq: ToolFaq[];
};

export const categoryLabels: Record<ToolCategory, string> = {
  generators: "Generators",
  converters: "Converters",
  marketing: "Marketing",
  finance: "Finance",
  images: "Images",
  security: "Security",
  developers: "Developers",
};

export const tools: Tool[] = [
  {
    slug: "color-palette-generator",
    name: "Free Color Palette Generator",
    shortName: "Palettes",
    description:
      "Generate random color palettes, lock favorites, check WCAG contrast, and export CSS, Tailwind, HEX, or RGB — free and local in your browser.",
    category: "generators",
    status: "ready",
    href: "/color-palette-generator",
    keywords: [
      "color palette generator",
      "free color palette generator",
      "random color palette",
      "hex color palette",
      "css color palette",
      "tailwind color palette",
      "color scheme generator",
      "contrast checker",
      "wcag contrast",
    ],
    faq: [
      {
        question: "Is this color palette generator free?",
        answer:
          "Yes. Generate, lock, copy, and export unlimited palettes with no account, subscription, or daily limit.",
      },
      {
        question: "Can I lock colors while regenerating others?",
        answer:
          "Yes. Lock any swatch to keep it. The next generate refreshes only unlocked colors so you can iterate around a brand accent.",
      },
      {
        question: "Which export formats are supported?",
        answer:
          "Export CSS custom properties, Tailwind theme color keys, a HEX list, or an RGB list — then copy the result in one click.",
      },
      {
        question: "How do I copy a single color?",
        answer:
          "Click the HEX value on any swatch to copy it to your clipboard. You can also adjust the color with the built-in color picker.",
      },
      {
        question: "What does the contrast checker do?",
        answer:
          "It measures the WCAG contrast ratio between any two palette colors and reports AA/AAA pass or fail for normal and large text.",
      },
      {
        question: "Are my palettes uploaded to a server?",
        answer:
          "No. Generation, locking, exports, and contrast checks run entirely in your browser. Nothing is sent to Focera for processing.",
      },
      {
        question: "How many colors are in each palette?",
        answer:
          "Each palette has five colors — a practical size for brand accents, surfaces, and supporting tones in UI and marketing work.",
      },
    ],
  },
  {
    slug: "qr-generator",
    name: "Free QR Code Generator",
    shortName: "QR Generator",
    description: "Generate QR codes instantly online for free.",
    category: "generators",
    status: "ready",
    href: "/qr-generator",
    keywords: [
      "free qr code generator",
      "qr code generator",
      "qr code maker",
      "create qr code online",
      "qr",
      "barcode",
    ],
    faq: [
      {
        question: "Is this free QR code generator really free?",
        answer:
          "Yes. You can generate, preview, and download QR codes without paying, creating an account, or hitting a daily limit.",
      },
      {
        question: "Is the QR code generated on my device?",
        answer:
          "Yes. Codes are created in your browser — nothing is uploaded to a server during generation.",
      },
      {
        question: "What format can I download?",
        answer:
          "You get a high-contrast PNG file ready to print, embed in slides, or share on social media.",
      },
      {
        question: "Can I encode URLs, text, email, and phone numbers?",
        answer:
          "Yes. Paste any string — a full https URL, plain text, phone number, or email address — and the tool encodes it into a scannable QR code.",
      },
      {
        question: "Do I need to sign up to use the generator?",
        answer:
          "No account is required. Open the page, enter your content, and download your code immediately.",
      },
      {
        question: "What size should my QR code be for printing?",
        answer:
          "Size depends on scan distance. Business cards often work from 2–3 cm; posters need larger codes. Always test with a phone before bulk printing.",
      },
      {
        question: "Can I use generated QR codes for commercial projects?",
        answer:
          "Yes. Codes you create here are yours to use in marketing, packaging, events, and client work.",
      },
      {
        question: "How is a QR code different from a barcode?",
        answer:
          "Traditional barcodes store limited numeric data in one dimension. QR codes store much more information in two dimensions and are readable from any angle with a smartphone camera.",
      },
    ],
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Free Lorem Ipsum Generator",
    shortName: "Lorem Ipsum",
    description:
      "Generate classic Lorem Ipsum placeholder text by words, sentences, or paragraphs. Copy instantly or download a TXT file — free, private, and local.",
    category: "generators",
    status: "ready",
    href: "/lorem-ipsum-generator",
    keywords: [
      "lorem ipsum generator",
      "free lorem ipsum generator",
      "dummy text generator",
      "placeholder text generator",
      "lorem ipsum paragraphs",
      "lorem ipsum words",
      "lorem ipsum sentences",
      "filler text generator",
    ],
    faq: [
      {
        question: "What is Lorem Ipsum?",
        answer:
          "Lorem Ipsum is classic placeholder Latin-style text used in design mockups, wireframes, and typesetting so layout and typography can be judged without real copy distracting the eye.",
      },
      {
        question: "Can I generate words, sentences, or paragraphs?",
        answer:
          "Yes. Choose Words, Sentences, or Paragraphs, set the count, and generate. Each mode produces filler text sized for that unit.",
      },
      {
        question: "Can I copy or download the result?",
        answer:
          "Yes. Use Copy to place the text on your clipboard, or Download TXT to save a plain-text file for design tools, docs, or CMS drafts.",
      },
      {
        question: "Does the generator start with the classic Lorem Ipsum phrase?",
        answer:
          "Optionally. Keep “Start with Lorem ipsum” enabled to begin with the familiar opening line, or turn it off for fully randomized filler text.",
      },
      {
        question: "Is this Lorem Ipsum generator free?",
        answer:
          "Yes. Generate unlimited placeholder text with no account, watermarks, or daily limits.",
      },
      {
        question: "Is my text uploaded to a server?",
        answer:
          "No. Generation runs entirely in your browser. Nothing is sent to Focera servers when you create, copy, or download filler text.",
      },
      {
        question: "When should I use Lorem Ipsum instead of real copy?",
        answer:
          "Use it early in design and layout work when content is not ready yet. Replace it with real writing before launch so SEO, accessibility, and meaning are accurate.",
      },
    ],
  },
  {
    slug: "ai-story-generator",
    name: "Free AI Story Generator",
    shortName: "AI Stories",
    description:
      "Generate AI short stories from a prompt — pick genre, length, and tone, then copy or download the text. Free, no account required.",
    category: "generators",
    status: "ready",
    href: "/ai-story-generator",
    keywords: [
      "ai story generator",
      "free ai story generator",
      "story generator",
      "ai writing tool",
      "generate a story",
      "short story generator",
      "fiction generator",
      "creative writing ai",
      "prompt to story",
      "free story writer",
    ],
    faq: [
      {
        question: "Is this AI story generator free?",
        answer:
          "Yes. Enter a premise, generate stories, and copy or download the text with no account, subscription, or credit card.",
      },
      {
        question: "How does AI story generation work?",
        answer:
          "You describe an idea in plain language, then choose genre, length, and tone. The tool sends your prompt to an AI writing model and returns a complete short story.",
      },
      {
        question: "Are my prompts stored by Focera?",
        answer:
          "Focera does not keep a library of your prompts or stories. Your idea is sent to the generation provider to create the text, then the result is shown in your browser to copy or download.",
      },
      {
        question: "Which genres and lengths are available?",
        answer:
          "Choose genres such as adventure, fantasy, mystery, sci-fi, romance, horror, comedy, and fable. Length options range from flash fiction to medium short stories, with tones from warm to dark or epic.",
      },
      {
        question: "Can I copy or download the story?",
        answer:
          "Yes. After generation, copy the text to your clipboard or download a plain TXT file for drafts, classrooms, and creative projects.",
      },
      {
        question: "Why did generation fail or take long?",
        answer:
          "The free model can be busy or rate-limited. Wait a few seconds and try again, or shorten the prompt and regenerate with a new variation.",
      },
      {
        question: "Do I need an account or API key?",
        answer:
          "No. Open the page, enter a story idea, and generate. Nothing to install and no signup required.",
      },
    ],
  },
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    shortName: "Invoices",
    description:
      "Create professional invoices with company and client details, unlimited line items, VAT, and instant PDF download.",
    category: "finance",
    status: "ready",
    href: "/invoice-generator",
    keywords: [
      "invoice generator",
      "free invoice",
      "invoice pdf",
      "invoice template",
      "billing",
      "vat invoice",
      "online invoice maker",
    ],
    faq: [
      {
        question: "Will invoices be saved online?",
        answer:
          "No. Drafts stay in your browser until you export or download them. Nothing is uploaded to Focera servers.",
      },
      {
        question: "Can I add unlimited products and services?",
        answer:
          "Yes. Add as many line items as you need. Each row includes description, quantity, and unit price with automatic amount calculation.",
      },
      {
        question: "Does the invoice generator support VAT?",
        answer:
          "Yes. Toggle VAT or sales tax on, set your percentage rate, and subtotal, tax, and total update automatically in the preview and PDF.",
      },
      {
        question: "How do I download my invoice as a PDF?",
        answer:
          "Fill in your invoice details and click Download PDF. The file is generated locally in your browser and saved to your device.",
      },
      {
        question: "Do I need an account to create invoices?",
        answer:
          "No account is required. Open the tool, build your invoice, and download — no sign-up or subscription.",
      },
      {
        question: "Which currencies are supported?",
        answer:
          "You can choose USD, EUR, GBP, CAD, or AUD. Amounts are formatted with the correct currency symbol in the preview and PDF.",
      },
    ],
  },
  {
    slug: "unit-converter",
    name: "Free Unit Converter",
    shortName: "Units",
    description:
      "Convert length, weight, temperature, volume, area, speed, and data storage instantly in your browser.",
    category: "converters",
    status: "ready",
    href: "/unit-converter",
    keywords: [
      "unit converter",
      "free unit converter",
      "metric to imperial",
      "length converter",
      "weight converter",
      "temperature converter",
      "volume converter",
      "online unit conversion",
    ],
    faq: [
      {
        question: "Which units can I convert?",
        answer:
          "Length, weight, temperature, volume, area, speed, and data storage — including common metric and imperial units, plus Celsius, Fahrenheit, and Kelvin.",
      },
      {
        question: "Do conversions happen on a server?",
        answer:
          "No. All math runs locally in your browser. Values you enter are not uploaded to Focera for processing.",
      },
      {
        question: "How does temperature conversion work?",
        answer:
          "Temperature uses the standard formulas between Celsius, Fahrenheit, and Kelvin rather than a simple scale factor, so results stay accurate around freezing and absolute zero.",
      },
      {
        question: "Are data storage units 1000-based or 1024-based?",
        answer:
          "Kilobytes through petabytes use 1024-based multiples (binary-style), matching how most operating systems report file sizes.",
      },
      {
        question: "Can I swap from and to units?",
        answer:
          "Yes. Use the swap control to reverse the units and carry the current result into the From field.",
      },
      {
        question: "Is this unit converter free?",
        answer:
          "Yes. Convert unlimited values with no account, subscription, or daily limit.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes. The converter is responsive — category tabs scroll horizontally on small screens so you can switch types quickly on a phone.",
      },
    ],
  },
  {
    slug: "text-case-converter",
    name: "Free Text Case Converter",
    shortName: "Text Case",
    description:
      "Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case — instantly in your browser.",
    category: "converters",
    status: "ready",
    href: "/text-case-converter",
    keywords: [
      "text case converter",
      "uppercase converter",
      "lowercase converter",
      "title case converter",
      "sentence case converter",
      "camelCase converter",
      "PascalCase converter",
      "snake_case converter",
      "kebab-case converter",
      "convert text case online",
    ],
    faq: [
      {
        question: "Which case styles are supported?",
        answer:
          "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case.",
      },
      {
        question: "Does conversion happen on a server?",
        answer:
          "No. All case changes run locally in your browser. Text you enter is not uploaded to Focera for processing.",
      },
      {
        question: "How do camelCase and snake_case handle mixed input?",
        answer:
          "The converter splits words on spaces, punctuation, underscores, hyphens, and camelCase boundaries, then rebuilds the string in the selected style.",
      },
      {
        question: "Can I see character and word counts?",
        answer:
          "Yes. Character and word counts update live under the input field as you type or paste.",
      },
      {
        question: "How do I copy the result?",
        answer:
          "Use the Copy button next to the output. You can also use “Use as input” to chain another conversion.",
      },
      {
        question: "Is this text case converter free?",
        answer:
          "Yes. Convert unlimited text with no account, subscription, or daily limit.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes. The layout stacks on small screens so you can switch case styles and copy results comfortably on a phone.",
      },
    ],
  },
  {
    slug: "pdf-editor",
    name: "Free PDF Editor",
    shortName: "PDF Editor",
    description:
      "Edit PDFs online for free — reorder, rotate, delete, duplicate, and extract pages with a visual workspace. Private, no watermark, and local in your browser.",
    category: "converters",
    status: "ready",
    href: "/pdf-editor",
    keywords: [
      "pdf editor",
      "edit pdf",
      "free pdf editor",
      "pdf editor online",
      "reorder pdf pages",
      "rotate pdf pages",
      "delete pdf pages",
      "extract pdf pages",
      "online pdf editor",
    ],
    faq: [
      {
        question: "Is this PDF editor free?",
        answer:
          "Yes. Edit and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Editing runs entirely in your browser with pdf-lib and PDF.js. Your files stay on your device.",
      },
      {
        question: "What can I edit?",
        answer:
          "Reorder pages with drag and drop, rotate left or right, duplicate or delete pages, insert blank pages, extract a selection, and download the full edited PDF.",
      },
      {
        question: "Can I edit text or annotations inside pages?",
        answer:
          "This editor focuses on page-level tools — order, rotation, duplication, deletion, blank pages, and extraction. Text and vector content on each page is preserved when you export.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per edit session.",
      },
      {
        question: "Can I edit password-protected PDFs?",
        answer:
          "Not yet. Remove the password from protected files first, then open them in the editor.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and edit immediately.",
      },
    ],
  },
  {
    slug: "merge-pdf",
    name: "Free Merge PDF Tool",
    shortName: "Merge PDF",
    description:
      "Merge two or more PDFs into one file online — reorder pages, combine documents, and download instantly. Free, private, and local in your browser.",
    category: "converters",
    status: "ready",
    href: "/merge-pdf",
    keywords: [
      "merge pdf",
      "combine pdf",
      "pdf merger",
      "merge pdfs online",
      "join pdf files",
      "combine pdf files",
      "free pdf merger",
      "merge multiple pdfs",
    ],
    faq: [
      {
        question: "Is this PDF merger free?",
        answer:
          "Yes. Merge unlimited PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Merging runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
      {
        question: "Can I change the order of PDFs before merging?",
        answer:
          "Yes. After uploading, use the up and down controls to set the exact merge order, or remove files you do not want included.",
      },
      {
        question: "How many PDFs can I merge at once?",
        answer:
          "You can merge up to 20 PDF files in one go. Each file can be up to 25 MB, with a combined size limit of 100 MB.",
      },
      {
        question: "Does merging keep text and layout?",
        answer:
          "Yes. Pages are copied as real PDF pages — text, vector graphics, and layout are preserved. This is not a print-to-image merge.",
      },
      {
        question: "Can I merge password-protected PDFs?",
        answer:
          "Not yet. Remove the password from protected files first, then upload them to merge.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDFs, and merge immediately.",
      },
    ],
  },
  {
    slug: "split-pdf",
    name: "Free Split PDF Tool",
    shortName: "Split PDF",
    description:
      "Split a PDF into separate files online — every page, custom ranges, or fixed-size chunks. Free, private, and local in your browser.",
    category: "converters",
    status: "ready",
    href: "/split-pdf",
    keywords: [
      "split pdf",
      "pdf splitter",
      "split pdf pages",
      "extract pdf pages",
      "separate pdf pages",
      "split pdf online",
      "free pdf splitter",
      "break pdf into pages",
    ],
    faq: [
      {
        question: "Is this PDF splitter free?",
        answer:
          "Yes. Split and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Splitting runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
      {
        question: "How can I split a PDF?",
        answer:
          "Choose every page for one PDF per page, enter page ranges like 1-3, 5, 8-10, or split into fixed chunks of N pages each.",
      },
      {
        question: "Do I get a ZIP or a single PDF?",
        answer:
          "One output range downloads as a PDF. Multiple outputs download together as a ZIP of PDF files.",
      },
      {
        question: "Does splitting keep text and layout?",
        answer:
          "Yes. Pages are copied as real PDF pages — text, vector graphics, and layout are preserved.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per split.",
      },
      {
        question: "Can I split password-protected PDFs?",
        answer:
          "Not yet. Remove the password from protected files first, then upload them to split.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and split immediately.",
      },
    ],
  },
  {
    slug: "compress-pdf",
    name: "Free Compress PDF Tool",
    shortName: "Compress PDF",
    description:
      "Compress PDF files online to reduce size — choose Extreme, Strong, Balanced, or Light compression and download instantly. Free, private, and local in your browser.",
    category: "converters",
    status: "ready",
    href: "/compress-pdf",
    keywords: [
      "compress pdf",
      "pdf compressor",
      "reduce pdf size",
      "shrink pdf",
      "optimize pdf",
      "compress pdf online",
      "free pdf compressor",
      "make pdf smaller",
    ],
    faq: [
      {
        question: "Is this PDF compressor free?",
        answer:
          "Yes. Compress and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Compression runs entirely in your browser with PDF.js and pdf-lib. Your files stay on your device.",
      },
      {
        question: "How does compression work?",
        answer:
          "Each page is rendered and re-encoded as a compact JPEG, then rebuilt into a smaller PDF. Stronger levels use lower resolution and quality for more savings.",
      },
      {
        question: "Will text stay selectable?",
        answer:
          "Compression flattens pages into images, so text is no longer selectable or searchable. Visual layout is preserved for sharing, email, and uploads.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per compression.",
      },
      {
        question: "Can I compress password-protected PDFs?",
        answer:
          "Not yet. Remove the password from protected files first, then upload them to compress.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and compress immediately.",
      },
    ],
  },
  {
    slug: "utm-builder",
    name: "Free UTM Builder",
    shortName: "UTM Builder",
    description:
      "Build campaign URLs with utm_source, utm_medium, and utm_campaign — copy clean tracking links instantly in your browser.",
    category: "marketing",
    status: "ready",
    href: "/utm-builder",
    keywords: [
      "utm builder",
      "utm generator",
      "campaign url builder",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "google analytics utm",
      "tracking link builder",
    ],
    faq: [
      {
        question: "Which UTM parameters are supported?",
        answer:
          "utm_source, utm_medium, and utm_campaign. Enter a base URL and optional values; empty fields are omitted from the final link.",
      },
      {
        question: "Is this UTM builder free?",
        answer:
          "Yes. Build and copy unlimited campaign URLs with no account, subscription, or daily limit.",
      },
      {
        question: "Does my URL leave the browser?",
        answer:
          "No. Links are assembled locally in your browser. Nothing is uploaded to Focera for processing.",
      },
      {
        question: "Can I use the result with Google Analytics?",
        answer:
          "Yes. Standard UTM parameters are recognized by GA4 and many other analytics platforms when someone clicks your link.",
      },
      {
        question: "What if my base URL is invalid?",
        answer:
          "Enter a full URL including https://. If the URL cannot be parsed, the builder will not produce a result until it is fixed.",
      },
    ],
  },
  {
    slug: "profit-calculator",
    name: "Free Profit Calculator",
    shortName: "Profit Calc",
    description:
      "Calculate profit and margin from revenue and cost instantly — free, private, and local in your browser.",
    category: "finance",
    status: "ready",
    href: "/profit-calculator",
    keywords: [
      "profit calculator",
      "margin calculator",
      "revenue minus cost",
      "profit margin",
      "gross profit calculator",
      "free profit calculator",
    ],
    faq: [
      {
        question: "How is profit calculated?",
        answer: "Profit = revenue − cost. Enter both values to see the result immediately.",
      },
      {
        question: "How is margin calculated?",
        answer:
          "Margin = (revenue − cost) ÷ revenue × 100. If revenue is zero, margin is shown as zero to avoid division errors.",
      },
      {
        question: "Is this profit calculator free?",
        answer:
          "Yes. Calculate unlimited scenarios with no account, subscription, or daily limit.",
      },
      {
        question: "Are my numbers uploaded?",
        answer:
          "No. All math runs locally in your browser. Values you enter are not sent to Focera servers.",
      },
      {
        question: "Can I use this for pricing decisions?",
        answer:
          "Yes as a quick check. For accounting, taxes, or formal reports, verify figures with your bookkeeping tools or advisor.",
      },
    ],
  },
  {
    slug: "background-remover",
    name: "AI Background Remover Online Free",
    shortName: "BG Remover",
    description: "Remove image backgrounds instantly for free.",
    category: "images",
    status: "ready",
    href: "/background-remover",
    keywords: [
      "background remover",
      "remove background",
      "ai background remover",
      "transparent png",
      "remove bg online",
      "free background eraser",
    ],
    faq: [
      {
        question: "Is this background remover really free?",
        answer:
          "Yes. You can upload, process, preview, and download transparent PNGs without paying or creating an account.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Background removal runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a transparent PNG.",
      },
      {
        question: "Why does the first removal take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later runs are significantly faster.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After processing, drag the slider on the preview to compare the original image with the cutout.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, e-commerce, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "change-background",
    name: "Change Background of Image Online Free",
    shortName: "Change BG",
    description:
      "Replace any photo background with a solid color, custom image, or portrait blur — free AI cutout in your browser.",
    category: "images",
    status: "ready",
    href: "/change-background",
    keywords: [
      "change background of image",
      "change image background",
      "replace background",
      "change photo background",
      "ai change background",
      "background changer online",
      "swap background",
      "new background for photo",
      "free background changer",
    ],
    faq: [
      {
        question: "Is this background changer free?",
        answer:
          "Yes. Upload a photo, pick a new background, preview the result, and download a PNG with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. AI cutout and compositing run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What background options can I use?",
        answer:
          "Choose a solid color, upload a custom background image, or apply a portrait-style blur to the original scene.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB for both the subject photo and an optional background image. Exports are PNG.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later background changes are significantly faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in e-commerce, marketing, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "ai-image-generator",
    name: "Free AI Image Generator",
    shortName: "AI Images",
    description:
      "Generate AI images from text prompts online — pick a style and size, preview instantly, and download a PNG. Free, no account required.",
    category: "images",
    status: "ready",
    href: "/ai-image-generator",
    keywords: [
      "ai image generator",
      "free ai image generator",
      "text to image",
      "ai art generator",
      "generate image from text",
      "ai picture generator",
      "prompt to image",
      "free text to image",
      "ai image maker",
    ],
    faq: [
      {
        question: "Is this AI image generator free?",
        answer:
          "Yes. Write a prompt, generate images, and download PNGs with no account, subscription, or credit card.",
      },
      {
        question: "How does text-to-image generation work?",
        answer:
          "You describe the scene in plain language. The tool sends your prompt to an AI image model, which returns a new image you can preview and download.",
      },
      {
        question: "Are my prompts stored by Focera?",
        answer:
          "Focera does not keep a gallery of your prompts or images. Your prompt is sent to the generation provider to create the image, then the result is shown in your browser for download.",
      },
      {
        question: "Which sizes and styles are available?",
        answer:
          "Choose square, landscape, or portrait sizes, plus styles such as photorealistic, illustration, digital art, anime, and more. You can also leave the style on Auto.",
      },
      {
        question: "Can I download the generated image?",
        answer:
          "Yes. After generation, download a PNG to use in mockups, social posts, presentations, and creative projects.",
      },
      {
        question: "Why did generation fail or take long?",
        answer:
          "The free model can be busy or rate-limited. Wait a few seconds and try again, or shorten the prompt and regenerate with a new seed.",
      },
      {
        question: "Do I need an account or API key?",
        answer:
          "No. Open the page, enter a prompt, and generate. Nothing to install and no signup required.",
      },
    ],
  },
  {
    slug: "remove-watermark",
    name: "Remove Watermark from Photo Online Free",
    shortName: "Remove Watermark",
    description:
      "Remove watermarks from photos online — brush over logos or text and restore the image. Free, private, and local in your browser.",
    category: "images",
    status: "ready",
    href: "/remove-watermark",
    keywords: [
      "remove watermark",
      "watermark remover",
      "remove watermark from photo",
      "remove logo from image",
      "erase watermark",
      "photo watermark remover",
      "remove text from image",
      "free watermark remover",
      "remove watermark online",
      "clean watermark from photo",
    ],
    faq: [
      {
        question: "Is this watermark remover free?",
        answer:
          "Yes. Upload a photo, mark the watermark, restore the area, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Watermark removal runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How do I remove a watermark?",
        answer:
          "Upload your photo, paint over the watermark or logo with the brush, then click Remove watermark. The tool fills the marked area using nearby pixels.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a cleaned PNG.",
      },
      {
        question: "Does it work on text and logo watermarks?",
        answer:
          "Yes. Brush carefully over text overlays, stamps, or logos. Smaller, solid watermarks usually restore more cleanly than very large areas.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After processing, drag the preview slider to compare the original photo with the cleaned result.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use. Only remove watermarks from images you own or have permission to edit.",
      },
    ],
  },
  {
    slug: "upscale-image",
    name: "Upscale Image Online Free — Increase Resolution",
    shortName: "Upscale Image",
    description:
      "Increase image resolution online — upscale 2×, 3×, or 4× with detail enhancement. Free, private, and local in your browser.",
    category: "images",
    status: "ready",
    href: "/upscale-image",
    keywords: [
      "upscale image",
      "increase image resolution",
      "image upscaler",
      "enlarge image",
      "upscale photo",
      "increase photo resolution",
      "make image larger",
      "free image upscaler",
      "upscale image online",
      "4x image upscaler",
    ],
    faq: [
      {
        question: "Is this image upscaler free?",
        answer:
          "Yes. Upload, upscale, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Upscaling runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which scale factors are available?",
        answer:
          "Choose 2×, 3×, or 4×. Output is capped at 8192 pixels on the longest side for browser stability.",
      },
      {
        question: "What does Enhance details do?",
        answer:
          "After enlarging, a light sharpening pass restores edge clarity so the result looks crisper than plain resizing.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a high-resolution PNG.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After upscaling, drag the preview slider to compare the original with the enlarged image.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, print, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "image-to-text",
    name: "Image to Text Online Free — OCR Converter",
    shortName: "Image to Text",
    description:
      "Extract text from images online with OCR — convert photos, screenshots, and scans to editable text. Free, private, and local in your browser.",
    category: "images",
    status: "ready",
    href: "/image-to-text",
    keywords: [
      "image to text",
      "ocr online",
      "extract text from image",
      "photo to text",
      "image to text converter",
      "screenshot to text",
      "scan to text",
      "free ocr",
      "picture to text",
      "ocr converter",
    ],
    faq: [
      {
        question: "Is this image to text converter free?",
        answer:
          "Yes. Upload an image, extract text, copy, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. OCR runs entirely in your browser with Tesseract. Your files stay on your device.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "Choose English, Spanish, French, German, Portuguese, Simplified Chinese, or Japanese before extracting text.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Clear, high-contrast text usually recognizes best.",
      },
      {
        question: "Can I edit the extracted text?",
        answer:
          "Yes. After OCR finishes, edit the result in the text panel, then copy it or download a .txt file.",
      },
      {
        question: "Does handwriting work?",
        answer:
          "Printed or typed text works best. Neat, high-contrast handwriting may work, but results vary.",
      },
      {
        question: "Can I use the text commercially?",
        answer:
          "Yes. Text you extract is yours to use. Only process images you own or have permission to convert.",
      },
    ],
  },
  {
    slug: "image-compressor",
    name: "Compress Image Size Online Free",
    shortName: "Image Compressor",
    description:
      "Compress image file size online — shrink JPG, PNG, and WebP with Extreme, Strong, Balanced, or Light presets. Free, private, and local in your browser.",
    category: "images",
    status: "ready",
    href: "/image-compressor",
    keywords: [
      "compress image",
      "image compressor",
      "compress image size",
      "reduce image size",
      "shrink image",
      "optimize image",
      "compress jpg",
      "compress png",
      "compress webp",
      "free image compressor",
      "compress photo online",
    ],
    faq: [
      {
        question: "Is this image compressor free?",
        answer:
          "Yes. Upload, compress, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Compression runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How does compression work?",
        answer:
          "Your image is optionally resized to a max dimension for the chosen level, then re-encoded as JPEG or WebP at a lower quality. Stronger levels use lower quality and smaller dimensions for more savings.",
      },
      {
        question: "Which formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Output can be Auto, JPEG, or WebP.",
      },
      {
        question: "Will quality look the same?",
        answer:
          "Light keeps more detail; Extreme saves the most space. Use the before/after slider to judge quality, then try another level if needed.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your image, and compress immediately.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Compressed files you download are yours to use in marketing, web, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    shortName: "Converter",
    description: "Convert images between PNG, JPG, WebP, and more.",
    category: "images",
    status: "soon",
    href: "/image-converter",
    keywords: ["convert", "png", "jpg", "webp"],
    faq: [
      {
        question: "Which formats will be supported?",
        answer: "PNG, JPG, and WebP are planned for the first release.",
      },
    ],
  },
  {
    slug: "pdf-to-word",
    name: "Free PDF to Word Converter",
    shortName: "PDF to Word",
    description:
      "Convert PDF to Word (.docx) online — extract editable text or embed exact page images. Free, private, and local in your browser.",
    category: "converters",
    status: "ready",
    href: "/pdf-to-word",
    keywords: [
      "pdf to word",
      "pdf to docx",
      "convert pdf to word",
      "pdf to word converter",
      "pdf to microsoft word",
      "pdf to editable word",
      "free pdf to word",
      "pdf to word online",
    ],
    faq: [
      {
        question: "Is this PDF to Word converter free?",
        answer:
          "Yes. Convert and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "What is the difference between Editable text and Exact pages?",
        answer:
          "Editable text extracts selectable text into a Word document you can edit. Exact pages embeds each PDF page as an image so the layout matches visually, but text inside images is not editable.",
      },
      {
        question: "Will formatting match the original PDF?",
        answer:
          "Editable text rebuilds paragraphs and may not preserve complex columns, tables, or precise positioning. Exact pages keeps a visual match by embedding page images.",
      },
      {
        question: "What file do I download?",
        answer:
          "You get a .docx file compatible with Microsoft Word, Google Docs, LibreOffice, and most modern word processors.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Can I convert password-protected PDFs?",
        answer:
          "Not yet. Remove the password from protected files first, then upload them to convert.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-jpg",
    name: "Free PDF to JPG Converter",
    shortName: "PDF to JPG",
    description:
      "Convert PDF pages to JPG images online — preview each page, download singly or as a ZIP. Free, private, and local in your browser.",
    category: "images",
    status: "ready",
    href: "/pdf-to-jpg",
    keywords: [
      "pdf to jpg",
      "pdf to jpeg",
      "convert pdf to jpg",
      "pdf to jpg converter",
      "pdf to image",
      "pdf page to jpg",
      "free pdf to jpg",
      "pdf to jpg online",
    ],
    faq: [
      {
        question: "Is this PDF to JPG converter free?",
        answer:
          "Yes. Convert, preview, and download unlimited PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "Can I download all pages at once?",
        answer:
          "Yes. After conversion, download the current page as a JPG or use Download all (ZIP) to get every page in one archive.",
      },
      {
        question: "What quality and resolution options are available?",
        answer:
          "Choose Smaller, Balanced, or High JPEG quality, and 1×, 1.5×, or 2× render scale for sharper page images.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Why do JPG pages have a white background?",
        answer:
          "JPEG does not support transparency. Transparent PDF areas are filled with white so pages look correct in viewers and editors.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "password-generator",
    name: "Free Password Generator",
    shortName: "Passwords",
    description:
      "Generate strong, random passwords with length controls, symbols, numbers, uppercase, lowercase, strength meter, and entropy.",
    category: "security",
    status: "ready",
    href: "/password-generator",
    keywords: [
      "password generator",
      "free password generator",
      "random password generator",
      "strong password generator",
      "secure password maker",
      "password entropy",
      "password strength meter",
    ],
    faq: [
      {
        question: "Are generated passwords stored or uploaded?",
        answer:
          "No. Passwords are created locally in your browser with the Web Crypto API and are never sent to Focera servers.",
      },
      {
        question: "How does the strength meter work?",
        answer:
          "Strength is estimated from password entropy — length multiplied by log₂ of the selected character pool. Higher entropy maps to stronger labels.",
      },
      {
        question: "What is password entropy?",
        answer:
          "Entropy measures unpredictability in bits. A longer password from a larger character set has higher entropy and is harder to brute-force when generation is random.",
      },
      {
        question: "Can I include or exclude symbols and numbers?",
        answer:
          "Yes. Toggle lowercase, uppercase, numbers, and symbols independently. At least one character set must stay enabled.",
      },
      {
        question: "What password length should I use?",
        answer:
          "Sixteen characters or more is a solid default for most accounts. Use 20+ for email, banking, and admin access when the site allows it.",
      },
      {
        question: "Is this password generator free?",
        answer:
          "Yes. Generate and copy unlimited passwords with no account, subscription, or daily limit.",
      },
      {
        question: "Are the passwords cryptographically random?",
        answer:
          "Yes. The generator uses crypto.getRandomValues for secure randomness rather than Math.random.",
      },
    ],
  },
  {
    slug: "password-checker",
    name: "Password Checker",
    shortName: "Strength Check",
    description: "Estimate password strength and spot weak patterns.",
    category: "security",
    status: "soon",
    href: "/password-checker",
    keywords: ["password", "strength", "security"],
    faq: [
      {
        question: "Do you check my password against breaches?",
        answer:
          "The first version estimates strength locally. Breach checks may come later.",
      },
    ],
  },
  {
    slug: "html-css-js-minifier",
    name: "Free HTML CSS JS Minifier",
    shortName: "Minifier",
    description:
      "Minify HTML, CSS, and JavaScript online — compress code in your browser, then copy or download. Free, private, and fast.",
    category: "developers",
    status: "ready",
    href: "/html-css-js-minifier",
    keywords: [
      "html minifier",
      "css minifier",
      "javascript minifier",
      "js minifier",
      "minify html css js",
      "online code minifier",
      "compress html",
      "compress css",
      "minify javascript online",
    ],
    faq: [
      {
        question: "Does my code leave the browser?",
        answer:
          "No. HTML, CSS, and JavaScript minification run locally in your browser. Nothing is uploaded to Focera for processing.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "HTML, CSS, and JavaScript. Switch modes with the tabs, paste your source, then click Minify.",
      },
      {
        question: "How does JavaScript minification work?",
        answer:
          "JS is minified with Terser in your browser — compression, mangling, and comment removal for compact production output.",
      },
      {
        question: "Can I download the minified file?",
        answer:
          "Yes. After minifying, use Download to save a .html, .css, or .js file generated on your device. You can also copy the result to the clipboard.",
      },
      {
        question: "Will HTML minification break my layout?",
        answer:
          "Significant whitespace inside tags like pre, code, script, and style is preserved. Most other comments and inter-tag whitespace are removed safely for typical markup.",
      },
      {
        question: "Is this minifier free?",
        answer:
          "Yes. Minify, copy, and download with no account, subscription, or daily limit.",
      },
      {
        question: "Do I need to install anything?",
        answer:
          "No. Open the page in a modern browser, paste your code, and minify immediately.",
      },
    ],
  },
  {
    slug: "json-formatter",
    name: "Free JSON Formatter & Validator",
    shortName: "JSON",
    description:
      "Format, validate, and minify JSON online with error highlighting, copy, download, and a dark editor mode.",
    category: "developers",
    status: "ready",
    href: "/json-formatter",
    keywords: [
      "json formatter",
      "json validator",
      "json beautifier",
      "minify json",
      "pretty print json",
      "format json online",
      "json lint",
    ],
    faq: [
      {
        question: "Does my JSON leave the browser?",
        answer:
          "No. Formatting, validation, and minification run locally with your browser’s JSON parser. Nothing is uploaded to Focera.",
      },
      {
        question: "Can I minify JSON as well as format it?",
        answer:
          "Yes. Use Format for readable 2-space indentation, or Minify to collapse whitespace into a compact single line.",
      },
      {
        question: "How does error highlighting work?",
        answer:
          "When JSON is invalid, the status bar shows the message with line and column when available, and the matching line is marked in the editor gutter.",
      },
      {
        question: "Can I download the result as a file?",
        answer:
          "Yes. After your JSON validates, click Download to save a .json file generated on your device.",
      },
      {
        question: "Is there a dark mode for the editor?",
        answer:
          "Yes. Toggle Dark / Light in the toolbar. Your preference is stored in local storage on your device only.",
      },
      {
        question: "Is this JSON formatter free?",
        answer:
          "Yes. Format, validate, minify, copy, and download with no account, subscription, or daily limit.",
      },
      {
        question: "Do I need to install anything?",
        answer:
          "No. Open the page in a modern browser, paste your JSON, and use the toolbar actions immediately.",
      },
    ],
  },
  {
    slug: "markdown-editor",
    name: "Free Markdown Editor with Live Preview",
    shortName: "Markdown",
    description:
      "Write Markdown with a live preview, syntax highlighting, dark mode, and export to Markdown, HTML, or PDF — all in your browser.",
    category: "developers",
    status: "ready",
    href: "/markdown-editor",
    keywords: [
      "markdown editor",
      "markdown preview",
      "online markdown editor",
      "markdown to html",
      "markdown to pdf",
      "live markdown preview",
      "md editor",
    ],
    faq: [
      {
        question: "Does my Markdown leave the browser?",
        answer:
          "No. Parsing, preview, sanitization, and exports run locally in your browser. Nothing is uploaded to Focera.",
      },
      {
        question: "What can I export?",
        answer:
          "Download your document as Markdown (.md), a self-contained HTML file, or a PDF generated on your device. You can also copy rendered HTML to the clipboard.",
      },
      {
        question: "Does the preview support syntax highlighting?",
        answer:
          "Yes. Fenced code blocks with a language tag (for example ts or python) are highlighted in the live preview.",
      },
      {
        question: "Is there a dark mode?",
        answer:
          "Yes. Toggle Dark / Light in the toolbar. Your preference is stored in local storage on your device only.",
      },
      {
        question: "Will my draft be saved?",
        answer:
          "Yes. The editor autosaves your draft to local storage on this device so you can refresh without losing work. Clear removes the draft.",
      },
      {
        question: "Is this Markdown editor free?",
        answer:
          "Yes. Write, preview, copy, and export with no account, subscription, or daily limit.",
      },
      {
        question: "Do I need to install anything?",
        answer:
          "No. Open the page in a modern browser and start writing immediately.",
      },
    ],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getReadyTools(): Tool[] {
  return tools.filter((tool) => tool.status === "ready");
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}
