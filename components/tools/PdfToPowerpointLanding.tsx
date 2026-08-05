import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Real PowerPoint (.pptx) output",
    description:
      "Turn PDF pages into a presentation you can open in Microsoft PowerPoint, Google Slides, or LibreOffice Impress.",
  },
  {
    title: "Exact page mode",
    description:
      "For scans and design-heavy PDFs, embed each page as an image so every slide matches what you see.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion uses PDF.js and builds the PPTX on your device. Your documents stay private — nothing uploads to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), pick a mode, convert, preview a text summary, and download in a few clicks.",
  },
];

export default function PdfToPowerpointLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-to-powerpoint-features"
        title="Everything you need in a free PDF to PowerPoint converter"
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
          Turning a PDF into a PowerPoint deck should be quick and private.
          Focera keeps the whole flow on one page — upload, choose a mode,
          convert, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose conversion mode.</strong> Use Editable text for
            documents with selectable text, or Exact pages when you need a
            visual match for scanned or design-heavy PDFs.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PowerPoint.
            A .pptx file is built locally and downloads automatically — preview
            the extracted summary in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-to-powerpoint-tool">PDF to PowerPoint converter</a>{" "}
          anytime to process another file.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="modes">
        <h2 id="modes" className="tool-content__heading">
          Editable Text vs Exact Pages
        </h2>
        <p>
          <strong>Editable text</strong> reads text from each PDF page and
          places it on a matching slide. You can edit wording in PowerPoint or
          Google Slides. Complex columns, tables, and graphics are flattened
          into flowing text.
        </p>
        <p>
          <strong>Exact pages</strong> renders each PDF page as an image and
          places it on a widescreen slide. The look stays faithful, but text
          inside images is not editable. Use this for scans, certificates, and
          design-heavy pages.
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
            <strong>Repurpose PDF reports</strong> — Convert a report into
            slides you can present and annotate in a meeting.
          </li>
          <li>
            <strong>Build decks from handouts</strong> — Turn a PDF handout into
            editable slides for workshops or training.
          </li>
          <li>
            <strong>Archive scans as PPTX</strong> — Keep a visual PowerPoint
            copy of scanned pages without a desktop suite.
          </li>
          <li>
            <strong>Share with collaborators</strong> — Send a .pptx when
            teammates prefer PowerPoint or Google Slides over PDF markup.
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
          Your PDF is read and converted entirely in your browser. Focera does
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
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert PDFs into
            editable .docx documents.
          </li>
          <li>
            <Link href="/pdf-to-excel">PDF to Excel</Link> — Convert PDF tables
            and text into an .xlsx spreadsheet.
          </li>
          <li>
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract plain text
            from a PDF to copy or download as .txt.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG images for sharing and design tools.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before converting to PowerPoint.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before converting.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages or
            ranges before converting.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document.
          </li>
          <li>
            <Link href="/image-to-text">Image to Text</Link> — OCR photos and
            screenshots into editable text.
          </li>
          <li>
            <Link href="/powerpoint-to-pdf">PowerPoint to PDF</Link> — Convert
            .pptx decks into landscape PDFs.
          </li>
          <li>
            <Link href="/word-to-pdf">Word to PDF</Link> — Convert .docx
            documents into A4 or Letter PDFs.
          </li>
        </ul>
      </section>
    </article>
  );
}
