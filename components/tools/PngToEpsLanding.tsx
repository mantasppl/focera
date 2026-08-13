import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "PNG to EPS in your browser",
    description:
      "Wrap PNG photos, logos, and graphics in Encapsulated PostScript you can place in Illustrator, InDesign, and print workflows.",
  },
  {
    title: "Color or grayscale",
    description:
      "Keep full RGB color, or convert to grayscale for print jobs that do not need color.",
  },
  {
    title: "Choose placement DPI",
    description:
      "Screen (72 DPI) matches pixel size in points. Draft and Print shrink the placed size for 150 or 300 DPI layouts.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function PngToEpsLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="png-to-eps-features"
        title="Everything you need in a free PNG to EPS converter"
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
          EPS (Encapsulated PostScript) is a print-friendly wrapper many layout
          apps still expect for logos and artwork. Focera converts PNG to EPS
          on one page — upload, choose color and DPI, convert, and download
          without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PNG files.</strong> Drag and drop .png images
            (up to 10 MB each), or click the zone to browse. Add up to 10 files
            per conversion.
          </li>
          <li>
            <strong>Pick color and placement size.</strong> Color keeps RGB.
            Grayscale is for single-ink print. Screen uses 72 DPI; Print uses
            300 DPI so the placed size matches print layouts.
          </li>
          <li>
            <strong>Convert to EPS.</strong> Click Convert to EPS. Each image is
            written into a DSC-compliant EPS file locally in your browser.
          </li>
          <li>
            <strong>Download your files.</strong> One image downloads as a
            .eps; multiple images download together as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#png-to-eps-tool">PNG to EPS converter</a> anytime to
          process another batch.
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
          EPS is Encapsulated PostScript — a single-page PostScript file with a
          bounding box so other programs can place it. Designers still use it
          for logos, ads, and print-ready artwork in Illustrator, InDesign, and
          some RIP workflows.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert PNG to EPS?
        </h2>
        <p>
          A PNG is a raster of pixels. Wrapping it in EPS lets you drop that
          image into print templates and older design tools that prefer
          PostScript. This converter embeds the PNG pixels in a valid EPS file
          — it does not trace shapes the way PNG to SVG does — so photos and
          detailed graphics keep their original look.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="transparency"
      >
        <h2 id="transparency" className="tool-content__heading">
          Does EPS Keep PNG Transparency?
        </h2>
        <p>
          Classic EPS does not support PNG-style alpha. Transparent pixels are
          flattened onto white so the file opens cleanly in PostScript
          workflows. If you need a transparent vector instead, use PNG to SVG.
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
            <strong>Print layouts</strong> — Place a PNG logo or photo in
            InDesign or Illustrator as EPS.
          </li>
          <li>
            <strong>Vendor specs</strong> — Deliver artwork in EPS when a
            printer or ad network still asks for PostScript.
          </li>
          <li>
            <strong>Legacy design tools</strong> — Open raster graphics in apps
            that import EPS more reliably than PNG.
          </li>
          <li>
            <strong>Grayscale print</strong> — Convert color PNGs to gray EPS
            for one-color jobs.
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
          Your PNG files are converted entirely in your browser. Focera does not
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
            <Link href="/psd-to-ai">PSD to AI</Link> — Convert Photoshop PSD
            files into Adobe Illustrator AI files.
          </li>
          <li>
            <Link href="/eps-to-png">EPS to PNG</Link> — Rasterize Encapsulated
            PostScript artwork into a PNG with DPI and transparency options.
          </li>
          <li>
            <Link href="/eps-to-pdf">EPS to PDF</Link> — Turn Encapsulated
            PostScript artwork into a shareable PDF.
          </li>
          <li>
            <Link href="/png-to-svg">PNG to SVG</Link> — Trace PNG logos and
            icons into scalable SVG paths.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Combine PNG images into
            a multi-page PDF instead.
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
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            raster files for email and uploads.
          </li>
        </ul>
      </section>
    </article>
  );
}
