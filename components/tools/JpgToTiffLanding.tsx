import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "JPG to TIFF in seconds",
    description:
      "Turn JPEG photos into uncompressed TIFF files for scanners, print shops, and archival workflows that expect .tif / .tiff.",
  },
  {
    title: "Batch convert multiple JPGs",
    description:
      "Upload up to 20 JPG or JPEG files at once. One image downloads as TIFF; batches download as a ZIP.",
  },
  {
    title: "Full-resolution TIFF output",
    description:
      "Each photo is decoded and encoded at its original pixel size — no extra JPEG compression step when you re-export.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function JpgToTiffLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="jpg-to-tiff-features"
        title="Everything you need in a free JPG to TIFF converter"
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
          JPG is great for sharing photos, but many scanners, print shops, and
          document systems prefer TIFF. Focera converts JPG to TIFF on one page
          — upload, convert, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your JPG files.</strong> Drag and drop .jpg or .jpeg
            images (up to 10 MB each), or click the zone to browse. Add up to 20
            files per conversion.
          </li>
          <li>
            <strong>Convert to TIFF.</strong> Click Convert to TIFF. Each photo
            is decoded and encoded as an uncompressed .tiff locally in your
            browser.
          </li>
          <li>
            <strong>Download your files.</strong> One image downloads as a
            .tiff; multiple images download together as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#jpg-to-tiff-tool">JPG to TIFF converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert JPG to TIFF?
        </h2>
        <p>
          TIFF is a widely used format for scans, print production, and
          archival storage. Converting JPG to TIFF makes photos easier to drop
          into document systems, RIP software, and workflows that reject JPEG
          or expect .tif / .tiff.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="file-size"
      >
        <h2 id="file-size" className="tool-content__heading">
          Will the TIFF Be Larger?
        </h2>
        <p>
          Usually yes. JPEG is a lossy, compact photo format; this converter
          writes uncompressed TIFF, so the same image is often much larger.
          That extra size is expected for print and archival use. If you need a
          smaller file afterward, convert back with{" "}
          <Link href="/tiff-to-jpg">TIFF to JPG</Link>.
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
            <strong>Print and prepress</strong> — Meet shop or RIP requirements
            that only accept TIFF.
          </li>
          <li>
            <strong>Scans and paperwork</strong> — Turn camera photos of
            documents into TIFF files for office systems.
          </li>
          <li>
            <strong>Archival storage</strong> — Keep a full-resolution copy in a
            format used by libraries and records workflows.
          </li>
          <li>
            <strong>Further processing</strong> — Convert before TIFF to PDF or
            other TIFF-first tools.
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
          Your JPG files are converted entirely in your browser. Focera does not
          receive the images, store results, or run conversion on a remote
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
            <Link href="/tiff-to-jpg">TIFF to JPG</Link> — Convert .tif / .tiff
            scans back into standard JPEG images.
          </li>
          <li>
            <Link href="/jpg-to-png">JPG to PNG</Link> — Convert JPEG photos to
            lossless PNG files.
          </li>
          <li>
            <Link href="/tiff-to-pdf">TIFF to PDF</Link> — Turn TIFF scans into
            a multi-page PDF.
          </li>
          <li>
            <Link href="/pdf-to-tiff">PDF to TIFF</Link> — Convert PDF pages
            into TIFF images.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            file size after converting for email and uploads.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            dimensions for web, profiles, and print.
          </li>
        </ul>
      </section>
    </article>
  );
}
