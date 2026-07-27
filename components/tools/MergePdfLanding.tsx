import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Combine multiple PDFs",
    description:
      "Merge two or more PDF files into a single document while keeping original pages, text, and layout intact.",
  },
  {
    title: "Reorder before you merge",
    description:
      "Drag in files, then move them up or down so the final PDF follows the exact sequence you need.",
  },
  {
    title: "100% browser-based",
    description:
      "Merging runs with pdf-lib in your browser. Your documents stay on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Fast drag & drop workflow",
    description:
      "Drop several PDFs at once (up to 20 files), adjust order, merge, and download in a few clicks.",
  },
];

export default function MergePdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="merge-pdf-features"
        title="Everything you need in a free PDF merger"
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
          Combining PDFs should be quick and private. Focera keeps the whole
          flow on one page — upload, reorder, merge, and download without an
          account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDFs.</strong> Drag and drop two or more files
            (up to 25 MB each, 20 files total), or click the zone to browse from
            your device.
          </li>
          <li>
            <strong>Set the merge order.</strong> Use the up and down controls
            to arrange files. Remove any you do not want included.
          </li>
          <li>
            <strong>Merge and download.</strong> Click Merge PDFs. Pages are
            copied into one document locally, and the combined file downloads
            automatically.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#merge-pdf-tool">PDF merger</a> anytime to combine another
          set of files.
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
            <strong>Compile reports</strong> — Join chapter PDFs, cover pages,
            and appendices into one shareable file.
          </li>
          <li>
            <strong>Bundle contracts and forms</strong> — Combine signed pages,
            addenda, and supporting docs before sending.
          </li>
          <li>
            <strong>Assemble study packs</strong> — Merge lecture slides,
            worksheets, and notes into a single PDF.
          </li>
          <li>
            <strong>Prepare application packets</strong> — Stack resumes,
            portfolios, and certificates in a fixed order.
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
          Your PDFs are read and merged entirely in your browser. Focera does
          not receive the files, store pages, or run merging on a remote
          server. When you leave the page, nothing remains on our
          infrastructure.
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
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages,
            ranges, or fixed-size chunks before or after merging.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, delete,
            or extract pages before or after merging files.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink the merged
            file for email, uploads, and sharing.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert merged pages
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
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut subjects from photos when you need clean image assets.
          </li>
        </ul>
      </section>
    </article>
  );
}
