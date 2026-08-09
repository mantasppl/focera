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

export const BlurBackgroundLazy = dynamic(
  () => import("@/components/tools/BlurBackground"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const MakeBackgroundTransparentLazy = dynamic(
  () => import("@/components/tools/MakeBackgroundTransparent"),
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

export const PdfToPngLazy = dynamic(
  () => import("@/components/tools/PdfToPng"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfToTiffLazy = dynamic(
  () => import("@/components/tools/PdfToTiff"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const ExtractImagesFromPdfLazy = dynamic(
  () => import("@/components/tools/ExtractImagesFromPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PngToPdfLazy = dynamic(
  () => import("@/components/tools/PngToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

/** Same converter as PNG to PDF — shared UI for the Image to PDF landing. */
export const ImageToPdfLazy = PngToPdfLazy;

/** Same converter as PNG to PDF — shared UI for the WebP to PDF landing. */
export const WebpToPdfLazy = PngToPdfLazy;

/** Same converter as PNG to PDF — shared UI for the GIF to PDF landing. */
export const GifToPdfLazy = PngToPdfLazy;

export const TiffToPdfLazy = dynamic(
  () => import("@/components/tools/TiffToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const EpsToPdfLazy = dynamic(
  () => import("@/components/tools/EpsToPdf"),
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

export const OutlookToPdfLazy = dynamic(
  () => import("@/components/tools/OutlookToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const EpubToPdfLazy = dynamic(
  () => import("@/components/tools/EpubToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const MobiToPdfLazy = dynamic(
  () => import("@/components/tools/MobiToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const Azw3ToPdfLazy = dynamic(
  () => import("@/components/tools/Azw3ToPdf"),
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

export const PdfToCsvLazy = dynamic(
  () => import("@/components/tools/PdfToCsv"),
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

export const PdfToMobiLazy = dynamic(
  () => import("@/components/tools/PdfToMobi"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfToAzw3Lazy = dynamic(
  () => import("@/components/tools/PdfToAzw3"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const PdfCreatorLazy = dynamic(
  () => import("@/components/tools/PdfCreator"),
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

export const ProtectPdfLazy = dynamic(
  () => import("@/components/tools/ProtectPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const SplitPdfLazy = dynamic(
  () => import("@/components/tools/SplitPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const DeletePdfPagesLazy = dynamic(
  () => import("@/components/tools/DeletePdfPages"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const RearrangePdfLazy = dynamic(
  () => import("@/components/tools/RearrangePdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const RotatePdfLazy = dynamic(
  () => import("@/components/tools/RotatePdf"),
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

export const AddPageNumbersToPdfLazy = dynamic(
  () => import("@/components/tools/AddPageNumbersToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const AddTextToPdfLazy = dynamic(
  () => import("@/components/tools/AddTextToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const AnnotatePdfLazy = dynamic(
  () => import("@/components/tools/AnnotatePdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const AddImagesToPdfLazy = dynamic(
  () => import("@/components/tools/AddImagesToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const EsignPdfLazy = dynamic(
  () => import("@/components/tools/EsignPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const UpscaleImageLazy = dynamic(
  () => import("@/components/tools/UpscaleImage"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const UnblurImageLazy = dynamic(
  () => import("@/components/tools/UnblurImage"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const ResizeImageLazy = dynamic(
  () => import("@/components/tools/ResizeImage"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const CombinePhotoLazy = dynamic(
  () => import("@/components/tools/CombinePhoto"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const ProfilePhotoMakerLazy = dynamic(
  () => import("@/components/tools/ProfilePhotoMaker"),
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

export const HeicToJpgLazy = dynamic(
  () => import("@/components/tools/HeicToJpg"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const WebpToJpgLazy = dynamic(
  () => import("@/components/tools/WebpToJpg"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const RemoveWatermarkLazy = dynamic(
  () => import("@/components/tools/RemoveWatermark"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const CleanupPictureLazy = dynamic(
  () => import("@/components/tools/CleanupPicture"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const RemoveObjectsLazy = dynamic(
  () => import("@/components/tools/RemoveObjects"),
  { ssr: false, loading: () => <ToolLoading /> },
);

export const RemovePersonLazy = dynamic(
  () => import("@/components/tools/RemovePerson"),
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

export const UrlToPdfLazy = dynamic(
  () => import("@/components/tools/UrlToPdf"),
  { ssr: false, loading: () => <ToolLoading /> },
);
