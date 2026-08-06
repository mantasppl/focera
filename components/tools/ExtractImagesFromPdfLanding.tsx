import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Pull embedded images",
    description:
      "Find the photos and graphics stored inside a PDF — not flattened page screenshots — then preview each one.",
  },
  {
    title: "Download one or all",
    description:
      "Save a single PNG, or grab a ZIP with every extracted image in one click.",
  },
  {
    title: "100% browser-based",
    description:
      "Extraction runs with PDF.js in your browser. Your document stays on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), extract, preview thumbnails, and download in a few clicks.",
  },
];

export default function ExtractImagesFromPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="extract-images-from-pdf-features"
        title="Everything you need in a free PDF image extractor"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="how-it-works"
      >
        <h2 id="how-it-works" className="tool-content__heading">
          How It Works
        </h2>
        <p>
          Pulling images out of a PDF should be quick and private. Focera keeps
          the whole flow on one page — upload, extract, preview, and download
          without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Extract images.</strong> Click Extract images. Focera scans
            each page for embedded image objects and decodes them locally to
            PNG.
          </li>
          <li>
            <strong>Preview and download.</strong> Browse thumbnails, download
            the active image, or grab a ZIP with every image found.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#extract-images-from-pdf-tool">PDF image extractor</a>{" "}
          anytime to process another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="use-cases"
      >
        <h2 id="use-cases" className="tool-content__heading">
          Popular Use Cases
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Reuse photos from reports</strong> — Pull figures and
            product shots out of a PDF for slides, blogs, or design tools.
          </li>
          <li>
            <strong>Archive graphics</strong> — Save logos, charts, and
            illustrations from brochures without screenshotting whole pages.
          </li>
          <li>
            <strong>Recover originals</strong> — When someone only sent a PDF,
            extract the embedded images instead of re-exporting from the source
            app.
          </li>
          <li>
            <strong>Prep for editing</strong> — Download PNGs, then refine them
            with{" "}
            <Link href="/background-remover">Background Remover</Link> or{" "}
            <Link href="/upscale-image">Upscale Image</Link>.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="privacy"
      >
        <h2 id="privacy" className="tool-content__heading">
          Private by Design
        </h2>
        <p>
          Your PDF is read and scanned entirely in your browser. Focera does not
          receive the file, store images, or run extraction on a remote server.
          When you leave the page, object URLs are revoked and nothing remains
          on our infrastructure.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related"
      >
        <h2 id="related" className="tool-content__heading">
          Related Tools
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/pdf-to-png">PDF to PNG</Link> — Rasterize full PDF pages
            to PNG when you need page screenshots, not embedded images.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG when you want smaller page images.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Turn images into a
            multi-page PDF (the reverse direction).
          </li>
          <li>
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract selectable
            text from a PDF to copy or download as .txt.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before pulling images.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut subjects from photos after you extract them.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Enlarge extracted
            images for sharper reuse.
          </li>
        </ul>
      </section>
    </article>
  );
}
