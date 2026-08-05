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

export const PngToPdfLazy = dynamic(
  () => import("@/components/tools/PngToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfToWordLazy = dynamic(
  () => import("@/components/tools/PdfToWord"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const WordToPdfLazy = dynamic(
  () => import("@/components/tools/WordToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const EpubToPdfLazy = dynamic(
  () => import("@/components/tools/EpubToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfToTextLazy = dynamic(
  () => import("@/components/tools/PdfToText"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfTranslatorLazy = dynamic(
  () => import("@/components/tools/PdfTranslator"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfToExcelLazy = dynamic(
  () => import("@/components/tools/PdfToExcel"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfToPowerpointLazy = dynamic(
  () => import("@/components/tools/PdfToPowerpoint"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PowerpointToPdfLazy = dynamic(
  () => import("@/components/tools/PowerpointToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfToEpubLazy = dynamic(
  () => import("@/components/tools/PdfToEpub"),
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

export const CropPdfLazy = dynamic(
  () => import("@/components/tools/CropPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const UnlockPdfLazy = dynamic(
  () => import("@/components/tools/UnlockPdf"),
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

export const PdfWatermarkLazy = dynamic(
  () => import("@/components/tools/PdfWatermark"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const UpscaleImageLazy = dynamic(
  () => import("@/components/tools/UpscaleImage"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const ColorizePhotoLazy = dynamic(
  () => import("@/components/tools/ColorizePhoto"),
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

export const TrimVideoLazy = dynamic(
  () => import("@/components/tools/TrimVideo"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const VideoToGifLazy = dynamic(
  () => import("@/components/tools/VideoToGif"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const Mp4ToMp3Lazy = dynamic(
  () => import("@/components/tools/Mp4ToMp3"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const ExtractAudioLazy = dynamic(
  () => import("@/components/tools/ExtractAudio"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const YoutubeToTextLazy = dynamic(
  () => import("@/components/tools/YoutubeToText"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const YoutubeSummarizeLazy = dynamic(
  () => import("@/components/tools/YoutubeSummarize"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const AudioToTextLazy = dynamic(
  () => import("@/components/tools/AudioToText"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const VideoToTextLazy = dynamic(
  () => import("@/components/tools/VideoToText"),
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

export const TwitterVideoDownloaderLazy = dynamic(
  () => import("@/components/tools/TwitterVideoDownloader"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const FacebookVideoDownloaderLazy = dynamic(
  () => import("@/components/tools/FacebookVideoDownloader"),
  { ssr: false, loading: () => <ToolLoading /> },
);
