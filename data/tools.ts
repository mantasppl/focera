export type ToolCategory =
  | "generators"
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
  marketing: "Marketing",
  finance: "Finance",
  images: "Images",
  security: "Security",
  developers: "Developers",
};

export const tools: Tool[] = [
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    shortName: "QR Generator",
    description: "Create downloadable QR codes from any link or text.",
    category: "generators",
    status: "ready",
    href: "/qr-generator",
    keywords: ["qr", "qr code", "barcode", "scan"],
    faq: [
      {
        question: "Is the QR code generated on my device?",
        answer:
          "Yes. Codes are created in your browser — nothing is uploaded to a server.",
      },
      {
        question: "What format can I download?",
        answer: "You get a high-contrast PNG ready to print or share.",
      },
    ],
  },
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    shortName: "Invoices",
    description: "Build clean invoices and export them for clients.",
    category: "finance",
    status: "soon",
    href: "/invoice-generator",
    keywords: ["invoice", "billing", "pdf"],
    faq: [
      {
        question: "Will invoices be saved online?",
        answer:
          "No. Drafts stay in your browser until you export or download them.",
      },
    ],
  },
  {
    slug: "utm-builder",
    name: "UTM Builder",
    shortName: "UTM Builder",
    description: "Add campaign parameters to URLs for cleaner tracking.",
    category: "marketing",
    status: "ready",
    href: "/utm-builder",
    keywords: ["utm", "campaign", "analytics", "tracking"],
    faq: [
      {
        question: "Which UTM parameters are supported?",
        answer:
          "Source, medium, and campaign are included. More parameters can be added later.",
      },
    ],
  },
  {
    slug: "profit-calculator",
    name: "Profit Calculator",
    shortName: "Profit Calc",
    description: "Calculate profit and margin from revenue and cost.",
    category: "finance",
    status: "ready",
    href: "/profit-calculator",
    keywords: ["profit", "margin", "revenue", "cost"],
    faq: [
      {
        question: "How is margin calculated?",
        answer: "Margin = (revenue − cost) ÷ revenue × 100.",
      },
    ],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    shortName: "Compressor",
    description: "Shrink image file size without leaving your browser.",
    category: "images",
    status: "soon",
    href: "/image-compressor",
    keywords: ["compress", "optimize", "jpg", "png", "webp"],
    faq: [
      {
        question: "Are my images uploaded?",
        answer: "No. Compression will run locally in your browser.",
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
    slug: "password-generator",
    name: "Password Generator",
    shortName: "Passwords",
    description: "Generate strong, random passwords with custom rules.",
    category: "security",
    status: "soon",
    href: "/password-generator",
    keywords: ["password", "generator", "security"],
    faq: [
      {
        question: "Are generated passwords stored?",
        answer: "No. They are created locally and never sent to a server.",
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
    slug: "json-formatter",
    name: "JSON Formatter",
    shortName: "JSON",
    description: "Format, validate, and tidy JSON for debugging.",
    category: "developers",
    status: "soon",
    href: "/json-formatter",
    keywords: ["json", "format", "validate", "pretty"],
    faq: [
      {
        question: "Does my JSON leave the browser?",
        answer: "No. Formatting and validation stay on your device.",
      },
    ],
  },
  {
    slug: "markdown-editor",
    name: "Markdown Editor",
    shortName: "Markdown",
    description: "Write Markdown with a live preview side by side.",
    category: "developers",
    status: "soon",
    href: "/markdown-editor",
    keywords: ["markdown", "md", "editor", "preview"],
    faq: [
      {
        question: "Can I export my Markdown?",
        answer: "Export options are planned once the editor ships.",
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
