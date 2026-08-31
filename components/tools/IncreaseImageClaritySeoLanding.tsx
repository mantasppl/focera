import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Raise edge clarity",
    description:
      "Increase image clarity with a local sharpen pass that recovers soft edges while keeping the original resolution.",
  },
  {
    title: "Automatic best result",
    description:
      "Clarity increase always runs the strongest on-device AI pass, so you never pick a recovery level.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and higher-clarity result with a slider, then download as JPG, PNG, or WebP.",
  },
];

export default function IncreaseImageClaritySeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="increase-image-clarity-features"
        title="Everything you need to increase image clarity"
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
          Increasing image clarity should stay fast and private. Focera keeps
          upload, compare, and download on one page with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. The clarity pass starts automatically.
          </li>
          <li>
            <strong>Let AI increase the clarity.</strong> The first visit downloads a 5 MB model. After that, the pass runs automatically at full strength.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download and choose JPG, PNG, or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#increase-image-clarity-tool">increase image clarity tool</a>{" "}
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
            <strong>Soft exports</strong> — Lift clarity after a resize or
            format conversion dulled the edges.
          </li>
          <li>
            <strong>Web thumbnails</strong> — Make small previews look
            crisper without re-exporting from scratch.
          </li>
          <li>
            <strong>Print proofs</strong> — Add a bit more definition
            before you send a file to a printer.
          </li>
          <li>
            <strong>Detail shots</strong> — Help textures and type stand
            out on product or document photos.
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
          increase image clarity, these tools often fit the same workflow:
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
