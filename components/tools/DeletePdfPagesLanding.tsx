import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Visual page picker",
    description:
      "Preview every page as a thumbnail, click the ones to remove, or enter ranges like 2, 4-6 for faster selection.",
  },
  {
    title: "Keeps real PDF pages",
    description:
      "Remaining pages are copied with pdf-lib, so text, vectors, and layout stay intact — not flattened into images.",
  },
  {
    title: "100% browser-based",
    description:
      "Deletion runs entirely in your browser. Your document stays on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Fast download",
    description:
      "Drop a PDF up to 25 MB (50 pages), mark pages to delete, and download a clean file in a few clicks.",
  },
];

export default function DeletePdfPagesLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="delete-pdf-pages-features"
        title="Everything you need in a free PDF page deleter"
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
          Removing unwanted pages should be quick and private. Focera keeps the
          whole flow on one page — upload, select, delete, and download without
          an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Select pages to delete.</strong> Click thumbnails to toggle
            them, hold Shift for a range, or enter page numbers like 2, 4-6.
          </li>
          <li>
            <strong>Delete and download.</strong> Get a new PDF with only the
            pages you kept. Select a different set and download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#delete-pdf-pages-tool">PDF page deleter</a> anytime to
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
            <strong>Remove cover pages or blanks</strong> — Drop intro sheets,
            blank scans, or trailing empties before sharing.
          </li>
          <li>
            <strong>Strip sensitive pages</strong> — Delete pages with personal
            data before emailing or uploading a packet.
          </li>
          <li>
            <strong>Trim exports</strong> — Cut unused appendix pages from
            reports, invoices, or slide handouts.
          </li>
          <li>
            <strong>Clean scanned packets</strong> — Remove mis-scans and keep
            only the pages you need for filing.
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
          not receive the file, store pages, or run deletion on a remote server.
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
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate,
            duplicate, or extract pages with a full visual workspace.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into separate
            files by page, range, or fixed chunks.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine remaining pages
            with other PDFs into one document.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink the cleaned
            file for email, uploads, and sharing.
          </li>
          <li>
            <Link href="/crop-pdf">Crop PDF</Link> — Trim margins on the pages
            you kept.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert remaining pages
            into JPEG images.
          </li>
        </ul>
      </section>
    </article>
  );
}
