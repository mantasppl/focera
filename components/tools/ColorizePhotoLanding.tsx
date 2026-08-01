import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Colorize black & white photos",
    description:
      "Bring old family portraits, archival scans, and classic film shots back to life with AI that predicts natural colors from grayscale detail.",
  },
  {
    title: "Strength you control",
    description:
      "Pick Subtle, Natural, or Vivid so the result matches soft restoration, everyday color, or richer, more saturated tones.",
  },
  {
    title: "100% browser-based",
    description:
      "Colorization runs locally on your device. Your photos never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and colorized result with a slider, then download a PNG ready to share, print, or archive.",
  },
];

export default function ColorizePhotoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="colorize-photo-features"
        title="Everything you need in a free photo colorizer"
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
          Coloring an old photo should feel simple and private. Focera keeps the
          whole flow on one page — upload, choose a strength, colorize, compare,
          and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
            Black &amp; white and sepia images work best.
          </li>
          <li>
            <strong>Pick a color strength.</strong> Choose Subtle for a gentle
            tint, Natural for balanced everyday color, or Vivid for richer
            saturation.
          </li>
          <li>
            <strong>Colorize and download.</strong> The AI model runs in your
            browser. Compare with the before/after slider, then download a PNG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#colorize-photo-tool">photo colorizer</a> anytime to process
          another file.
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
            <strong>Family history</strong> — Restore grandparents&apos; portraits
            and wedding photos with believable color for albums and gifts.
          </li>
          <li>
            <strong>Archival and research</strong> — Add color context to scans
            from newspapers, museums, and personal collections.
          </li>
          <li>
            <strong>Creative projects</strong> — Colorize film stills, street
            photography, and design assets for mood boards or social posts.
          </li>
          <li>
            <strong>Print and framing</strong> — Prepare a colorized PNG before
            enlarging or printing a treasured black &amp; white shot.
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
          colorize a photo, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution after colorizing for sharper prints and zooms.
          </li>
          <li>
            <Link href="/remove-watermark">Remove Watermark</Link> — Brush out
            logos or text overlays from photos you own.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects for collages and product-style exports.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size before sharing or uploading elsewhere.
          </li>
          <li>
            <Link href="/ai-image-generator">AI Image Generator</Link> — Create
            brand-new images from text when you need a fresh visual.
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
