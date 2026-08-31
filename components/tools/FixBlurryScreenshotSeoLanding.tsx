import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Sharpen mushy captures",
    description:
      "Tighten blurry screenshots so UI edges and type read more clearly after compression, resize, or a soft screen grab.",
  },
  {
    title: "Automatic best result",
    description:
      "Screenshots get a full-strength AI restore so mushy UI and text tighten up without picking a level.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your screenshots never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original capture and the sharper result with a slider, then download as JPG, PNG, or WebP.",
  },
];

export default function FixBlurryScreenshotSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="fix-blurry-screenshot-features"
        title="Everything you need to fix a blurry screenshot"
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
          Fixing a blurry screenshot should stay fast and private. Focera
          keeps upload, compare, and download on one page with no
          account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your screenshot.</strong> Drag and drop a JPG, PNG,
            or WebP file up to 10 MB. Sharpening starts automatically.
          </li>
          <li>
            <strong>Let AI restore the screenshot.</strong> The first visit downloads a 5 MB model. After that, recovery runs automatically at full strength.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download and choose JPG, PNG, or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#fix-blurry-screenshot-tool">fix blurry screenshot tool</a>{" "}
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
            <strong>Bug reports</strong> — Make UI text readable before you
            attach a capture to a ticket.
          </li>
          <li>
            <strong>How-to docs</strong> — Tighten steps that look mushy
            after a resize for the page.
          </li>
          <li>
            <strong>Chat shares</strong> — Recover edges lost when a
            messaging app recompressed the file.
          </li>
          <li>
            <strong>Slide decks</strong> — Clean up a screen grab so it
            holds up on a projector.
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
          fix a blurry screenshot, these tools often fit the same workflow:
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
