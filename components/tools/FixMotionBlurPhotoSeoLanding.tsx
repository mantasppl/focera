import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Reduce mild motion smear",
    description:
      "Recover edges from light camera shake or subject movement — a sharpen pass at the original resolution, not a miracle restore.",
  },
  {
    title: "Three strength levels",
    description:
      "Pick Light for slight smear, Medium for everyday shake, or Strong when motion haze is heavier.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and tightened result with a slider, then download a PNG ready for sharing or editing.",
  },
];

export default function FixMotionBlurPhotoSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="fix-motion-blur-photo-features"
        title="Everything you need to fix motion blur in a photo"
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
          Fixing motion blur should stay fast and private. Focera keeps
          upload, strength, compare, and download on one page with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. Recovery starts automatically.
          </li>
          <li>
            <strong>Pick a recovery strength.</strong> Medium is the default.
            Switch to Light or Strong anytime — the preview updates on its own.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download PNG when you are ready.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#fix-motion-blur-photo-tool">fix motion blur photo tool</a>{" "}
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
            <strong>Handheld low light</strong> — Reduce shake haze when
            the shutter stayed open a beat too long.
          </li>
          <li>
            <strong>Kids and pets</strong> — Tighten shots where the
            subject moved just as you pressed the shutter.
          </li>
          <li>
            <strong>Street photos</strong> — Recover edges from a slight
            pan or walk-and-shoot smear.
          </li>
          <li>
            <strong>Sports stills</strong> — Improve mild action blur;
            heavy trails may only lift a little.
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
          fix motion blur in a photo, these tools often fit the same workflow:
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
