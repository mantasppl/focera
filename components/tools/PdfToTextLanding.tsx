import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Pull text from PDFs",
    description:
      "Extract selectable text from contracts, reports, and ebooks into plain text you can copy or download as a .txt file.",
  },
  {
    title: "Page markers optional",
    description:
      "Keep a continuous flow of paragraphs, or insert page markers so you always know which page each section came from.",
  },
  {
    title: "100% browser-based",
    description:
      "Extraction uses PDF.js on your device. Your documents stay private — nothing uploads to Focera.",
  },
  {
    title: "Edit before you copy",
    description:
      "Fix spacing or cleanup in the result panel, then copy to the clipboard or download a plain-text file.",
  },
];

export default function PdfToTextLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-to-text-features"
        title="Everything you need in a free PDF text extractor"
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
          Getting text out of a PDF should be quick and private. Focera keeps
          the whole flow on one page — upload, choose a layout, extract, edit,
          and copy without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose output layout.</strong> Use Continuous for flowing
            paragraphs, or Page markers when you want clear breaks between
            pages.
          </li>
          <li>
            <strong>Extract, edit, and copy.</strong> Click Extract text.
            Processing runs in your browser. Review the result, then copy or
            download a .txt file.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-to-text-tool">PDF to text extractor</a> anytime to
          process another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="scanned"
      >
        <h2 id="scanned" className="tool-content__heading">
          Selectable Text vs Scanned PDFs
        </h2>
        <p>
          This tool reads text that already exists in the PDF (digital
          documents, exports from Word, and most reports). Image-only scans
          usually have no selectable text layer, so extraction may return
          empty pages.
        </p>
        <p>
          For scanned paperwork, convert pages with{" "}
          <Link href="/pdf-to-jpg">PDF to JPG</Link>, then run{" "}
          <Link href="/image-to-text">Image to Text</Link> OCR on the images.
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
            <strong>Reuse report content</strong> — Pull paragraphs from a PDF
            into notes, emails, or a new draft without retyping.
          </li>
          <li>
            <strong>Quote contracts and policies</strong> — Copy exact wording
            from a PDF into a reply or summary.
          </li>
          <li>
            <strong>Build plain-text archives</strong> — Download .txt copies
            for search, indexing, or lightweight storage.
          </li>
          <li>
            <strong>Prep content for other tools</strong> — Extract text before
            pasting into an editor or AI workflow, or use{" "}
            <Link href="/pdf-translator">PDF Translator</Link> for a full
            translation pass.
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
          Your PDF is read entirely in your browser. Focera does not receive
          the file, store pages, or run extraction on a remote server. When you
          leave the page, nothing remains on our infrastructure.
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
            <Link href="/pdf-translator">PDF Translator</Link> — Translate
            extracted PDF text into another language.
          </li>
          <li>
            <Link href="/pdf-to-epub">PDF to EPUB</Link> — Convert PDFs into
            reflowable .epub ebooks for e-readers.
          </li>
          <li>
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert PDFs into
            editable .docx documents.
          </li>
          <li>
            <Link href="/pdf-to-excel">PDF to Excel</Link> — Convert PDF tables
            and text into an .xlsx spreadsheet.
          </li>
          <li>
            <Link href="/word-to-pdf">Word to PDF</Link> — Convert .docx
            documents into A4 or Letter PDFs.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG images for sharing or OCR.
          </li>
          <li>
            <Link href="/image-to-text">Image to Text</Link> — OCR photos and
            screenshots into editable text.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before pulling text.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before extracting.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages
            or ranges before extracting.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document.
          </li>
        </ul>
      </section>
    </article>
  );
}
