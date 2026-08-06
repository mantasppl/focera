import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Page-by-page JPG export",
    description:
      "Every PDF page becomes a clear JPEG you can preview, download singly, or save together as a ZIP.",
  },
  {
    title: "Quality and resolution controls",
    description:
      "Pick smaller, balanced, or high JPEG quality and 1×–2× rendering so files match web, email, or print needs.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion uses PDF.js in your browser. Your documents stay on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), convert, preview thumbnails, and download in a few clicks.",
  },
];

export default function PdfToJpgLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-to-jpg-features"
        title="Everything you need in a free PDF to JPG converter"
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
          Turning a PDF into JPG images should be quick and private. Focera
          keeps the whole flow on one page — upload, choose quality, convert,
          preview, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Set quality and resolution.</strong> Choose JPEG quality and
            render scale, then click Convert to JPG. Each page is rendered
            locally to a canvas and encoded as JPEG.
          </li>
          <li>
            <strong>Preview and download.</strong> Browse page thumbnails,
            download the active page, or grab a ZIP with every JPG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-to-jpg-tool">PDF to JPG converter</a> anytime to process
          another file.
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
            <strong>Share slides as images</strong> — Convert pitch decks or
            handouts into JPGs for chat apps and social posts.
          </li>
          <li>
            <strong>Extract page previews</strong> — Grab cover pages or
            specific sheets for blogs, listings, and portfolios.
          </li>
          <li>
            <strong>Flatten forms and scans</strong> — Turn filled PDFs into
            simple image files that open everywhere.
          </li>
          <li>
            <strong>Prepare assets for design tools</strong> — Import page JPGs
            into Canva, Figma, or slide software when PDF import is awkward.
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
            <Link href="/extract-images-from-pdf">Extract Images from PDF</Link>{" "}
            — Download embedded photos and graphics from a PDF (not full-page
            screenshots).
          </li>
          <li>
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract selectable
            text from a PDF to copy or download as .txt.
          </li>
          <li>
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert PDF pages
            into an editable Word (.docx) document.
          </li>
          <li>
            <Link href="/pdf-to-excel">PDF to Excel</Link> — Convert PDF tables
            and text into an .xlsx spreadsheet.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before converting them to images.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before converting pages to images.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages or
            ranges before converting.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document, not images.
          </li>
          <li>
            <Link href="/pdf-to-png">PDF to PNG</Link> — Convert PDF pages to
            lossless PNG images instead of JPEG.
          </li>
          <li>
            <Link href="/pdf-to-tiff">PDF to TIFF</Link> — Convert PDF pages to
            TIFF for scanning, archival, and multipage .tiff files.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Turn images into a
            multi-page PDF (the reverse of PDF to JPG).
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut subjects from photos after you export page images.
          </li>
          <li>
            <Link href="/invoice-generator">Invoice Generator</Link> — Create
            professional invoices and download them as PDF.
          </li>
          <li>
            <Link href="/markdown-editor">Markdown Editor</Link> — Write docs
            with live preview and export to PDF.
          </li>
        </ul>
      </section>
    </article>
  );
}
