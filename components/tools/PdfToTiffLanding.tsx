import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Page or multipage TIFF",
    description:
      "Export each PDF page as a TIFF, grab a ZIP of every page, or download one multipage TIFF for scanning and archival workflows.",
  },
  {
    title: "Resolution controls",
    description:
      "Render at 1×, 1.5×, or 2× so page images match screen previews, docs, or print-ready sharpness.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion uses PDF.js and UTIF in your browser. Your documents stay on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), convert, preview thumbnails, and download in a few clicks.",
  },
];

export default function PdfToTiffLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-to-tiff-features"
        title="Everything you need in a free PDF to TIFF converter"
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
          Turning a PDF into TIFF images should be quick and private. Focera
          keeps the whole flow on one page — upload, choose resolution, convert,
          preview, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Set resolution.</strong> Choose 1×–2× render scale, then
            click Convert to TIFF. Each page is rendered locally to a canvas and
            encoded as TIFF.
          </li>
          <li>
            <strong>Preview and download.</strong> Browse page thumbnails,
            download the active page, save a multipage TIFF, or grab a ZIP with
            every page.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-to-tiff-tool">PDF to TIFF converter</a> anytime to
          process another file.
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
            <strong>Scan and archive workflows</strong> — Export PDF sheets as
            TIFF for document management systems that prefer .tif/.tiff.
          </li>
          <li>
            <strong>Print and prepress</strong> — Produce high-resolution page
            images at 2× for print proofs and layout checks.
          </li>
          <li>
            <strong>Multipage deliverables</strong> — Package every page into one
            multipage TIFF when a single file is required.
          </li>
          <li>
            <strong>Flatten forms and scans</strong> — Turn filled PDFs into
            simple TIFF files that open in imaging and OCR tools.
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
          Your PDF is read and rendered entirely in your browser. Focera does
          not receive the file, store pages, or run conversion on a remote
          server. When you leave the page, object URLs are revoked and nothing
          remains on our infrastructure.
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
            <Link href="/tiff-to-pdf">TIFF to PDF</Link> — Convert TIFF scans
            back into a multi-page PDF (the reverse of PDF to TIFF).
          </li>
          <li>
            <Link href="/jpg-to-tiff">JPG to TIFF</Link> — Convert JPEG photos
            into uncompressed .tif / .tiff files.
          </li>
          <li>
            <Link href="/tiff-to-jpg">TIFF to JPG</Link> — Convert .tif / .tiff
            files into standard JPEG images for sharing and uploads.
          </li>
          <li>
            <Link href="/pdf-to-png">PDF to PNG</Link> — Convert PDF pages to
            lossless PNG images for the web and design tools.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG when you need smaller image files.
          </li>
          <li>
            <Link href="/extract-images-from-pdf">Extract Images from PDF</Link>{" "}
            — Download embedded photos and graphics from a PDF (not full-page
            screenshots).
          </li>
          <li>
            <Link href="/image-to-pdf">Image to PDF</Link> — Turn images into a
            multi-page PDF.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before converting them to images.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before converting pages to TIFF.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages or
            ranges before converting.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document, not images.
          </li>
        </ul>
      </section>
    </article>
  );
}
