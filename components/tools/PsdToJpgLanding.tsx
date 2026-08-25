import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "PSD to JPG in your browser",
    description:
      "Turn Photoshop .psd files into standard JPG images that open in any photo app, email, or website — no Photoshop install required.",
  },
  {
    title: "Batch convert multiple PSDs",
    description:
      "Upload up to 10 Photoshop files at once. One file downloads as JPG; batches download as a ZIP.",
  },
  {
    title: "Choose JPEG quality",
    description:
      "Pick Smaller, Balanced, or High so you control file size versus detail before downloading.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function PsdToJpgLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="psd-to-jpg-features"
        title="Everything you need in a free PSD to JPG converter"
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
          JPG on one page — upload, choose quality, convert, and download
          without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PSD files.</strong> Drag and drop Photoshop
            .psd files (up to 25 MB each), or click the zone to browse. Add up
            to 10 files per conversion.
          </li>
          <li>
            <strong>Choose JPEG quality.</strong> Balanced is a solid default.
            Use Smaller for email and forms, or High when you want more detail.
          </li>
          <li>
            <strong>Convert to JPG.</strong> Click Convert to JPG. Each PSD is
            flattened and encoded locally in your browser. Transparent areas
            become white, because JPEG does not support alpha.
          </li>
          <li>
            <strong>Download your files.</strong> One file downloads as a .jpg;
            multiple files download together as a ZIP. Open the result in any
            photo viewer, messenger, or website that accepts JPEG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#psd-to-jpg-tool">PSD to JPG converter</a> anytime to process
          another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert PSD to JPG?
        </h2>
        <p>
          A PSD is Photoshop’s layered raster document. Most phones, Windows
          PCs, email clients, and websites expect JPEG instead. Converting to
          JPG makes mockups, composites, and design proofs easy to share,
          upload, and preview without asking recipients to install Photoshop.
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
          Transparency is filled with white. If you need a PNG that keeps
          transparency, use PSD to PNG. If you need a layered handoff for
          Illustrator instead, use PSD to AI.
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
            <strong>Share design proofs</strong> — Send a JPG preview of a
            Photoshop mockup that opens on any phone or laptop.
          </li>
          <li>
            <strong>Web and form uploads</strong> — Meet site requirements that
            only accept JPG or JPEG.
          </li>
          <li>
            <strong>Client reviews</strong> — Attach a lightweight JPG instead
            of a large layered PSD.
          </li>
          <li>
            <strong>Social and email</strong> — Convert composites into photos
            that preview inline in chat apps and inboxes.
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
            <Link href="/psd-to-png">PSD to PNG</Link> — Flatten Photoshop PSD
            files into lossless PNG images with optional transparency.
          </li>
          <li>
            <Link href="/psd-to-ai">PSD to AI</Link> — Convert Photoshop PSD
            files into Adobe Illustrator .ai documents.
          </li>
          <li>
            <Link href="/png-to-jpg">PNG to JPG</Link> — Convert PNG images to
            JPEG with the same quality controls.
          </li>
          <li>
            <Link href="/heic-to-jpg">HEIC to JPG</Link> — Turn iPhone HEIC
            photos into standard JPG files.
          </li>
          <li>
            <Link href="/tiff-to-jpg">TIFF to JPG</Link> — Convert .tif / .tiff
            scans, including multi-page files, into JPEG.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            JPG file size after converting for email and uploads.
          </li>
          <li>
            <Link href="/image-to-pdf">Image to PDF</Link> — Turn JPG photos into
            a multi-page PDF.
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
