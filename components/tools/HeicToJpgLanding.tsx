import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "HEIC to JPG in seconds",
    description:
      "Turn iPhone HEIC photos into standard JPG files that open everywhere — Windows, Android, email, and the web.",
  },
  {
    title: "Batch convert your camera roll",
    description:
      "Upload up to 20 HEIC or HEIF photos at once. One file downloads as JPG; batches download as a ZIP.",
  },
  {
    title: "Choose JPEG quality",
    description:
      "Pick Smaller, Balanced, or High so you control file size versus detail before downloading.",
  },
  {
    title: "100% browser-based",
    description:
      "Decoding and conversion run on your device. Nothing uploads to Focera.",
  },
];

export default function HeicToJpgLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="heic-to-jpg-features"
        title="Everything you need in a free HEIC to JPG converter"
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
          iPhones often save photos as HEIC, which many apps and PCs still
          struggle with. Focera converts them to JPG on one page — upload,
          choose quality, convert, and download without an account or desktop
          installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your HEIC files.</strong> Drag and drop .heic or
            .heif photos (up to 20 MB each), or click the zone to browse. Add up
            to 20 files per conversion.
          </li>
          <li>
            <strong>Choose JPEG quality.</strong> Balanced is a solid default.
            Use Smaller for email and forms, or High when you want more detail.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to JPG.
            Processing runs locally — one photo downloads as a .jpg; multiple
            photos download as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#heic-to-jpg-tool">HEIC to JPG converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert HEIC to JPG?
        </h2>
        <p>
          HEIC (High Efficiency Image Container) is Apple’s default on many
          iPhones. It saves space, but Windows PCs, older Android phones, and
          plenty of websites expect JPEG. Converting to JPG makes photos easy to
          share, upload, and edit without asking recipients to install codecs.
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
            <strong>Share from iPhone</strong> — Send camera-roll photos that
            open on any phone, laptop, or messaging app.
          </li>
          <li>
            <strong>Web and form uploads</strong> — Meet site requirements that
            only accept JPG or JPEG.
          </li>
          <li>
            <strong>Windows and Office</strong> — Drop converted photos into
            Word, PowerPoint, and Explorer without HEIC support issues.
          </li>
          <li>
            <strong>Email attachments</strong> — Convert a batch and attach
            smaller JPGs that recipients can preview inline.
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
            <Link href="/png-to-jpg">PNG to JPG</Link> — Convert PNG images to
            JPEG with the same quality controls.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            JPG file size after converting for email and uploads.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            dimensions for web, profiles, and print.
          </li>
          <li>
            <Link href="/profile-photo-maker">Profile Photo Maker</Link> —
            Crop a converted photo into a square or circle avatar.
          </li>
          <li>
            <Link href="/image-to-pdf">Image to PDF</Link> — Turn JPG photos into
            a multi-page PDF.
          </li>
          <li>
            <Link href="/background-remover">Background Remover</Link> — Cut out
            the subject after you have a standard JPG or PNG.
          </li>
        </ul>
      </section>
    </article>
  );
}
