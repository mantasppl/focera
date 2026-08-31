import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "AI photo sharpening",
    description:
      "Lift edge contrast on portraits, products, and snapshots with a local sharpener that keeps the original resolution.",
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
      "Compare the original and sharpened photo with a slider, then download a PNG ready for sharing or editing.",
  },
];

export default function AiPhotoSharpenerSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="ai-photo-sharpener-features"
        title="Everything you need in a free AI photo sharpener"
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
          An AI photo sharpener should stay fast and private. Focera keeps
          upload, strength, compare, and download on one page with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. Sharpening starts automatically.
          </li>
          <li>
            <strong>Pick a sharpen strength.</strong> Medium is the default.
            Switch to Light or Strong anytime — the preview updates on its own.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download PNG when you are ready.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#ai-photo-sharpener-tool">AI photo sharpener</a> anytime to
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
            <strong>Portrait polish</strong> — Add a bit more edge to
            headshots before you crop or share them.
          </li>
          <li>
            <strong>Product photography</strong> — Make packaging and
            textures look tighter on store pages.
          </li>
          <li>
            <strong>Real-estate interiors</strong> — Recover detail that
            went soft in wide indoor shots.
          </li>
          <li>
            <strong>Social crops</strong> — Sharpen a photo after you
            reframe it for a post.
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
          run the AI photo sharpener, these tools often fit the same workflow:
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
