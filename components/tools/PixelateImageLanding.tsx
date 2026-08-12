import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Pixelate any image",
    description:
      "Turn JPG, PNG, and WebP photos into mosaic-style pixel art for privacy, design, social posts, and creative edits.",
  },
  {
    title: "Intensity you control",
    description:
      "Pick Light for a subtle mosaic, Medium for a classic pixel look, or Heavy for bold blocky squares.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your photos never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and pixelated result with a slider, then download a PNG ready to share or edit further.",
  },
];

export default function PixelateImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pixelate-image-features"
        title="Everything you need in a free pixelate image tool"
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
          Pixelating an image should be fast and private. Focera keeps the whole
          flow on one page — upload, choose intensity, pixelate, compare, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Pick an intensity.</strong> Light keeps finer detail, Medium
            is the classic mosaic look, and Heavy uses larger blocks for a
            stronger pixel effect.
          </li>
          <li>
            <strong>Pixelate and download.</strong> Processing runs in your
            browser. Compare with the before/after slider, then download a PNG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pixelate-image-tool">pixelate image tool</a> anytime to
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
            <strong>Privacy and redaction</strong> — Obscure faces, plates, or
            sensitive details before sharing screenshots and photos.
          </li>
          <li>
            <strong>Pixel art and design</strong> — Create a retro mosaic look
            for social graphics, thumbnails, and creative projects.
          </li>
          <li>
            <strong>Teasers and reveals</strong> — Soft-pixelate an image for
            spoilers, product teasers, or “guess the photo” posts.
          </li>
          <li>
            <strong>Mockups and backgrounds</strong> — Use blocky color fields
            as abstract backgrounds or mood boards.
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
          pixelate an image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/blur-background">Blur Background</Link> — Soften
            backgrounds when you need blur instead of hard pixels.
          </li>
          <li>
            <Link href="/black-and-white-photo">Black and White Photo</Link> —
            Convert the result to grayscale for a stronger graphic look.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size before sharing or uploading elsewhere.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Change dimensions
            before or after pixelating.
          </li>
          <li>
            <Link href="/crop-image">Crop Image</Link> — Frame the area you
            want to pixelate or keep.
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
