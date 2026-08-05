import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Trim PDF page margins",
    description:
      "Crop every page by inches, millimeters, points, or percent — uniform trim or custom top, right, bottom, and left margins.",
  },
  {
    title: "Keeps text selectable",
    description:
      "Cropping updates page boxes with pdf-lib, so text, vector graphics, and layout stay intact — no image flatten.",
  },
  {
    title: "100% browser-based",
    description:
      "Your PDF is cropped on your device. Nothing is uploaded to Focera servers.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), pick a quick trim or custom margins, preview, and download in a few clicks.",
  },
];

export default function CropPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="crop-pdf-features"
        title="Everything you need in a free PDF cropper"
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
          Cropping a PDF should be quick and private. Focera keeps the whole
          flow on one page — upload, set margins, crop, and download without an
          account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose units and margins.</strong> Use inches, mm, points,
            or percent. Pick a Light, Medium, or Heavy quick trim, or set each
            side yourself.
          </li>
          <li>
            <strong>Crop and download.</strong> Every page is trimmed locally.
            Preview the result and download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the <a href="#crop-pdf-tool">PDF cropper</a> anytime to
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
            <strong>Scanner white borders</strong> — Remove leftover margins
            from phone or flatbed scans.
          </li>
          <li>
            <strong>Print-ready trim</strong> — Cut excess whitespace before
            printing or binding.
          </li>
          <li>
            <strong>Focus on content</strong> — Tighten slides, worksheets, or
            forms for easier reading on screen.
          </li>
          <li>
            <strong>Clean exports</strong> — Trim letterheads or footer bands
            before sharing a shorter page.
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
          Your PDF is read and cropped entirely in your browser. Focera does
          not receive the file, store pages, or run cropping on a remote
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
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before or after cropping.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink cropped PDFs
            for email, uploads, and sharing.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages,
            ranges, or fixed-size chunks.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before cropping.
          </li>
          <li>
            <Link href="/pdf-watermark">PDF Watermark</Link> — Stamp a logo or
            image watermark on every page.
          </li>
          <li>
            <Link href="/unlock-pdf">Unlock PDF</Link> — Remove a password from
            a protected PDF before cropping.
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
