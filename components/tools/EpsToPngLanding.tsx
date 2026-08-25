import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "EPS to PNG in the browser",
    description:
      "Rasterize Encapsulated PostScript artwork to a PNG without installing Ghostscript, Illustrator, or creating an account.",
  },
  {
    title: "Choose resolution",
    description:
      "Export at Screen 72 DPI, Draft 150 DPI, or Print 300 DPI so logos stay crisp on web and in print mockups.",
  },
  {
    title: "Transparent or white",
    description:
      "Keep unpainted areas transparent for overlays, or flatten onto white when you need an opaque PNG.",
  },
  {
    title: "Private by design",
    description:
      "Your EPS stays on your device. Conversion runs locally after the converter engine loads in your browser.",
  },
];

export default function EpsToPngLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="eps-to-png-features"
        title="Everything you need in a free EPS to PNG converter"
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
          Converting EPS to PNG should be quick and private. Focera keeps the
          whole flow on one page — upload a .eps file, pick resolution and
          background, convert, and download without an account or desktop
          installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your EPS file.</strong> Drag and drop a .eps or
            .epsf file up to 25 MB, or click the zone to browse from your
            device.
          </li>
          <li>
            <strong>Choose resolution and background.</strong> Draft (150 DPI)
            is a solid default. Use Print (300 DPI) for sharp logos, or Screen
            (72 DPI) for smaller web assets. Transparent keeps alpha; White
            flattens onto an opaque background.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PNG. The
            first run loads the converter engine once; then the PNG builds
            locally and downloads automatically.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#eps-to-png-tool">EPS to PNG converter</a> anytime to
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
          for logos, illustrations, and print-ready artwork. Many design apps
          still export EPS, but PNG is easier to preview on the web, drop into
          slides, or use in mockups. This tool rasterizes EPS into a standard
          PNG using a local PostScript engine in your browser.
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
            <strong>Logo for the web</strong> — Turn a print EPS into a PNG
            you can upload to a site, email, or social post.
          </li>
          <li>
            <strong>Transparent overlays</strong> — Keep unpainted areas
            transparent so the logo sits cleanly on any background.
          </li>
          <li>
            <strong>Client previews</strong> — Share a PNG when the recipient
            cannot open Illustrator or PostScript files.
          </li>
          <li>
            <strong>Mockups and slides</strong> — Rasterize vector artwork at
            150 or 300 DPI for decks, packaging comps, and print proofs.
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
          receive the artwork, store the PNG, or run conversion on a remote
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
            <Link href="/eps-to-pdf">EPS to PDF</Link> — Turn Encapsulated
            PostScript artwork into a shareable PDF instead.
          </li>
          <li>
            <Link href="/png-to-eps">PNG to EPS</Link> — Wrap PNG images in
            Encapsulated PostScript for print workflows.
          </li>
          <li>
            <Link href="/svg-to-png">SVG to PNG</Link> — Rasterize SVG logos
            and icons into crisp PNG files.
          </li>
          <li>
            <Link href="/psd-to-png">PSD to PNG</Link> — Flatten Photoshop PSD
            files into lossless PNG images with optional transparency.
          </li>
          <li>
            <Link href="/psd-to-ai">PSD to AI</Link> — Convert Photoshop PSD
            files into Adobe Illustrator AI files.
          </li>
          <li>
            <Link href="/png-to-jpg">PNG to JPG</Link> — Convert the PNG to
            JPEG when you need a smaller photo file.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            the PNG for email and uploads after converting.
          </li>
        </ul>
      </section>
    </article>
  );
}
