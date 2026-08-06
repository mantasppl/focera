import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Drag-and-drop reorder",
    description:
      "Preview every page as a thumbnail, then drag pages into the order you want — or nudge a selected page with ↑ / ↓.",
  },
  {
    title: "Keeps real PDF pages",
    description:
      "Pages are copied with pdf-lib in your new sequence, so text, vectors, and layout stay intact — not flattened into images.",
  },
  {
    title: "100% browser-based",
    description:
      "Rearranging runs entirely in your browser. Your document stays on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Fast download",
    description:
      "Drop a PDF up to 25 MB (50 pages), rearrange the pages, and download a clean file in a few clicks.",
  },
];

export default function RearrangePdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="rearrange-pdf-features"
        title="Everything you need in a free PDF page rearranger"
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
          Putting pages in the right order should be quick and private. Focera
          keeps the whole flow on one page — upload, rearrange, and download
          without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Rearrange the pages.</strong> Drag thumbnails into place, or
            select a page and move it with ↑ / ↓. Reset order anytime.
          </li>
          <li>
            <strong>Download the new PDF.</strong> Get a file with pages in your
            chosen sequence. Change the order again and download as needed.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#rearrange-pdf-tool">PDF page rearranger</a> anytime to
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
            <strong>Fix scanned packets</strong> — Put mis-ordered scan pages
            back into reading order before filing.
          </li>
          <li>
            <strong>Move cover pages</strong> — Bring a title sheet to the front
            or shift appendices to the end.
          </li>
          <li>
            <strong>Prepare presentations</strong> — Reorder slide handouts or
            export pages without rebuilding the file.
          </li>
          <li>
            <strong>Organize contracts</strong> — Arrange exhibits and signature
            pages in the sequence your recipient expects.
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
          not receive the file, store pages, or rearrange on a remote server.
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
            <Link href="/rotate-pdf">Rotate PDF</Link> — Turn sideways or
            upside-down pages left, right, or 180°.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate,
            duplicate, or extract pages with a full visual workspace.
          </li>
          <li>
            <Link href="/delete-pdf-pages">Delete PDF Pages</Link> — Remove
            unwanted pages before or after rearranging.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs,
            then arrange the combined page order.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into separate
            files by page, range, or fixed chunks.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink the
            rearranged file for email, uploads, and sharing.
          </li>
          <li>
            <Link href="/crop-pdf">Crop PDF</Link> — Trim margins on pages after
            you set the order.
          </li>
        </ul>
      </section>
    </article>
  );
}
