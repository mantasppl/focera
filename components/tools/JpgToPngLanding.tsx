import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "JPG to PNG in seconds",
    description:
      "Turn JPEG photos into lossless PNG files that work in design tools, forms, and uploads that expect PNG.",
  },
  {
    title: "Batch convert multiple JPGs",
    description:
      "Upload up to 20 JPG or JPEG files at once. One image downloads as PNG; batches download as a ZIP.",
  },
  {
    title: "Lossless PNG output",
    description:
      "PNG keeps every pixel from the decoded image — no extra JPEG compression step when you re-export.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function JpgToPngLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="jpg-to-png-features"
        title="Everything you need in a free JPG to PNG converter"
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
          JPG is great for photos, but many editors, printers, and CMS uploads
          prefer PNG. Focera converts JPG to PNG on one page — upload, convert,
          and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your JPG files.</strong> Drag and drop .jpg or .jpeg
            images (up to 10 MB each), or click the zone to browse. Add up to 20
            files per conversion.
          </li>
          <li>
            <strong>Convert to PNG.</strong> Click Convert to PNG. Each photo is
            decoded and encoded as a lossless PNG locally in your browser.
          </li>
          <li>
            <strong>Download your files.</strong> One image downloads as a .png;
            multiple images download together as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#jpg-to-png-tool">JPG to PNG converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert JPG to PNG?
        </h2>
        <p>
          PNG is a widely supported lossless format used in design software,
          documentation, and sites that reject JPEG. Converting JPG to PNG makes
          photos easier to edit further, layer in mockups, or submit where PNG
          is required.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="file-size"
      >
        <h2 id="file-size" className="tool-content__heading">
          Will the PNG Be Larger?
        </h2>
        <p>
          Often yes. JPEG is optimized for photos with lossy compression; PNG is
          lossless, so the same image can grow in file size. If you need a
          smaller file afterward, use{" "}
          <Link href="/image-compressor">Compress Image Size</Link>.
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
            <strong>Design and editing</strong> — Open photos in tools that
            handle PNG more reliably than JPEG.
          </li>
          <li>
            <strong>Form and CMS uploads</strong> — Meet requirements that only
            accept PNG.
          </li>
          <li>
            <strong>Docs and presentations</strong> — Drop converted images into
            slides and pages that expect PNG.
          </li>
          <li>
            <strong>Further processing</strong> — Convert before background
            removal, resize, or other PNG-first workflows.
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
            <Link href="/jpg-to-tiff">JPG to TIFF</Link> — Convert JPEG photos
            into uncompressed .tif / .tiff files for print and scans.
          </li>
          <li>
            <Link href="/jpg-to-gif">JPG to GIF</Link> — Turn JPEG photos into
            still or animated GIFs.
          </li>
          <li>
            <Link href="/png-to-jpg">PNG to JPG</Link> — Convert PNG images back
            to standard JPEG with quality control.
          </li>
          <li>
            <Link href="/webp-to-png">WebP to PNG</Link> — Convert WebP images
            (including animated frames) to PNG.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            file size after converting for email and uploads.
          </li>
          <li>
            <Link href="/make-background-transparent">
              Make Background Transparent
            </Link>{" "}
            — Remove a solid background and keep a clear PNG.
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
