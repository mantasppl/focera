import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Remove blur, keep size",
    description:
      "Reduce soft focus and mild haze so the subject reads cleaner, then export a PNG at the original resolution.",
  },
  {
    title: "Automatic best result",
    description:
      "Blur removal always uses the full AI restore — upload once and get the strongest local result.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and de-blurred result with a slider, then download as JPG, PNG, or WebP.",
  },
];

export default function RemoveBlurFromImageSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-blur-from-image-features"
        title="Everything you need to remove blur from an image"
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
          Removing blur from an image should stay fast and private. Focera
          keeps upload, compare, and download on one page with no
          account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. Blur reduction starts automatically.
          </li>
          <li>
            <strong>Let AI remove the blur.</strong> The first visit downloads a 5 MB model. After that, the pass runs automatically at full strength.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download and choose JPG, PNG, or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#remove-blur-from-image-tool">remove blur from image tool</a>{" "}
          anytime to process another file.
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
            <strong>Slightly missed focus</strong> — Pull edges back when
            the subject is almost sharp.
          </li>
          <li>
            <strong>Low-light haze</strong> — Reduce the softness that
            shows up in dim indoor shots.
          </li>
          <li>
            <strong>Catalog photos</strong> — Make merchandise look crisper
            without reshooting.
          </li>
          <li>
            <strong>Shared attachments</strong> — Clean up pictures that
            blurred after email or chat compression.
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
          remove blur from an image, these tools often fit the same workflow:
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
            <Link href="/png-to-jpg">PNG to JPG Converter</Link> — Convert
            PNG images to JPEG when your destination needs a smaller photo
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
