import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Split any way you need",
    description:
      "Break a PDF into every page, custom page ranges, or fixed-size chunks — then download one file or a ZIP.",
  },
  {
    title: "Keeps real PDF pages",
    description:
      "Pages are copied with pdf-lib, so text, vectors, and layout stay intact. This is not a print-to-image split.",
  },
  {
    title: "100% browser-based",
    description:
      "Splitting runs entirely in your browser. Your documents stay on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), choose a mode, split, and download in a few clicks.",
  },
];

export default function SplitPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="split-pdf-features"
        title="Everything you need in a free PDF splitter"
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
          Splitting a PDF should be quick and private. Focera keeps the whole
          flow on one page — upload, pick a split mode, process, and download
          without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose how to split.</strong> Use every page for single-page
            files, page ranges like 1-3, 5, or fixed chunks of N pages each.
          </li>
          <li>
            <strong>Split and download.</strong> One output becomes a PDF;
            multiple outputs download as a ZIP. Split again with a different
            mode anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#split-pdf-tool">PDF splitter</a> anytime to process another
          file.
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
            <strong>Extract chapters or sections</strong> — Pull page ranges
            into separate PDFs for sharing or review.
          </li>
          <li>
            <strong>One page per file</strong> — Split scanned packets into
            individual pages for forms, tickets, or uploads.
          </li>
          <li>
            <strong>Even chunks for email</strong> — Break long reports into
            smaller multi-page PDFs that fit attachment limits.
          </li>
          <li>
            <strong>Prepare pages for editing</strong> — Isolate the pages you
            need before merging, compressing, or converting to JPG.
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
          Your PDF is read and split entirely in your browser. Focera does not
          receive the file, store pages, or run splitting on a remote server.
          When you leave the page, temporary results are discarded and nothing
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
            <Link href="/merge-pdf">Merge PDF</Link> — Combine split files or
            other PDFs back into one document.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, delete,
            or extract pages with a visual workspace.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink split files
            for email, uploads, and sharing.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert pages into JPEG
            images for sharing and design tools.
          </li>
          <li>
            <Link href="/invoice-generator">Invoice Generator</Link> — Create
            professional invoices and download them as PDF.
          </li>
        </ul>
      </section>
    </article>
  );
}
