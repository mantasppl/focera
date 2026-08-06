import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "TIFF to PDF in seconds",
    description:
      "Turn one TIFF — or a batch of scans — into a shareable PDF without installing software or creating an account.",
  },
  {
    title: "Multi-page TIFF support",
    description:
      "Each page inside a multi-page TIFF becomes a PDF page. Upload several files and reorder them before converting.",
  },
  {
    title: "Fit, A4, or Letter",
    description:
      "Keep the page sized to the image, or place pages on A4/Letter with optional margins for printing and archiving.",
  },
  {
    title: "100% browser-based",
    description:
      "Decoding and PDF creation run on your device. Nothing uploads to Focera.",
  },
];

export default function TiffToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="tiff-to-pdf-features"
        title="Everything you need in a free TIFF to PDF converter"
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
          Converting TIFF scans to PDF should be quick and private. Focera keeps
          the whole flow on one page — add files, set page size, convert, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your TIFF files.</strong> Drag and drop .tif or
            .tiff images (up to 10 MB each), or click the zone to browse. Add up
            to 30 files per conversion.
          </li>
          <li>
            <strong>Choose page size.</strong> Use Fit so each page matches the
            image, or pick A4 / Letter with a margin for print-ready documents.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PDF. Pages
            are decoded locally and the PDF downloads automatically — preview
            the first page in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#tiff-to-pdf-tool">TIFF to PDF converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="multipage"
      >
        <h2 id="multipage" className="tool-content__heading">
          Do Multi-Page TIFFs Work?
        </h2>
        <p>
          Yes. Scanner and archival TIFFs often store several pages in one file.
          Focera reads each page and adds it to the PDF in order. Thumbnail
          previews embedded in the TIFF are skipped so you only get full-size
          pages.
        </p>
        <p>
          You can also combine several single-page TIFFs into one PDF — reorder
          the list before converting so pages land in the right sequence.
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
            <strong>Scanner exports</strong> — Convert multipage office scans
            into a PDF colleagues can open anywhere.
          </li>
          <li>
            <strong>Archival documents</strong> — Package TIFF records for email
            and cloud storage without losing page order.
          </li>
          <li>
            <strong>Fax and legal packets</strong> — Turn TIFF fax files into a
            standard PDF for filing and sharing.
          </li>
          <li>
            <strong>Print-ready pages</strong> — Place TIFF pages on A4 or
            Letter with margins before sending to a printer.
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
          Your TIFF files are decoded and converted entirely in your browser.
          Focera does not receive the files, store pages, or run conversion on a
          remote server. When you leave the page, object URLs are revoked and
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
            <Link href="/image-to-pdf">Image to PDF</Link> — Convert PNG, JPG,
            or WebP photos into a multi-page PDF.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Turn PNG images into a
            PDF with the same Fit / A4 / Letter options.
          </li>
          <li>
            <Link href="/pdf-to-tiff">PDF to TIFF</Link> — Convert PDF pages
            back into TIFF images (the reverse of TIFF to PDF).
          </li>
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
            <Link href="/add-images-to-pdf">Add Images to PDF</Link> — Insert
            image pages into an existing PDF.
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
