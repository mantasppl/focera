import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "EXIF, IPTC, and XMP",
    description:
      "Read camera make and model, lens, shutter, aperture, ISO, dates, and software tags embedded in the file.",
  },
  {
    title: "GPS when present",
    description:
      "If the photo includes coordinates, see latitude and longitude and open them on OpenStreetMap — still fully local.",
  },
  {
    title: "100% browser-based",
    description:
      "Metadata is parsed on your device. Images never upload to Focera servers — private by design.",
  },
  {
    title: "Copy or download JSON",
    description:
      "Export every field as JSON for archives, debugging, or stripping location data in another editor.",
  },
];

export default function ViewMetadataForYourImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="view-image-metadata-features"
        title="Everything you need in a free image metadata viewer"
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
          Checking photo metadata should be fast and private. Focera keeps the
          whole flow on one page — upload, read tags, copy, or download without
          an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Read the tags.</strong> File size, dimensions, camera
            settings, capture time, and GPS (when present) appear instantly.
          </li>
          <li>
            <strong>Copy or download.</strong> Copy JSON to the clipboard or
            save a .json file for records. Nothing leaves your browser.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#view-metadata-for-your-image-tool">image metadata viewer</a>{" "}
          anytime to inspect another file.
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
            <strong>Photography review</strong> — Confirm shutter, aperture,
            ISO, and lens before you edit or publish a shot.
          </li>
          <li>
            <strong>Privacy checks</strong> — See whether a photo still
            contains GPS or camera serial data before you share it.
          </li>
          <li>
            <strong>Stock and client files</strong> — Verify copyright,
            artist, and software tags on delivered images.
          </li>
          <li>
            <strong>Debugging exports</strong> — Compare original vs exported
            files when a pipeline strips or rewrites EXIF.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-tools"
      >
        <h2 id="related-tools" className="tool-content__heading">
          Related Free Tools
        </h2>
        <p>
          Focera groups fast, privacy-friendly utilities in one hub. After you
          inspect metadata, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/image-to-text">Image to Text</Link> — Extract readable
            text from the same photo with on-device OCR.
          </li>
          <li>
            <Link href="/crop-image">Crop Image</Link> — Reframe the photo
            after you confirm orientation and size.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size before you send or publish.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            width and height for web or print.
          </li>
          <li>
            <Link href="/tools">All tools</Link> — Browse every free utility
            in the Focera catalog.
          </li>
        </ul>
      </section>
    </article>
  );
}
