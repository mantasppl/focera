import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Automatic AI unblur",
    description:
      "Run a local AI pass that lifts soft focus and mild haze so edges read more clearly — without changing the original pixel size.",
  },
  {
    title: "Three strength levels",
    description:
      "Pick Light for gentle haze, Medium for everyday blur, or Strong when edges need a heavier recovery pass.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and AI-unblurred result with a slider, then download a PNG ready for sharing or editing.",
  },
];

export default function AiUnblurImageSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="ai-unblur-image-features"
        title="Everything you need to AI unblur an image"
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
          AI unblur should stay fast and private. Focera keeps the whole flow
          on one page — upload to start recovery, compare, and download
          without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. AI unblur starts automatically.
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
          <a href="#ai-unblur-image-tool">AI unblur image tool</a> anytime to
          process another file.
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
            <strong>Missed autofocus</strong> — Recover edge detail when a
            phone camera locked on the wrong plane.
          </li>
          <li>
            <strong>Compressed social saves</strong> — Tighten photos that
            went soft after messaging-app recompression.
          </li>
          <li>
            <strong>Listing photos</strong> — Make product shots look crisper
            before you publish them.
          </li>
          <li>
            <strong>Quick client proofs</strong> — Give a blurry draft a
            clearer pass without opening a desktop editor.
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
          AI unblur an image, these tools often fit the same workflow:
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
