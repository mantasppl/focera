import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "SVG to PNG in seconds",
    description:
      "Rasterize vector logos, icons, and illustrations into crisp PNG files for apps, docs, and uploads that need pixels.",
  },
  {
    title: "Choose export scale",
    description:
      "Render at 1×–4× so you can download retina-ready PNGs without guessing pixel dimensions.",
  },
  {
    title: "Batch convert multiple SVGs",
    description:
      "Upload up to 20 SVG files at once. One image downloads as PNG; batches download as a ZIP.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function SvgToPngLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="svg-to-png-features"
        title="Everything you need in a free SVG to PNG converter"
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
          SVG is perfect for scalable graphics, but many platforms still ask for
          PNG. Focera converts SVG to PNG on one page — upload, pick a scale,
          and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your SVG files.</strong> Drag and drop .svg images
            (up to 10 MB each), or click the zone to browse. Add up to 20 files
            per conversion.
          </li>
          <li>
            <strong>Choose a scale and convert.</strong> Pick 1×–4× export
            scale, then click Convert to PNG. Each vector is rendered to a
            lossless PNG locally in your browser.
          </li>
          <li>
            <strong>Download your files.</strong> One image downloads as a .png;
            multiple images download together as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#svg-to-png-tool">SVG to PNG converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert SVG to PNG?
        </h2>
        <p>
          PNG works almost everywhere — social uploads, email clients, slide
          decks, and apps that do not accept SVG. Converting gives you a fixed
          pixel image while keeping transparency from the original vector.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="scale"
      >
        <h2 id="scale" className="tool-content__heading">
          What Does Export Scale Mean?
        </h2>
        <p>
          Scale multiplies the SVG&apos;s intrinsic width and height. 2× is a
          good default for retina screens; 3× and 4× produce larger PNGs for
          print or high-DPI mockups. Output edges are capped so huge vectors
          stay within browser canvas limits.
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
            <strong>Logos and icons</strong> — Export brand marks for platforms
            that only accept PNG.
          </li>
          <li>
            <strong>App and web assets</strong> — Generate @2x / @3x raster
            versions from a single SVG source.
          </li>
          <li>
            <strong>Docs and presentations</strong> — Drop converted images into
            slides and pages that expect PNG.
          </li>
          <li>
            <strong>Further editing</strong> — Convert before background work,
            compression, or other PNG-first workflows.
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
          Your SVG files are converted entirely in your browser. Focera does not
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
            <Link href="/png-to-svg">PNG to SVG</Link> — Trace PNG logos and
            icons into scalable SVG files.
          </li>
          <li>
            <Link href="/jpg-to-svg">JPG to SVG</Link> — Trace JPG artwork into
            editable SVG paths.
          </li>
          <li>
            <Link href="/jpg-to-png">JPG to PNG</Link> — Turn JPEG photos into
            lossless PNG files.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            file size after converting for email and uploads.
          </li>
          <li>
            <Link href="/make-background-transparent">
              Make Background Transparent
            </Link>{" "}
            — Clean up solid backgrounds on raster images.
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
