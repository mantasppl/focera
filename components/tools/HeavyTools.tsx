"use client";

import dynamic from "next/dynamic";

function ToolLoading() {
  return (
    <div className="tool-loading" role="status" aria-live="polite">
      <span className="tool-loading__spinner" aria-hidden="true" />
      Loading tool…
    </div>
  );
}

export const BackgroundRemoverLazy = dynamic(
  () => import("@/components/tools/BackgroundRemover"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const ChangeBackgroundLazy = dynamic(
  () => import("@/components/tools/ChangeBackground"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const MarkdownEditorLazy = dynamic(
  () => import("@/components/tools/MarkdownEditor"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const InvoiceGeneratorLazy = dynamic(
  () => import("@/components/tools/InvoiceGenerator"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const HtmlCssJsMinifierLazy = dynamic(
  () => import("@/components/tools/HtmlCssJsMinifier"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfToJpgLazy = dynamic(
  () => import("@/components/tools/PdfToJpg"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfToWordLazy = dynamic(
  () => import("@/components/tools/PdfToWord"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const MergePdfLazy = dynamic(
  () => import("@/components/tools/MergePdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const CompressPdfLazy = dynamic(
  () => import("@/components/tools/CompressPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const SplitPdfLazy = dynamic(
  () => import("@/components/tools/SplitPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfEditorLazy = dynamic(
  () => import("@/components/tools/PdfEditor"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const UpscaleImageLazy = dynamic(
  () => import("@/components/tools/UpscaleImage"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const ImageCompressorLazy = dynamic(
  () => import("@/components/tools/ImageCompressor"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const RemoveWatermarkLazy = dynamic(
  () => import("@/components/tools/RemoveWatermark"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const ImageToTextLazy = dynamic(
  () => import("@/components/tools/ImageToText"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const VideoAutocaptionLazy = dynamic(
  () => import("@/components/tools/VideoAutocaption"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const CompressVideoLazy = dynamic(
  () => import("@/components/tools/CompressVideo"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const YoutubeToTextLazy = dynamic(
  () => import("@/components/tools/YoutubeToText"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const InstagramVideoDownloaderLazy = dynamic(
  () => import("@/components/tools/InstagramVideoDownloader"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const TikTokVideoDownloaderLazy = dynamic(
  () => import("@/components/tools/TikTokVideoDownloader"),
  { ssr: false, loading: () => <ToolLoading /> },
);
