import type { ToolCategory } from "@/data/tools";

export type CategorySeoContent = {
  /** Meta description / Open Graph snippet (~150–160 chars ideal). */
  metaDescription: string;
  /** Short hero line under the H1. */
  lede: string;
  keywords: string[];
  /** H2 above the intro block. */
  heading: string;
  /** Opening paragraphs under the H2. */
  intro: string[];
  /** Highlighted tools and what they do. */
  toolsHeading: string;
  tools: string[];
  /** Where / when people use these tools. */
  useCasesHeading: string;
  useCases: { title: string; description: string }[];
  /** Closing privacy / trust paragraph. */
  closing: string;
};

export const categorySeo: Record<ToolCategory, CategorySeoContent> = {
  pdf: {
    metaDescription:
      "Free PDF tools online — merge, split, compress, convert, edit, protect, and watermark PDFs in your browser. No sign-up. Private on Focera.",
    lede: "Merge, split, compress, convert, edit, and secure PDFs online — free, private, and ready in your browser.",
    keywords: [
      "PDF tools",
      "free PDF tools online",
      "merge PDF",
      "compress PDF",
      "PDF to Word",
      "edit PDF online",
      "convert PDF",
      "protect PDF",
      "PDF editor free",
    ],
    heading: "Free PDF tools online — edit, convert, and manage PDFs in your browser",
    intro: [
      "Focera’s PDF Tools category brings together free online utilities for everyday document work: merge and split files, compress large PDFs, convert between PDF and Word, Excel, PowerPoint, images, and ebooks, plus edit, annotate, watermark, crop, rotate, unlock, and password-protect PDFs — without installing software.",
      "Whether you need a quick PDF editor for a contract, a compressor before email, or a converter for a report, every ready tool runs locally in your browser whenever possible so your documents stay on your device.",
    ],
    toolsHeading: "What PDF tools you’ll find here",
    tools: [
      "Organize & edit — PDF Editor, PDF Creator, Merge PDF, Split PDF, Rotate PDF, Rearrange PDF, Delete PDF Pages, Crop PDF, Annotate PDF, Add Text / Images / Page Numbers, and eSign PDF.",
      "Compress & secure — Compress PDF for smaller attachments, Protect PDF with a password, Unlock PDF when you have the password, and PDF Watermark for drafts or branding.",
      "Convert documents — PDF to Word, Word to PDF, PDF to Excel / CSV, PDF to PowerPoint, PowerPoint to PDF, URL to PDF, and PDF to Text or PDF Translator for extractable copy.",
      "Images & ebooks — PDF to JPG / PNG / TIFF, Image / PNG / TIFF to PDF, Extract Images from PDF, plus PDF ↔ EPUB, MOBI, and AZW3 converters.",
    ],
    useCasesHeading: "Where you can use these PDF tools",
    useCases: [
      {
        title: "Work & school",
        description:
          "Combine lecture notes, shrink scanned homework, convert a résumé to Word, add page numbers to a thesis, or sign a form before sending it back.",
      },
      {
        title: "Business & freelancing",
        description:
          "Merge invoices into one PDF, watermark proposals, protect confidential decks, extract tables to Excel, or turn a web page into a PDF archive.",
      },
      {
        title: "Personal admin",
        description:
          "Rotate phone scans, crop margins, unlock an old file you own, convert ebook formats, or pull images out of a PDF for reprinting.",
      },
    ],
    closing:
      "Browse the PDF tools below, open the one you need, and process files privately on Focera — free, no account required, built for desktop and mobile browsers.",
  },

  image: {
    metaDescription:
      "Free image tools online — add text on photos, crop, resize, remove backgrounds, compress, upscale, colorize, convert, and more in your browser. Private image utilities on Focera.",
    lede: "Browse by Edit image, Size, color, text, or Change image format — free photo tools in your browser.",
    keywords: [
      "image tools",
      "free image tools online",
      "background remover",
      "image compressor",
      "crop image",
      "upscale image",
      "image to PDF",
      "remove watermark",
      "AI image tools",
      "edit image",
      "change image format",
      "image converter",
      "colorize photo",
    ],
    heading: "Free image tools online — edit, compress, and transform photos in your browser",
    intro: [
      "Focera’s Image Tools category is grouped into three niches so you can find the right utility fast: Edit image for backgrounds and cleanup, Size, color, text for finishing work like resize, compress, color, and captions, and Change image format for conversions.",
      "Use these tools for product shots, social posts, scanned documents, and design assets — process images in your browser with a privacy-first workflow whenever the tool can run locally.",
    ],
    toolsHeading: "What image tools you’ll find here",
    tools: [
      "Edit image — Background Remover, Change Background, Blur Background, Make Background Transparent, Cleanup Picture, Remove Objects, Remove Person, Remove Watermark, Unblur Image, Add Images to Image, Add Border to Image, and Round Image.",
      "Size, color, text — Resize, Crop, Compress, Upscale, Flip, Split, Combine, Collage, Profile Photo Maker, Color Palette, Black & White, Colorize, Pixelate, Add Text on Image, Image to Text, Translate Image, View Metadata, and AI Image Generator.",
      "Change image format — GIF to MP4, HEIC to JPG / PNG, PDF to JPG / PNG / TIFF, Extract Images from PDF, Image / PNG / TIFF to PDF, PNG to JPG / WebP / SVG / EPS / GIF, EPS to PNG, PSD to JPG / PNG / AI, JPG to PNG / WebP / GIF / TIFF / SVG, SVG to PNG, WebP to JPG / PNG / GIF / PDF, and GIF to PDF.",
    ],
    useCasesHeading: "Where you can use these image tools",
    useCases: [
      {
        title: "E‑commerce & marketing",
        description:
          "Cut out product backgrounds, generate campaign visuals, compress images for faster pages, and export clean assets for ads or listings.",
      },
      {
        title: "Content & social",
        description:
          "Crop to story or square ratios, upscale low-res photos, colorize old pictures, build palettes for brand kits, or turn screenshots into searchable text.",
      },
      {
        title: "Documents & scans",
        description:
          "Convert photos to PDF for filing, extract images from PDFs, or prepare scans before sharing with clients or schools.",
      },
    ],
    closing:
      "Pick an image tool below to start editing or converting — free on Focera, no sign-up, and designed to keep your files on your device when processing stays in-browser.",
  },

  video: {
    metaDescription:
      "Free video tools online — compress, trim, convert to GIF, extract audio, captions, and more in your browser. Private video utilities on Focera.",
    lede: "Compress, trim, convert to GIF, extract audio, and caption videos — free video tools in your browser.",
    keywords: [
      "video tools",
      "free video tools online",
      "compress video",
      "video to GIF",
      "trim video",
      "extract audio",
      "MP4 to MP3",
      "video captions",
      "YouTube to text",
    ],
    heading: "Free video tools online — compress, convert, trim, and extract in your browser",
    intro: [
      "Focera’s Video Tools category gathers free online utilities for clips and recordings: compress large videos, trim segments, convert video to GIF, extract audio or convert MP4 to MP3, add captions, and turn speech from video or audio into text — including YouTube-focused helpers.",
      "Creators, students, and marketers can prepare uploads, make lightweight GIFs, pull soundtracks, or get transcripts without installing a heavy desktop suite. Ready tools aim for private, browser-based processing whenever possible.",
    ],
    toolsHeading: "What video tools you’ll find here",
    tools: [
      "Edit & convert — Compress Video, Trim Video, Video to GIF, Extract Audio, and MP4 to MP3 for everyday prep and repurposing.",
      "Captions & speech — Video Captions, Video to Text, Audio to Text, YouTube to Text, and YouTube Summarizer for accessibility and note-taking.",
      "Social downloads (where available) — helpers for TikTok, Instagram, Twitter/X, and Facebook video workflows so you can save or reuse clips you have rights to use.",
    ],
    useCasesHeading: "Where you can use these video tools",
    useCases: [
      {
        title: "Social & marketing",
        description:
          "Shrink videos for platform limits, cut intros, export GIFs for posts, and extract audio for podcasts or voiceovers.",
      },
      {
        title: "Learning & meetings",
        description:
          "Transcribe lectures or recordings, summarize long YouTube videos, and caption clips for clearer sharing.",
      },
      {
        title: "Personal media",
        description:
          "Trim vacation footage, convert phone videos to GIF stickers, or pull music from a clip you recorded yourself.",
      },
    ],
    closing:
      "Open any video tool below to process a clip in your browser — free on Focera, no account required, with a privacy-first approach for local workflows.",
  },

  ai: {
    metaDescription:
      "Free AI tools online — image generation, background remover, YouTube summarize, speech-to-text, and more. Private AI utilities on Focera.",
    lede: "Generate images, remove backgrounds, summarize YouTube, and turn speech into text — free AI tools online.",
    keywords: [
      "AI tools",
      "free AI tools online",
      "AI image generator",
      "background remover",
      "YouTube summarizer",
      "speech to text",
      "AI story generator",
      "AI essay writer",
      "content improver",
      "image to text",
      "PDF translator",
    ],
    heading: "Free AI tools online — generate, summarize, and transform content in your browser",
    intro: [
      "Focera’s AI Tools category focuses on free online AI utilities that speed up creative and productivity tasks: generate images, stories, and essays, improve writing, remove or change backgrounds, colorize photos, turn speech and video into text, summarize YouTube content, run OCR on images, translate image text, and translate PDFs.",
      "These tools help you draft ideas, clean visuals, and extract meaning from media — with clear, practical workflows and a privacy-minded design so you can work without creating an account.",
    ],
    toolsHeading: "What AI tools you’ll find here",
    tools: [
      "Create & edit visuals — AI Image Generator, Background Remover, Change Background, and Colorize Photo for fast visual production.",
      "Understand media — YouTube Summarizer, YouTube to Text, Video to Text, Audio to Text, and Image to Text for transcripts, notes, and OCR.",
      "Writing & documents — AI Essay Writer, AI Content Improver, and AI Story Generator for drafts, plus PDF Translator when you need readable text across languages.",
    ],
    useCasesHeading: "Where you can use these AI tools",
    useCases: [
      {
        title: "Content creation",
        description:
          "Generate concept art, cut out subjects for thumbnails, draft story outlines, and turn long videos into short notes.",
      },
      {
        title: "Study & research",
        description:
          "Summarize educational YouTube videos, transcribe lectures, draft essays, OCR textbook photos, and translate PDF handouts.",
      },
      {
        title: "Business workflows",
        description:
          "Clean product photos, produce quick visuals for decks, and convert meeting recordings into searchable text.",
      },
    ],
    closing:
      "Explore the AI tools below and start with the task you need — free on Focera, no sign-up, built for practical everyday AI in the browser.",
  },

  file: {
    metaDescription:
      "Free file & utility tools online — QR codes, passwords, JSON, converters, invoices, and more in your browser. Private utilities on Focera.",
    lede: "QR codes, passwords, JSON, converters, invoices, and everyday utilities — free file tools in your browser.",
    keywords: [
      "file tools",
      "free online utilities",
      "QR code generator",
      "password generator",
      "JSON formatter",
      "unit converter",
      "invoice generator",
      "markdown editor",
      "word counter",
    ],
    heading: "Free file tools & online utilities — convert, generate, and format in your browser",
    intro: [
      "Focera’s File Tools category is a hub of free online utilities for everyday digital tasks: generate QR codes and passwords, format JSON, edit Markdown, minify HTML/CSS/JS, convert units, count words, build UTM links, create invoices, convert documents and ebooks, and handle common audio/video file jobs.",
      "Use this category when you need a quick generator, formatter, or converter without installing apps — most ready tools are built to run privately in your browser with no sign-up.",
    ],
    toolsHeading: "What file tools you’ll find here",
    tools: [
      "Generators & helpers — QR Generator, Password Generator, Lorem Ipsum, Invoice Generator, UTM Builder, Profit Calculator, Word Counter, and Text Case Converter.",
      "Developer & writing — JSON Formatter, Markdown Editor, and HTML/CSS/JS Minifier for clean code and content workflows.",
      "Converters & media files — Unit Converter, Word/PowerPoint/URL ↔ PDF, PDF to Excel/CSV/Text/EPUB/MOBI, ebook to PDF converters, plus Video to GIF, Extract Audio, and MP4 to MP3 when your file is media.",
    ],
    useCasesHeading: "Where you can use these file tools",
    useCases: [
      {
        title: "Everyday productivity",
        description:
          "Make a QR for a Wi‑Fi card, generate a strong password, count words for an essay, convert units, or draft a simple invoice.",
      },
      {
        title: "Dev & marketing",
        description:
          "Pretty-print JSON, minify front-end assets, write Markdown notes, and build tracked campaign URLs with UTM parameters.",
      },
      {
        title: "Document & media files",
        description:
          "Convert office docs and ebooks to PDF, extract text or audio from media files, and prepare files for email or upload limits.",
      },
    ],
    closing:
      "Choose a file tool below to generate, format, or convert — free on Focera, no account needed, and ready for desktop or mobile browsers.",
  },
};

export function getCategorySeo(category: ToolCategory): CategorySeoContent {
  return categorySeo[category];
}
