import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Stamp an image on every page",
    description:
      "Overlay a logo, signature, seal, or brand mark on your PDF with position, size, opacity, and rotation controls.",
  },
  {
    title: "Corner, center, or tiled",
    description:
      "Place the stamp in a corner or the center, or tile it diagonally across each page for a classic watermark look.",
  },
  {
    title: "Keeps PDF text selectable",
    description:
      "The original pages stay intact — only the image is drawn on top. Text, links, and layout are preserved.",
  },
  {
    title: "100% browser-based",
    description:
      "Stamping runs with pdf-lib in your browser. Your documents and images stay on your device — nothing is uploaded to Focera.",
  },
];

export default function PdfWatermarkLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-watermark-features"
        title="Everything you need in a free PDF watermark tool"
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
          Adding a watermark should be quick and private. Focera keeps the whole
          flow on one page — upload your PDF, choose a stamp image, set
          placement, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Add a stamp image.</strong> Use a PNG for transparent logos,
            or JPG/WebP. Set position, size, opacity, and optional diagonal
            rotation.
          </li>
          <li>
            <strong>Stamp and download.</strong> The image is drawn on every
            page locally. Preview the result and download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-watermark-tool">PDF watermark tool</a> anytime to
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
            <strong>Brand documents</strong> — Add your logo to proposals,
            reports, and pitch decks before sharing.
          </li>
          <li>
            <strong>Draft and confidential marks</strong> — Stamp a translucent
            “DRAFT” or “CONFIDENTIAL” graphic across pages.
          </li>
          <li>
            <strong>Signatures and seals</strong> — Place a signature PNG or
            company seal in a corner of contracts and letters.
          </li>
          <li>
            <strong>Proof and sample files</strong> — Tile a watermark so
            shared PDFs stay clearly marked as samples.
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
          Your PDF and stamp image are read and processed entirely in your
          browser. Focera does not receive the files, store pages, or run
          stamping on a remote server. When you leave the page, temporary
          previews are revoked and nothing remains on our infrastructure.
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
            into one file before or after watermarking.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages
            or ranges, then stamp only what you need.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink the
            watermarked file for email and uploads.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before adding a stamp.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert watermarked
            pages into JPEG images for sharing.
          </li>
          <li>
            <Link href="/background-remover">Background Remover</Link> — Cut
            out a logo on a transparent PNG before stamping.
          </li>
        </ul>
      </section>
    </article>
  );
}
