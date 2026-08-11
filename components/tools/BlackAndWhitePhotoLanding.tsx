import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Convert photo to black & white",
    description:
      "Turn color JPG, PNG, and WebP photos into clean grayscale images for portraits, prints, social posts, and design work.",
  },
  {
    title: "Styles you control",
    description:
      "Pick Classic for true grayscale, Soft for gentler tones, or High contrast for bold, dramatic black and white.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your photos never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and black & white result with a slider, then download a PNG ready to share or print.",
  },
];

export default function BlackAndWhitePhotoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="black-and-white-photo-features"
        title="Everything you need in a free black & white photo converter"
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
          Making a photo black and white should be fast and private. Focera
          keeps the whole flow on one page — upload, choose a style, convert,
          compare, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Pick a B&amp;W style.</strong> Classic keeps true grayscale,
            Soft eases contrast for a gentler look, and High contrast pushes
            deeper blacks and brighter whites.
          </li>
          <li>
            <strong>Convert and download.</strong> Processing runs in your
            browser. Compare with the before/after slider, then download a PNG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#black-and-white-photo-tool">black and white photo tool</a>{" "}
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
            <strong>Portrait and fashion</strong> — Strip color to emphasize
            expression, texture, and light in headshots and editorials.
          </li>
          <li>
            <strong>Social and storytelling</strong> — Create a classic or
            dramatic mood for posts, carousels, and personal projects.
          </li>
          <li>
            <strong>Print and framing</strong> — Export a grayscale PNG before
            printing a keepsake or portfolio piece.
          </li>
          <li>
            <strong>Design and mockups</strong> — Desaturate product or
            lifestyle shots when layouts need a monochrome look.
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
          convert a photo to black &amp; white, these tools often fit the same
          workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/colorize-photo">Colorize Photo</Link> — Add AI color
            back to black &amp; white or grayscale images.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution after converting for sharper prints and zooms.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size before sharing or uploading elsewhere.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects for collages and product-style exports.
          </li>
          <li>
            <Link href="/round-image">Round Image</Link> — Crop a circular
            avatar from your black &amp; white result.
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
