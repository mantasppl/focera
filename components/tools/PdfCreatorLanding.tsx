import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Create a PDF from scratch",
    description:
      "Type a title and body text — or make blank pages — then download a clean PDF without installing software.",
  },
  {
    title: "A4 or Letter, portrait or landscape",
    description:
      "Pick the page size and orientation that fits reports, notes, printouts, or forms before you generate the file.",
  },
  {
    title: "Text that flows across pages",
    description:
      "Longer writing wraps and paginates automatically. Add extra blank pages at the end when you need room to print or fill by hand.",
  },
  {
    title: "100% browser-based",
    description:
      "Your document is built locally with jsPDF. Nothing is uploaded to Focera — private by default.",
  },
];

export default function PdfCreatorLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-creator-features"
        title="Everything you need in a free PDF creator"
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
          Making a new PDF should be quick and private. Focera keeps the whole
          flow on one page — write, set layout, create, and download without an
          account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Add your content.</strong> Enter an optional title and body
            text, or leave both empty and set blank pages to create an empty
            document.
          </li>
          <li>
            <strong>Choose layout.</strong> Pick A4 or Letter, portrait or
            landscape, set a filename, and add extra blank pages if you need
            them.
          </li>
          <li>
            <strong>Create and download.</strong> Click Create PDF. The file is
            built in your browser and is ready to download — create again
            anytime after edits.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-creator-tool">PDF creator</a> anytime to make another
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
            <strong>Quick notes and handouts</strong> — Draft a short document
            and share it as a PDF without opening a word processor.
          </li>
          <li>
            <strong>Blank printable pages</strong> — Generate empty A4 or Letter
            sheets for forms, sketches, or offline writing.
          </li>
          <li>
            <strong>Simple cover pages</strong> — Add a title plus a short intro,
            then merge with other PDFs later.
          </li>
          <li>
            <strong>Private drafts</strong> — Create files entirely on your
            device when you do not want cloud editors.
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
          Your title, body text, and generated PDF stay in the browser. Focera
          does not receive the content, store drafts on a server, or process
          documents remotely. When you leave the page, temporary results are
          discarded.
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
            <Link href="/png-to-pdf">PNG to PDF</Link> — Turn PNG, JPG, or WebP
            images into a multi-page PDF.
          </li>
          <li>
            <Link href="/word-to-pdf">Word to PDF</Link> — Convert a Word
            document into a PDF.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine the file you
            created with other PDFs.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate,
            duplicate, or insert blank pages in an existing PDF.
          </li>
          <li>
            <Link href="/invoice-generator">Invoice Generator</Link> — Build a
            professional invoice PDF with line items and VAT.
          </li>
          <li>
            <Link href="/url-to-pdf">URL to PDF</Link> — Capture a webpage as a
            PDF.
          </li>
          <li>
            <Link href="/esign-pdf">eSign PDF</Link> — Add a typed, drawn, or
            uploaded signature to your new PDF.
          </li>
        </ul>
      </section>
    </article>
  );
}
