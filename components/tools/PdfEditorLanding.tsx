import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Visual page workspace",
    description:
      "See every page as a live thumbnail grid. Select, drag to reorder, and shape the document the way desktop editors do — without installing software.",
  },
  {
    title: "Rotate, duplicate, delete",
    description:
      "Fix sideways scans, remove cover sheets, or copy pages in one click. Multi-select with Ctrl or Cmd for batch actions.",
  },
  {
    title: "Extract or download",
    description:
      "Pull selected pages into a new PDF, or download the full edited file. Layout, text, and vectors stay real PDF pages — not flat images.",
  },
  {
    title: "Private & free",
    description:
      "Editing runs with pdf-lib and PDF.js in your browser. No account, no watermark, and your files never upload to Focera.",
  },
];

export default function PdfEditorLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-editor-features"
        title="A free PDF editor that feels premium"
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
          Focera’s PDF editor keeps the workflow on one page — open a file,
          rearrange pages visually, apply edits, and download. Everything stays
          on your device.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload a PDF.</strong> Drag and drop a file (up to 25 MB
            and 50 pages), or click the zone to browse.
          </li>
          <li>
            <strong>Edit pages.</strong> Select pages, then rotate, duplicate,
            delete, insert a blank page, or drag cards to change order.
          </li>
          <li>
            <strong>Download or extract.</strong> Save the full edited PDF, or
            extract only the pages you selected into a separate file.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-editor-tool">PDF editor</a> anytime to open another
          document.
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
            <strong>Fix scanned packets</strong> — Rotate sideways pages and
            remove blank or duplicate sheets before sharing.
          </li>
          <li>
            <strong>Trim long decks</strong> — Delete filler slides and export a
            shorter PDF for email or print.
          </li>
          <li>
            <strong>Build a clean extract</strong> — Select key pages and
            download them as a focused attachment.
          </li>
          <li>
            <strong>Prep forms and packets</strong> — Insert blank pages where
            you need room for notes or signatures.
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
          Your PDF is read and rewritten entirely in your browser. Focera does
          not receive the file, store pages, or run editing on a remote server.
          When you leave the page, nothing remains on our infrastructure.
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
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before or after editing pages.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink edited PDFs
            for email, uploads, and sharing.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert edited pages
            into JPEG images for sharing and design tools.
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
