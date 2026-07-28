import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Increase image resolution",
    description:
      "Upscale photos and graphics 2×, 3×, or 4× with progressive high-quality scaling — ideal for prints, zooms, and sharper displays.",
  },
  {
    title: "Detail enhancement",
    description:
      "Optional sharpening restores edge clarity after enlargement so upscaled images look crisper, not just bigger and blurrier.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and upscaled result with a slider, then download a PNG ready for design, social, or print workflows.",
  },
];

export default function UpscaleImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="upscale-image-features"
        title="Everything you need in a free image upscaler"
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
          Increasing image resolution should be fast and private. Focera keeps
          the whole flow on one page — upload, choose a scale, upscale, compare,
          and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Pick a scale factor.</strong> Choose 2×, 3×, or 4×, and
            optionally keep Enhance details on for sharper edges after
            enlargement.
          </li>
          <li>
            <strong>Upscale and download.</strong> Processing runs in your
            browser. Compare with the before/after slider, then download a PNG
            at the new resolution.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#upscale-image-tool">image upscaler</a> anytime to process
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
            <strong>Print and posters</strong> — Enlarge small photos so they
            hold up better when printed or displayed at larger sizes.
          </li>
          <li>
            <strong>Product and marketplace listings</strong> — Increase
            resolution for zoom-friendly storefront images without reshooting.
          </li>
          <li>
            <strong>Social and thumbnails</strong> — Stretch older assets to
            meet modern platform size requirements.
          </li>
          <li>
            <strong>Design mockups</strong> — Upscale logos, screenshots, and
            graphics before dropping them into layouts.
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
          upscale an image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects before or after increasing resolution.
          </li>
          <li>
            <Link href="/change-background">Change Background</Link> —
            Replace the scene with a color, custom photo, or portrait blur.
          </li>
          <li>
            <Link href="/remove-watermark">Remove Watermark</Link> — Brush
            out logos or text overlays from photos you own.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting a larger PNG.
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
