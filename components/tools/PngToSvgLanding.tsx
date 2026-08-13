import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "PNG to SVG in your browser",
    description:
      "Trace PNG logos, icons, and illustrations into editable SVG paths you can open in design tools or drop into the web.",
  },
  {
    title: "Choose how much detail to keep",
    description:
      "Pick Simple, Balanced, or Detailed tracing to trade shape count for fidelity before you download.",
  },
  {
    title: "Batch convert multiple PNGs",
    description:
      "Upload up to 10 PNG files at once. One image downloads as SVG; batches download as a ZIP.",
  },
  {
    title: "100% browser-based",
    description:
      "Vectorization runs on your device. Nothing uploads to Focera.",
  },
];

export default function PngToSvgLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="png-to-svg-features"
        title="Everything you need in a free PNG to SVG converter"
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
          PNG is a raster format made of pixels. SVG is vector — shapes and
          paths that stay sharp at any size. Focera traces your PNG into SVG
          paths on one page — upload, convert, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PNG files.</strong> Drag and drop .png images
            (up to 10 MB each), or click the zone to browse. Add up to 10 files
            per conversion.
          </li>
          <li>
            <strong>Pick a detail level.</strong> Simple uses fewer colors and
            shapes; Detailed keeps more paths. Balanced works well for most
            logos and icons.
          </li>
          <li>
            <strong>Convert to SVG.</strong> Click Convert to SVG. Each image is
            traced into vector paths locally in your browser.
          </li>
          <li>
            <strong>Download your files.</strong> One image downloads as a
            .svg; multiple images download together as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#png-to-svg-tool">PNG to SVG converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert PNG to SVG?
        </h2>
        <p>
          SVG scales cleanly for logos, icons, and UI assets. Converting a PNG
          gives you paths you can recolor, edit, and resize in Illustrator,
          Figma, Inkscape, or inline HTML — without the pixelation of enlarging
          a bitmap.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="best-results"
      >
        <h2 id="best-results" className="tool-content__heading">
          Tips for Best Results
        </h2>
        <p>
          Tracing works best on graphics with clear edges and limited colors —
          logos, icons, stickers, and flat illustrations. Photos and noisy
          screenshots produce more shapes and less clean paths. Large images are
          gently downscaled before tracing so conversion stays responsive.
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
            <strong>Logos and brand marks</strong> — Turn a PNG logo into
            scalable SVG for websites and print.
          </li>
          <li>
            <strong>Icons and UI</strong> — Convert icon sheets into vectors you
            can tint and size freely.
          </li>
          <li>
            <strong>Design handoff</strong> — Give editors SVG paths instead of
            locked bitmap exports.
          </li>
          <li>
            <strong>Web performance</strong> — Use SVG for simple graphics that
            stay crisp on retina screens.
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
          Your PNG files are traced entirely in your browser. Focera does not
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
            <Link href="/svg-to-png">SVG to PNG</Link> — Rasterize SVG logos and
            icons into crisp PNG files.
          </li>
          <li>
            <Link href="/jpg-to-svg">JPG to SVG</Link> — Trace JPG logos and
            icons into scalable SVG files.
          </li>
          <li>
            <Link href="/png-to-eps">PNG to EPS</Link> — Wrap PNG images in
            Encapsulated PostScript for print and layout apps.
          </li>
          <li>
            <Link href="/png-to-jpg">PNG to JPG</Link> — Convert PNG images to
            standard JPEG with quality control.
          </li>
          <li>
            <Link href="/png-to-webp">PNG to WebP</Link> — Shrink PNGs into
            smaller WebP files with transparency preserved.
          </li>
          <li>
            <Link href="/jpg-to-png">JPG to PNG</Link> — Turn JPEG photos into
            lossless PNG files.
          </li>
          <li>
            <Link href="/make-background-transparent">
              Make Background Transparent
            </Link>{" "}
            — Remove a solid background before tracing.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            raster files for email and uploads.
          </li>
        </ul>
      </section>
    </article>
  );
}
