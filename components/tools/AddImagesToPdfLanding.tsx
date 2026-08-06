import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Insert images into any PDF",
    description:
      "Add PNG, JPG, or WebP photos as new pages in an existing PDF — append at the end, place at the start, or insert after a chosen page.",
  },
  {
    title: "Reorder before you save",
    description:
      "Queue up to 30 images, rearrange the list, and control Fit, A4, or Letter page sizes with optional margins.",
  },
  {
    title: "Keep the original pages intact",
    description:
      "Existing PDF content is copied as-is. Only the new image pages are created and inserted where you choose.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs with pdf-lib on your device. Your PDF and images never upload to Focera.",
  },
];

export default function AddImagesToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="add-images-to-pdf-features"
        title="Everything you need in a free add images to PDF tool"
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
          Adding photos or scans to a PDF should be quick and private. Focera
          keeps the whole flow on one page — upload your document and images,
          choose where they go, and download without an account or desktop
          installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Add your images.</strong> Drop PNG, JPG, or WebP files,
            reorder them, and pick insert position plus page size.
          </li>
          <li>
            <strong>Insert and download.</strong> New image pages are built
            locally and merged into your PDF. Preview the result and download
            again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#add-images-to-pdf-tool">add images tool</a> anytime to
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
            <strong>Photo appendices</strong> — Attach supporting photos to a
            report without rebuilding the whole PDF.
          </li>
          <li>
            <strong>Scanned extras</strong> — Insert receipts, IDs, or signed
            pages after a specific page in the packet.
          </li>
          <li>
            <strong>Cover images</strong> — Place a title graphic or cover photo
            at the start of an existing document.
          </li>
          <li>
            <strong>Mixed packs</strong> — Combine screenshots and slides into a
            shareable PDF while keeping the original pages.
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
          Your PDF and images are read and processed entirely in your browser.
          Focera does not receive the files, store pages, or run conversion on a
          remote server. When you leave the page, temporary previews are revoked
          and nothing remains on our infrastructure.
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
            <Link href="/png-to-pdf">PNG to PDF</Link> — Build a brand-new PDF
            from images when you do not already have a document.
          </li>
          <li>
            <Link href="/pdf-watermark">PDF Watermark</Link> — Stamp a logo or
            image onto existing pages instead of adding new ones.
          </li>
          <li>
            <Link href="/extract-images-from-pdf">Extract Images from PDF</Link>{" "}
            — Pull embedded pictures out of a PDF.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDF
            files into one.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages after inserting images.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink the updated
            file for email and uploads.
          </li>
        </ul>
      </section>
    </article>
  );
}
