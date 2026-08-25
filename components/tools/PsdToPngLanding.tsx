import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "PSD to PNG in your browser",
    description:
      "Turn Photoshop .psd files into lossless PNG images that keep transparency — no Photoshop install required.",
  },
  {
    title: "Batch convert multiple PSDs",
    description:
      "Upload up to 10 Photoshop files at once. One file downloads as PNG; batches download as a ZIP.",
  },
  {
    title: "Transparent or white",
    description:
      "Keep unpainted areas transparent for overlays, or flatten onto white when you need an opaque PNG.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function PsdToPngLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="psd-to-png-features"
        title="Everything you need in a free PSD to PNG converter"
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
          Photoshop PSD files keep layers, masks, and extra data that many apps
          cannot open. Focera flattens the saved composite and encodes it as
          PNG on one page — upload, choose background, convert, and download
          without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PSD files.</strong> Drag and drop Photoshop
            .psd files (up to 25 MB each), or click the zone to browse. Add up
            to 10 files per conversion.
          </li>
          <li>
            <strong>Choose background.</strong> Transparent keeps alpha so logos
            and cutouts overlay cleanly. White fills empty areas for an opaque
            PNG.
          </li>
          <li>
            <strong>Convert to PNG.</strong> Click Convert to PNG. Each PSD is
            flattened and encoded locally in your browser as a lossless PNG.
          </li>
          <li>
            <strong>Download your files.</strong> One file downloads as a .png;
            multiple files download together as a ZIP. Open the result in any
            photo viewer, design app, or website that accepts PNG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#psd-to-png-tool">PSD to PNG converter</a> anytime to process
          another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert PSD to PNG?
        </h2>
        <p>
          A PSD is Photoshop’s layered raster document. PNG is a lossless web
          image that supports transparency. Converting to PNG makes mockups,
          logos, and design proofs easy to share, overlay, and preview without
          asking recipients to install Photoshop — and without the quality loss
          of JPEG.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="layers"
      >
        <h2 id="layers" className="tool-content__heading">
          Are Photoshop Layers Preserved?
        </h2>
        <p>
          No. Layers, masks, blend modes, and smart objects are flattened into
          a single image — the same composite Photoshop saves with the file.
          Transparency is kept when you choose Transparent. If you need a
          smaller file for photos without alpha, use PSD to JPG instead.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="formats"
      >
        <h2 id="formats" className="tool-content__heading">
          Which PSD Files Work Best?
        </h2>
        <p>
          Use 8-bit RGB Photoshop documents with a saved composite (the default
          when you File &gt; Save). CMYK, Lab, Indexed, 16-bit, and PSB large
          documents are not supported — convert those to 8-bit RGB .psd in
          Photoshop first.
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
            <strong>Share design proofs</strong> — Send a PNG preview of a
            Photoshop mockup that opens on any phone or laptop.
          </li>
          <li>
            <strong>Keep transparency</strong> — Export logos, stickers, and
            cutouts with a transparent background for web and slides.
          </li>
          <li>
            <strong>Web and form uploads</strong> — Meet site requirements that
            only accept PNG.
          </li>
          <li>
            <strong>Lossless handoff</strong> — Convert composites without JPEG
            compression artifacts.
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
          Your PSD files are converted entirely in your browser. Focera does not
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
            <Link href="/psd-to-jpg">PSD to JPG</Link> — Flatten Photoshop PSD
            files into standard JPEG images for sharing.
          </li>
          <li>
            <Link href="/psd-to-ai">PSD to AI</Link> — Convert Photoshop PSD
            files into Adobe Illustrator .ai documents.
          </li>
          <li>
            <Link href="/jpg-to-png">JPG to PNG</Link> — Convert JPEG photos
            into lossless PNG files.
          </li>
          <li>
            <Link href="/heic-to-png">HEIC to PNG</Link> — Turn iPhone HEIC
            photos into PNG files.
          </li>
          <li>
            <Link href="/eps-to-png">EPS to PNG</Link> — Rasterize Encapsulated
            PostScript artwork into a PNG.
          </li>
          <li>
            <Link href="/make-background-transparent">
              Make Background Transparent
            </Link>{" "}
            — Remove a background after you have a standard PNG.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Combine PNG images into
            a multi-page PDF.
          </li>
        </ul>
      </section>
    </article>
  );
}
