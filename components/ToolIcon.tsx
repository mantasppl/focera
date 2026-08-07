type ToolIconProps = {
  slug: string;
  className?: string;
};

type IconKind =
  | "merge"
  | "split"
  | "compress"
  | "rotate"
  | "crop"
  | "lock"
  | "unlock"
  | "sign"
  | "annotate"
  | "text"
  | "image"
  | "watermark"
  | "pages"
  | "convert"
  | "translate"
  | "video"
  | "audio"
  | "gif"
  | "caption"
  | "download"
  | "summarize"
  | "spark"
  | "palette"
  | "qr"
  | "invoice"
  | "ruler"
  | "case"
  | "counter"
  | "password"
  | "code"
  | "markdown"
  | "link"
  | "calc"
  | "file"
  | "eraser"
  | "upscale"
  | "colorize"
  | "ocr";

function iconKindForSlug(slug: string): IconKind {
  if (slug.includes("merge")) return "merge";
  if (slug.includes("split") || slug.includes("delete-pdf")) return "split";
  if (slug.includes("compress")) return "compress";
  if (slug.includes("rotate") || slug.includes("rearrange")) return "rotate";
  if (slug.includes("crop") || slug.includes("trim")) return "crop";
  if (slug.includes("unlock")) return "unlock";
  if (slug.includes("protect") || slug.includes("password-checker"))
    return "lock";
  if (slug.includes("password")) return "password";
  if (slug.includes("esign")) return "sign";
  if (slug.includes("annotate") || slug.includes("add-text")) return "annotate";
  if (slug.includes("page-numbers")) return "pages";
  if (slug.includes("watermark") || slug.includes("remove-watermark"))
    return slug.includes("remove") ? "eraser" : "watermark";
  if (slug.includes("translator") || slug.includes("translate"))
    return "translate";
  if (slug.includes("upscale")) return "upscale";
  if (slug.includes("colorize")) return "colorize";
  if (slug.includes("background") || slug.includes("bg")) return "eraser";
  if (slug.includes("image-to-text") || slug.includes("ocr")) return "ocr";
  if (slug.includes("image-compressor") || slug.includes("image-converter"))
    return "image";
  if (
    slug.includes("pdf-to-jpg") ||
    slug.includes("pdf-to-png") ||
    slug.includes("pdf-to-tiff") ||
    slug.includes("extract-images") ||
    slug.includes("image-to-pdf") ||
    slug.includes("png-to-pdf") ||
    slug.includes("tiff-to-pdf") ||
    slug.includes("add-images")
  )
    return "image";
  if (slug.includes("gif")) return "gif";
  if (slug.includes("caption") || slug.includes("autocaption")) return "caption";
  if (
    slug.includes("tiktok") ||
    slug.includes("instagram") ||
    slug.includes("twitter") ||
    slug.includes("facebook")
  )
    return "download";
  if (slug.includes("summarize") || slug.includes("summarizer"))
    return "summarize";
  if (slug.includes("extract-audio") || slug.includes("mp4-to-mp3"))
    return "audio";
  if (
    slug.includes("audio-to-text") ||
    slug.includes("video-to-text") ||
    slug.includes("youtube-to-text")
  )
    return "ocr";
  if (slug.includes("video")) return "video";
  if (slug.includes("ai-image") || slug.includes("ai-story")) return "spark";
  if (slug.includes("palette") || slug.includes("color")) return "palette";
  if (slug.includes("qr")) return "qr";
  if (slug.includes("invoice")) return "invoice";
  if (slug.includes("unit")) return "ruler";
  if (slug.includes("text-case") || slug.includes("lorem")) return "case";
  if (slug.includes("word-counter")) return "counter";
  if (slug.includes("utm") || slug.includes("url-to")) return "link";
  if (slug.includes("profit") || slug.includes("calculator")) return "calc";
  if (slug.includes("json") || slug.includes("minifier")) return "code";
  if (slug.includes("markdown")) return "markdown";
  if (
    slug.includes("to-word") ||
    slug.includes("to-excel") ||
    slug.includes("to-csv") ||
    slug.includes("to-powerpoint") ||
    slug.includes("powerpoint-to") ||
    slug.includes("word-to") ||
    slug.includes("to-epub") ||
    slug.includes("to-mobi") ||
    slug.includes("epub-to") ||
    slug.includes("mobi-to") ||
    slug.includes("azw3") ||
    slug.includes("pdf-to-text") ||
    slug.includes("pdf-creator") ||
    slug.includes("pdf-editor")
  )
    return "convert";
  if (slug.includes("pdf")) return "file";
  return "file";
}

export default function ToolIcon({
  slug,
  className = "tool-chip__svg",
}: ToolIconProps) {
  const common = {
    className,
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (iconKindForSlug(slug)) {
    case "merge":
      return (
        <svg {...common}>
          <path d="M8 4v7a4 4 0 0 0 4 4h8" {...stroke} />
          <path d="M8 20v-5" {...stroke} />
          <path d="M16 8h4l-2-3M20 8l-2 3" {...stroke} />
        </svg>
      );
    case "split":
      return (
        <svg {...common}>
          <path d="M6 4v16M18 4v16M6 12h12" {...stroke} />
        </svg>
      );
    case "compress":
      return (
        <svg {...common}>
          <path d="M8 4h8v4H8V4ZM8 16h8v4H8v-4Z" {...stroke} />
          <path d="M12 9v6M9.5 11.5 12 9l2.5 2.5M9.5 12.5 12 15l2.5-2.5" {...stroke} />
        </svg>
      );
    case "rotate":
      return (
        <svg {...common}>
          <path d="M20 7v5h-5" {...stroke} />
          <path d="M4 12a8 8 0 0 1 14.3-5L20 9" {...stroke} />
          <path d="M4 12a8 8 0 0 0 14.3 5" {...stroke} />
        </svg>
      );
    case "crop":
      return (
        <svg {...common}>
          <path d="M6 3v12a3 3 0 0 0 3 3h12" {...stroke} />
          <path d="M18 21V9a3 3 0 0 0-3-3H3" {...stroke} />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="10" rx="2" {...stroke} />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" {...stroke} />
        </svg>
      );
    case "unlock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="10" rx="2" {...stroke} />
          <path d="M8 11V8a4 4 0 0 1 7.5-2" {...stroke} />
        </svg>
      );
    case "password":
      return (
        <svg {...common}>
          <circle cx="8" cy="12" r="3" {...stroke} />
          <path d="M11 12h9M17 12v3M20 12v2" {...stroke} />
        </svg>
      );
    case "sign":
      return (
        <svg {...common}>
          <path d="M4 19c2-4 4-6 7-6s4 3 5 5c1-3 3-5 5-5" {...stroke} />
          <path d="M14 5l5 5-9 9H5v-5l9-9Z" {...stroke} />
        </svg>
      );
    case "annotate":
      return (
        <svg {...common}>
          <path d="M12 20h9" {...stroke} />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" {...stroke} />
        </svg>
      );
    case "text":
      return (
        <svg {...common}>
          <path d="M4 7V5h16v2M12 5v14M9 19h6" {...stroke} />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
          <circle cx="9" cy="10" r="1.5" {...stroke} />
          <path d="M5.5 16.5 9 13l2.5 2.5L14 12.5l4.5 4" {...stroke} />
        </svg>
      );
    case "watermark":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" {...stroke} />
          <path d="M8 12h8M10 9h4M10 15h4" {...stroke} />
        </svg>
      );
    case "pages":
      return (
        <svg {...common}>
          <path d="M8 4h7l4 4v12H8V4Z" {...stroke} />
          <path d="M15 4v4h4M10 13h5M10 16h3" {...stroke} />
        </svg>
      );
    case "convert":
      return (
        <svg {...common}>
          <path d="M7 7h11l-3-3M18 7l-3 3" {...stroke} />
          <path d="M17 17H6l3 3M6 17l3-3" {...stroke} />
        </svg>
      );
    case "translate":
      return (
        <svg {...common}>
          <path d="M5 8h8M9 8c0 5-3 8-6 9" {...stroke} />
          <path d="M7 12c2 1.5 4 2 6 2M13 5v2M13 7c2.5 0 5 3 6 7" {...stroke} />
          <path d="M15 17h6M16.5 14l3 7 1.5-3.5" {...stroke} />
        </svg>
      );
    case "video":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="13" height="12" rx="2" {...stroke} />
          <path d="M16 10.5 21 8v8l-5-2.5v-3Z" {...stroke} />
        </svg>
      );
    case "audio":
      return (
        <svg {...common}>
          <path d="M9 18V6l10-2v12" {...stroke} />
          <circle cx="7" cy="18" r="2" {...stroke} />
          <circle cx="17" cy="16" r="2" {...stroke} />
        </svg>
      );
    case "gif":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
          <path d="M8 15V9h3a2 2 0 1 1 0 4H8M14 9v6M14 12h2.5M18 9v6" {...stroke} />
        </svg>
      );
    case "caption":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
          <path d="M7 14h4M13 14h4M7 11h10" {...stroke} />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v10M8.5 10.5 12 14l3.5-3.5" {...stroke} />
          <path d="M5 18h14" {...stroke} />
        </svg>
      );
    case "summarize":
      return (
        <svg {...common}>
          <path d="M8 6h11M8 12h11M8 18h7" {...stroke} />
          <path d="M4 6h.01M4 12h.01M4 18h.01" {...stroke} />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path
            d="M12 3.5 13.4 8.2 18 9.6 13.4 11 12 15.7 10.6 11 6 9.6l4.6-1.4L12 3.5Z"
            {...stroke}
          />
          <path d="M19 15.5 19.5 17.2 21.2 17.7 19.5 18.2 19 19.9 18.5 18.2 16.8 17.7l1.7-.5.5-1.7Z" {...stroke} />
        </svg>
      );
    case "palette":
      return (
        <svg {...common}>
          <path
            d="M12 4a8 8 0 1 0 0 16h1.2a2.2 2.2 0 0 0 0-4.4H12a1.6 1.6 0 1 1 0-3.2 8 8 0 0 0 0-8.4Z"
            {...stroke}
          />
          <circle cx="7.5" cy="10" r="1" fill="currentColor" />
          <circle cx="10" cy="7.5" r="1" fill="currentColor" />
          <circle cx="14" cy="7.5" r="1" fill="currentColor" />
        </svg>
      );
    case "qr":
      return (
        <svg {...common}>
          <path d="M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6Z" {...stroke} />
          <path d="M14 14h2v2h-2v-2ZM18 14h2v6h-6v-2h2v-2h2v-2Z" {...stroke} />
        </svg>
      );
    case "invoice":
      return (
        <svg {...common}>
          <path d="M7 3h10l2 3v15l-3-2-3 2-3-2-3 2V6l2-3Z" {...stroke} />
          <path d="M9 10h6M9 14h6" {...stroke} />
        </svg>
      );
    case "ruler":
      return (
        <svg {...common}>
          <path d="M4 16 16 4l4 4L8 20 4 16Z" {...stroke} />
          <path d="M8 12l2 2M11 9l2 2M14 6l2 2" {...stroke} />
        </svg>
      );
    case "case":
      return (
        <svg {...common}>
          <path d="M4 17V7h5a3 3 0 0 1 0 6H4M14 17V7h6M14 12h5" {...stroke} />
        </svg>
      );
    case "counter":
      return (
        <svg {...common}>
          <path d="M5 7h14M5 12h10M5 17h7" {...stroke} />
          <path d="M17 14v5M15 17h4" {...stroke} />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="M8 8 4 12l4 4M16 8l4 4-4 4M13 5l-2 14" {...stroke} />
        </svg>
      );
    case "markdown":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
          <path d="M6 15V9l3 4 3-4v6M15 12.5 17 15l2-2.5M17 15V9" {...stroke} />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7.1-7.1l-1.1 1" {...stroke} />
          <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7.1 7.1l1.1-1" {...stroke} />
        </svg>
      );
    case "calc":
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" {...stroke} />
          <path d="M8 7h8M8 12h2M12 12h2M16 12h0.01M8 16h2M12 16h2M16 16h0.01" {...stroke} />
        </svg>
      );
    case "eraser":
      return (
        <svg {...common}>
          <path d="M7 17 4.5 14.5a2 2 0 0 1 0-2.8L14 2.2a2 2 0 0 1 2.8 0L21.5 6.9a2 2 0 0 1 0 2.8L13 18.2" {...stroke} />
          <path d="M6 21h14M9.5 14.5l4 4" {...stroke} />
        </svg>
      );
    case "upscale":
      return (
        <svg {...common}>
          <path d="M4 14V6a2 2 0 0 1 2-2h8" {...stroke} />
          <path d="M10 20h8a2 2 0 0 0 2-2v-8" {...stroke} />
          <path d="M14 4h6v6M20 4l-7 7" {...stroke} />
        </svg>
      );
    case "colorize":
      return (
        <svg {...common}>
          <path d="M12 3v6M8 6h8" {...stroke} />
          <path d="M6 11h12a2 2 0 0 1 2 2v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a2 2 0 0 1 2-2Z" {...stroke} />
        </svg>
      );
    case "ocr":
      return (
        <svg {...common}>
          <path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3" {...stroke} />
          <path d="M8 9h8v6H8V9Z" {...stroke} />
        </svg>
      );
    case "file":
    default:
      return (
        <svg {...common}>
          <path d="M8 3h6l4 4v14H8V3Z" {...stroke} />
          <path d="M14 3v4h4M10 12h6M10 16h4" {...stroke} />
        </svg>
      );
  }
}
