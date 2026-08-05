import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "PNG to PDF in seconds",
    description:
      "Turn one PNG — or a batch of images — into a shareable PDF without installing software or creating an account.",
  },
  {
    title: "Multi-page from many images",
    description:
      "Each image becomes a page. Reorder the list before converting so screenshots, scans, and receipts land in the right sequence.",
  },
  {
    title: "Fit, A4, or Letter",
    description:
      "Keep the page sized to the image, or place images on A4/Letter with optional margins for printing and archiving.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion embeds your images into a PDF on your device with pdf-lib. Nothing uploads to Focera.",
  },
];

export default function PngToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="png-to-pdf-features"
        title="Everything you need in a free PNG to PDF converter"
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
          Converting PNG images to PDF should be quick and private. Focera keeps
          the whole flow on one page — add images, set page size, convert, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your images.</strong> Drag and drop PNG, JPG, or WebP
            files (up to 10 MB each), or click the zone to browse. Add up to 30
            images per PDF.
          </li>
          <li>
            <strong>Choose page size.</strong> Use Fit so each page matches the
            image, or pick A4 / Letter with a margin for print-ready documents.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PDF. The
            file is built locally and downloads automatically — preview the
            first image in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#png-to-pdf-tool">PNG to PDF converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="transparency"
      >
        <h2 id="transparency" className="tool-content__heading">
          Does PNG Transparency Survive?
        </h2>
        <p>
          Yes. PNG transparency is preserved in the PDF when you convert PNG
          files. Transparent areas stay see-through in viewers that support it;
          some print workflows still composite onto white.
        </p>
        <p>
          JPG and WebP are also accepted. WebP is converted locally before
          embedding so the PDF stays compatible across readers.
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
            <strong>Screenshot packets</strong> — Combine UI captures into one
            PDF for bug reports or handoffs.
          </li>
          <li>
            <strong>Receipts and scans</strong> — Turn phone photos or PNGs into
            a single file for expense reports.
          </li>
          <li>
            <strong>Design reviews</strong> — Package mockups as a PDF clients
            can open without image editors.
          </li>
          <li>
            <strong>Print-ready pages</strong> — Place images on A4 or Letter
            with margins before sending to a printer.
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
          Your images are read and converted entirely in your browser. Focera
          does not receive the files, store pages, or run conversion on a remote
          server. When you leave the page, object URLs are revoked and nothing
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
            <Link href="/pdf-to-png">PDF to PNG</Link> — Convert PDF pages back
            into PNG images.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages back
            into JPEG images.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file after converting.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document.
          </li>
          <li>
            <Link href="/pdf-watermark">PDF Watermark</Link> — Add a text or
            image watermark before sharing.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink PNGs
            and JPGs before building a PDF.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut subjects from photos, then convert the PNG to PDF.
          </li>
          <li>
            <Link href="/word-to-pdf">Word to PDF</Link> — Convert .docx
            documents into A4 or Letter PDFs.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages or
            ranges after conversion.
          </li>
        </ul>
      </section>
    </article>
  );
}
