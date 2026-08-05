import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Editable Word output",
    description:
      "Extract text from PDFs into a real .docx you can open in Microsoft Word, Google Docs, or LibreOffice.",
  },
  {
    title: "Exact page mode",
    description:
      "For scans and complex layouts, embed each page as an image so the Word file matches what you see.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion uses PDF.js and builds the DOCX on your device. Your documents stay private — nothing uploads to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), pick a mode, convert, preview a text summary, and download in a few clicks.",
  },
];

export default function PdfToWordLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-to-word-features"
        title="Everything you need in a free PDF to Word converter"
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
          Turning a PDF into an editable Word document should be quick and
          private. Focera keeps the whole flow on one page — upload, choose a
          mode, convert, and download without an account or desktop installer.
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
            <strong>Convert and download.</strong> Click Convert to Word. A
            .docx file is built locally and downloads automatically — preview
            the extracted summary in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-to-word-tool">PDF to Word converter</a> anytime to
          process another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="modes"
      >
        <h2 id="modes" className="tool-content__heading">
          Editable Text vs Exact Pages
        </h2>
        <p>
          <strong>Editable text</strong> reads text from the PDF and rebuilds
          paragraphs in Word. You can copy, edit, and restyle the content. Layout
          may differ from the original — complex columns, tables, and graphics
          are flattened into flowing text.
        </p>
        <p>
          <strong>Exact pages</strong> renders each PDF page as an image and
          places it in the Word document. The look stays faithful, but text
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
            <strong>Edit contracts and proposals</strong> — Convert a PDF draft
            into Word so you can revise wording and track changes.
          </li>
          <li>
            <strong>Reuse report content</strong> — Pull paragraphs from a PDF
            report into a new memo or presentation outline.
          </li>
          <li>
            <strong>Archive scans as DOCX</strong> — Keep a visual Word copy of
            scanned paperwork without a desktop OCR suite.
          </li>
          <li>
            <strong>Share with collaborators</strong> — Send a .docx when
            teammates prefer Word over PDF markup tools.
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
            <Link href="/word-to-pdf">Word to PDF</Link> — Convert .docx
            documents into A4 or Letter PDFs.
          </li>
          <li>
            <Link href="/pdf-to-excel">PDF to Excel</Link> — Convert PDF tables
            and text into an .xlsx spreadsheet.
          </li>
          <li>
            <Link href="/pdf-to-powerpoint">PDF to PowerPoint</Link> — Convert
            PDF pages into editable or visual .pptx slides.
          </li>
          <li>
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract plain text
            from a PDF to copy or download as .txt.
          </li>
          <li>
            <Link href="/pdf-to-epub">PDF to EPUB</Link> — Convert PDFs into
            reflowable .epub ebooks for e-readers.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG images for sharing and design tools.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before converting to Word.
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
            <Link href="/markdown-editor">Markdown Editor</Link> — Write docs
            with live preview and export to PDF.
          </li>
        </ul>
      </section>
    </article>
  );
}
