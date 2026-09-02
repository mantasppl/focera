import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Exact pixel dimensions",
    description:
      "Set any width and height in pixels — shrink for the web, enlarge for print, or match a platform’s required size.",
  },
  {
    title: "Lock aspect ratio",
    description:
      "Keep proportions when you edit one side, or unlock to stretch freely for banners, covers, and custom crops of scale.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and resized result with a slider, then download a PNG ready for design, social, or print workflows.",
  },
];

export default function ResizeImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="resize-image-features"
        title="Everything you need in a free image resizer"
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
          Changing image dimensions should be fast and private. Focera keeps
          the whole flow on one page — upload, set size, resize, compare, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Enter width and height.</strong> Use pixel inputs, keep
            Lock aspect ratio on for proportional resize, or pick a quick scale
            like 50% or 200%.
          </li>
          <li>
            <strong>Resize and download.</strong> Processing runs in your
            browser. Compare with the before/after slider, then download a PNG
            at the new dimensions.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#resize-image-tool">image dimension resizer</a> anytime to
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
            <strong>Social and profile sizes</strong> — Match Instagram,
            LinkedIn, YouTube, and marketplace pixel requirements.
          </li>
          <li>
            <strong>Web performance</strong> — Downscale large photos before
            uploading so pages load faster.
          </li>
          <li>
            <strong>Print and mockups</strong> — Enlarge assets to fit poster,
            slide, or packaging layouts.
          </li>
          <li>
            <strong>Design handoff</strong> — Export screenshots and graphics
            at exact widths your templates expect.
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
          resize an image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution 2×–4× with detail enhancement when you need sharper
            enlargement.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting a resized PNG.
          </li>
          <li>
            <Link href="/flip-image">Flip Image</Link> — Mirror the photo
            horizontally or vertically after you set the size.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects before or after changing dimensions.
          </li>
          <li>
            <Link href="/change-background">Change Background</Link> —
            Replace the scene with a color, custom photo, or portrait blur.
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
