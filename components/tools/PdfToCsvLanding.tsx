import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "CSV ready for any spreadsheet",
    description:
      "Export PDF tables as .csv files you can open in Excel, Google Sheets, Numbers, LibreOffice, or import into databases and scripts.",
  },
  {
    title: "Table-aware extraction",
    description:
      "Detect columns from horizontal gaps so invoices, reports, and tabular PDFs land in separate CSV fields.",
  },
  {
    title: "100% browser-based",
    description:
      "Extraction uses PDF.js and builds the CSV on your device. Your documents stay private — nothing uploads to Focera.",
  },
  {
    title: "Flexible output",
    description:
      "Download one combined CSV or a ZIP with a CSV per PDF page. Drop files up to 25 MB (50 pages).",
  },
];

export default function PdfToCsvLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-to-csv-features"
        title="Everything you need in a free PDF to CSV converter"
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
          Extracting tables from a PDF into CSV should be quick and private.
          Focera keeps the whole flow on one page — upload, choose layout
          options, convert, and download without an account or desktop
          installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose layout options.</strong> Use Detect tables to split
            columns by spacing, or One column for line-by-line rows. Pick one
            CSV or a CSV per page (ZIP).
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to CSV. A .csv
            (or ZIP) is built locally and downloads automatically — preview a
            sample of the rows in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-to-csv-tool">PDF to CSV converter</a> anytime to process
          another file.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="modes">
        <h2 id="modes" className="tool-content__heading">
          Detect Tables vs One Column
        </h2>
        <p>
          <strong>Detect tables</strong> looks at horizontal gaps between text
          pieces on each line and maps them into CSV columns. It works best on
          reports, invoices, and PDFs that already look tabular.
        </p>
        <p>
          <strong>One column</strong> puts each text line into a single field.
          Use this for prose-heavy PDFs, or when auto column detection splits
          content too aggressively.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="use-cases">
        <h2 id="use-cases" className="tool-content__heading">
          Popular Use Cases
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Import report tables</strong> — Move PDF totals and line
            items into CSV for scripts, BI tools, or databases.
          </li>
          <li>
            <strong>Reconcile invoices</strong> — Pull amounts and descriptions
            into a flat file you can filter and share.
          </li>
          <li>
            <strong>Reuse statement data</strong> — Convert bank or account
            statements into rows for analysis.
          </li>
          <li>
            <strong>Archive lists as CSV</strong> — Keep a portable copy of PDF
            directories, schedules, or inventories.
          </li>
        </ul>
      </section>

      <section className="tool-content__section" aria-labelledby="privacy">
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

      <section className="tool-content__section" aria-labelledby="related">
        <h2 id="related" className="tool-content__heading">
          Related Tools
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/pdf-to-excel">PDF to Excel</Link> — Extract tables into
            an .xlsx workbook with worksheets.
          </li>
          <li>
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert PDFs into
            editable .docx documents.
          </li>
          <li>
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract plain text
            from a PDF to copy or download as .txt.
          </li>
          <li>
            <Link href="/pdf-to-powerpoint">PDF to PowerPoint</Link> — Convert
            PDF pages into editable or visual .pptx slides.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG images for sharing and design tools.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before converting to CSV.
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
            <Link href="/image-to-text">Image to Text</Link> — OCR photos and
            screenshots into editable text.
          </li>
        </ul>
      </section>
    </article>
  );
}
