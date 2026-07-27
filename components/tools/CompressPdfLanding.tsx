import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Shrink PDF file size",
    description:
      "Reduce large PDFs for email, uploads, and sharing with Extreme, Strong, Balanced, or Light compression.",
  },
  {
    title: "Clear size comparison",
    description:
      "See original vs compressed size and savings percent right after processing so you can pick the right level.",
  },
  {
    title: "100% browser-based",
    description:
      "Compression uses PDF.js and pdf-lib in your browser. Your documents stay on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), choose a level, compress, preview, and download in a few clicks.",
  },
];

export default function CompressPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="compress-pdf-features"
        title="Everything you need in a free PDF compressor"
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
          Shrinking a PDF should be quick and private. Focera keeps the whole
          flow on one page — upload, choose a compression level, compress, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Pick a compression level.</strong> Extreme and Strong save
            the most space; Balanced is a solid default; Light keeps more
            detail.
          </li>
          <li>
            <strong>Compress and download.</strong> Pages are re-encoded
            locally into a smaller PDF. Compare sizes, preview the result, and
            download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#compress-pdf-tool">PDF compressor</a> anytime to process
          another file.
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
            <strong>Email attachments</strong> — Shrink scanned contracts or
            reports so they fit mailbox limits.
          </li>
          <li>
            <strong>Form and portal uploads</strong> — Meet file-size caps on
            job apps, banking portals, and government sites.
          </li>
          <li>
            <strong>Share on chat and cloud</strong> — Send lighter PDFs over
            Slack, WhatsApp, Drive, or Dropbox.
          </li>
          <li>
            <strong>Archive bulky scans</strong> — Recompress image-heavy PDFs
            before long-term storage.
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
          Your PDF is read and compressed entirely in your browser. Focera does
          not receive the file, store pages, or run compression on a remote
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
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before or after compressing.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages,
            ranges, or fixed-size chunks before compressing.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before compressing the result.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert pages into JPEG
            images for sharing and design tools.
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
