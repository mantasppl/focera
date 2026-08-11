import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "HEIC to PNG in seconds",
    description:
      "Turn iPhone HEIC photos into lossless PNG files that keep sharp detail for editing, design, and transparent workflows.",
  },
  {
    title: "Batch convert your camera roll",
    description:
      "Upload up to 20 HEIC or HEIF photos at once. One file downloads as PNG; batches download as a ZIP.",
  },
  {
    title: "Lossless PNG output",
    description:
      "PNG preserves pixel detail without JPEG compression artifacts — ideal when quality matters more than file size.",
  },
  {
    title: "100% browser-based",
    description:
      "Decoding and conversion run on your device. Nothing uploads to Focera.",
  },
];

export default function HeicToPngLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="heic-to-png-features"
        title="Everything you need in a free HEIC to PNG converter"
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
          iPhones often save photos as HEIC, which many apps and editors still
          struggle with. Focera converts them to PNG on one page — upload,
          convert, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your HEIC files.</strong> Drag and drop .heic or
            .heif photos (up to 20 MB each), or click the zone to browse. Add up
            to 20 files per conversion.
          </li>
          <li>
            <strong>Convert to PNG.</strong> Click Convert to PNG. Decoding and
            encoding run entirely in your browser — nothing leaves your device.
          </li>
          <li>
            <strong>Download your files.</strong> One photo downloads as a
            .png; multiple photos download together as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#heic-to-png-tool">HEIC to PNG converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert HEIC to PNG?
        </h2>
        <p>
          HEIC (High Efficiency Image Container) is Apple’s default on many
          iPhones. It saves space, but design tools, browsers, and many websites
          prefer PNG for crisp stills and editing. Converting to PNG makes
          photos easy to open, edit, and upload without asking recipients to
          install codecs.
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
            <strong>Design and editing</strong> — Open iPhone photos in tools
            that expect PNG without quality loss from JPEG.
          </li>
          <li>
            <strong>Web and form uploads</strong> — Meet site requirements that
            accept PNG but not HEIC.
          </li>
          <li>
            <strong>Windows and Office</strong> — Drop converted photos into
            documents and Explorer without HEIC support issues.
          </li>
          <li>
            <strong>Screenshots and graphics</strong> — Keep sharp edges and
            text when you need pixel-accurate stills from HEIC sources.
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
          Your HEIC files are decoded and converted entirely in your browser.
          Focera does not receive the photos, store results, or run conversion
          on a remote server. When you leave the page, object URLs are revoked
          and nothing remains on our infrastructure.
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
            <Link href="/heic-to-jpg">HEIC to JPG</Link> — Convert iPhone HEIC
            photos to JPEG when you need smaller files.
          </li>
          <li>
            <Link href="/jpg-to-png">JPG to PNG</Link> — Convert JPEG images to
            PNG with the same local workflow.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            PNG or JPG file size after converting for email and uploads.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            dimensions for web, profiles, and print.
          </li>
          <li>
            <Link href="/make-background-transparent">
              Make Background Transparent
            </Link>{" "}
            — Remove a background after you have a standard PNG.
          </li>
          <li>
            <Link href="/image-to-pdf">Image to PDF</Link> — Turn PNG photos into
            a multi-page PDF.
          </li>
        </ul>
      </section>
    </article>
  );
}
