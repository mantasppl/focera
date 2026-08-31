import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Refresh archived photos",
    description:
      "Unblur old digital copies that went soft after scans, reprints, or years of JPEG re-saves — keep the original size.",
  },
  {
    title: "Automatic best result",
    description:
      "Archived photos always get the strongest local AI restore — no Light, Medium, or Strong choice.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Family albums never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original archive file and the refreshed photo with a slider, then download as JPG, PNG, or WebP.",
  },
];

export default function UnblurOldPhotosSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="unblur-old-photos-features"
        title="Everything you need to unblur old photos"
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
          Unblurring old photos should stay fast and private. Focera keeps
          upload, compare, and download on one page with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload an old photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. Unblurring starts automatically.
          </li>
          <li>
            <strong>Let AI refresh the photo.</strong> The first visit downloads a 5 MB model. Later album scans unblur automatically at full strength.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download and choose JPG, PNG, or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#unblur-old-photos-tool">unblur old photos tool</a> anytime
          to process another file.
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
            <strong>Family albums</strong> — Refresh scanned prints that
            look a little soft on screen.
          </li>
          <li>
            <strong>Early digital cameras</strong> — Tighten JPEGs from
            older phones and compact cameras.
          </li>
          <li>
            <strong>Reprinted copies</strong> — Recover edges lost after
            years of re-exporting the same file.
          </li>
          <li>
            <strong>Memorial slides</strong> — Prepare archive photos for
            a presentation or print order.
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
          unblur old photos, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution when you need a larger, sharper export.
          </li>
          <li>
            <Link href="/resize-image">Resize Image Dimensions</Link> — Set
            exact width and height in pixels for a specific size.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects after sharpening.
          </li>
          <li>
            <Link href="/remove-objects">Remove Objects</Link> — Brush out
            distractions from photos you own.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting a PNG.
          </li>
          <li>
            <Link href="/image-converter">Image Converter</Link> — Convert
            between PNG, JPG, and WebP when your destination needs a specific
            format.
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
