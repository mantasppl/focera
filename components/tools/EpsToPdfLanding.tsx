import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "EPS to PDF in the browser",
    description:
      "Convert Encapsulated PostScript artwork to a shareable PDF without installing Ghostscript or creating an account.",
  },
  {
    title: "Crop, A4, or Letter",
    description:
      "Keep the page sized to the EPS bounding box, or fit the artwork onto A4 or US Letter for print and email.",
  },
  {
    title: "Private by design",
    description:
      "Your EPS stays on your device. Conversion runs locally after the converter engine loads in your browser.",
  },
  {
    title: "Designer-friendly workflow",
    description:
      "Drop a .eps export from Illustrator or similar tools, convert, and download a PDF ready to send or archive.",
  },
];

export default function EpsToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="eps-to-pdf-features"
        title="Everything you need in a free EPS to PDF converter"
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
          Converting EPS to PDF should be quick and private. Focera keeps the
          whole flow on one page — upload a .eps file, choose page sizing,
          convert, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your EPS file.</strong> Drag and drop a .eps or
            .epsf file up to 25 MB, or click the zone to browse from your
            device.
          </li>
          <li>
            <strong>Choose page size.</strong> Use Crop so the PDF matches the
            EPS bounding box, or fit the artwork on A4 / Letter.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PDF. The
            first run loads the converter engine once; then the PDF builds
            locally and downloads automatically.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#eps-to-pdf-tool">EPS to PDF converter</a> anytime to
          process another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="what-is-eps"
      >
        <h2 id="what-is-eps" className="tool-content__heading">
          What Is an EPS File?
        </h2>
        <p>
          EPS (Encapsulated PostScript) is a vector graphics format often used
          for logos, illustrations, and print-ready artwork. Many apps still
          export EPS, but PDF is easier to open, email, and archive. This tool
          turns EPS into a standard PDF using a local PostScript engine in your
          browser.
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
            <strong>Logo handoff</strong> — Convert brand EPS files so clients
            can open them without Illustrator.
          </li>
          <li>
            <strong>Print prep</strong> — Fit artwork onto A4 or Letter before
            sending to a printer.
          </li>
          <li>
            <strong>Archive cleanup</strong> — Turn older PostScript exports
            into PDFs for long-term storage.
          </li>
          <li>
            <strong>Email attachments</strong> — Replace hard-to-open EPS files
            with a PDF everyone can view.
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
          Your EPS file is converted entirely in your browser. Focera does not
          receive the artwork, store the PDF, or run conversion on a remote
          server. The converter engine downloads once to your device; your files
          themselves never upload.
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
            or WebP images into a multi-page PDF.
          </li>
          <li>
            <Link href="/eps-to-png">EPS to PNG</Link> — Rasterize Encapsulated
            PostScript artwork into a PNG with DPI and transparency options.
          </li>
          <li>
            <Link href="/png-to-eps">PNG to EPS</Link> — Convert PNG images into
            Encapsulated PostScript for print workflows.
          </li>
          <li>
            <Link href="/psd-to-ai">PSD to AI</Link> — Convert Photoshop PSD
            files into Adobe Illustrator AI files.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Turn PNG images into a
            PDF with Fit / A4 / Letter options.
          </li>
          <li>
            <Link href="/tiff-to-pdf">TIFF to PDF</Link> — Convert TIFF scans,
            including multi-page files, to PDF.
          </li>
          <li>
            <Link href="/word-to-pdf">Word to PDF</Link> — Convert DOCX documents
            to PDF in your browser.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file after converting.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document.
          </li>
        </ul>
      </section>
    </article>
  );
}
