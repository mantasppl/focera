import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "AI repair for blurry photos",
    description:
      "Fix soft or slightly smeared shots with a local AI pass that restores edges while keeping the original dimensions.",
  },
  {
    title: "Automatic best result",
    description:
      "Each blurry photo gets a full-strength AI fix in the browser, with no Light / Medium / Strong control.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and repaired photo with a slider, then download as JPG, PNG, or WebP.",
  },
];

export default function AiFixBlurryPhotosSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="ai-fix-blurry-photos-features"
        title="Everything you need to AI fix blurry photos"
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
          Fixing blurry photos should stay fast and private. Focera keeps
          upload, AI recovery, compare, and download on one page with no
          account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. The AI fix starts automatically.
          </li>
          <li>
            <strong>Let the AI fix run.</strong> The first visit downloads a 5 MB model. Later photos process automatically at full strength.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download and choose JPG, PNG, or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#ai-fix-blurry-photos-tool">AI fix blurry photos tool</a>{" "}
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
            <strong>Family snapshots</strong> — Rescue a slightly soft
            moment you cannot reshoot.
          </li>
          <li>
            <strong>Event photos</strong> — Tighten indoor shots that
            missed focus in dim light.
          </li>
          <li>
            <strong>Travel albums</strong> — Clean up handheld photos
            before you share the set.
          </li>
          <li>
            <strong>Profile pictures</strong> — Give a blurry headshot a
            clearer pass for social or ID use.
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
          AI fix blurry photos, these tools often fit the same workflow:
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
