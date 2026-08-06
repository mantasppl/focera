import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Number every page",
    description:
      "Add page numbers to your PDF with position, format, start number, and font size controls — then download instantly.",
  },
  {
    title: "Header or footer placement",
    description:
      "Place numbers at the bottom or top, centered or in a corner, so they match your document style.",
  },
  {
    title: "Flexible formats",
    description:
      "Use a plain number, 1 / N, Page 1, or Page 1 of N. Start from any number when continuing a longer document.",
  },
  {
    title: "100% browser-based",
    description:
      "Numbering runs with pdf-lib in your browser. Your documents stay on your device — nothing is uploaded to Focera.",
  },
];

export default function AddPageNumbersToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="add-page-numbers-to-pdf-features"
        title="Everything you need in a free PDF page number tool"
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
          Adding page numbers should be quick and private. Focera keeps the
          whole flow on one page — upload your PDF, choose placement and format,
          and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose numbering options.</strong> Pick position, format,
            start number, and font size to match your document.
          </li>
          <li>
            <strong>Number and download.</strong> Page numbers are drawn on
            every page locally. Preview the result and download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#add-page-numbers-to-pdf-tool">page numbers tool</a> anytime
          to process another file.
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
            <strong>Reports and proposals</strong> — Add clear page numbers
            before sharing with clients or teammates.
          </li>
          <li>
            <strong>Print-ready packets</strong> — Number scanned handouts and
            meeting packets so pages stay in order.
          </li>
          <li>
            <strong>Multi-part documents</strong> — Start numbering at page 5
            (or any number) when appending to an existing sequence.
          </li>
          <li>
            <strong>Contracts and forms</strong> — Place footer numbers so
            signed copies are easy to reference.
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
          Your PDF is read and processed entirely in your browser. Focera does
          not receive the file, store pages, or run numbering on a remote
          server. When you leave the page, temporary previews are revoked and
          nothing remains on our infrastructure.
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
            <Link href="/add-text-to-pdf">Add Text to PDF</Link> — Place custom
            labels or notes on selected pages.
          </li>
          <li>
            <Link href="/pdf-watermark">PDF Watermark</Link> — Stamp a logo or
            mark on every page alongside numbers.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before numbering.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages
            or ranges, then number only what you need.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink the
            numbered file for email and uploads.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before adding numbers.
          </li>
          <li>
            <Link href="/crop-pdf">Crop PDF</Link> — Trim margins so page
            numbers sit cleanly on the page.
          </li>
        </ul>
      </section>
    </article>
  );
}
