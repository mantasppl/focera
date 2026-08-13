import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Freeform or locked ratios",
    description:
      "Crop freely or lock to 1:1, 4:3, 3:2, 16:9, or 9:16 — ideal for social posts, banners, and product shots.",
  },
  {
    title: "Drag to reframe",
    description:
      "Move the selection and resize with corner and edge handles. Live pixel dimensions update as you adjust.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and cropped result with a slider, then download a PNG ready for design or social.",
  },
];

export default function CropImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="crop-image-features"
        title="Everything you need in a free image cropper"
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
          Cropping a photo should be fast and private. Focera keeps the whole
          flow on one page — upload, frame the area you want, crop, compare,
          and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Frame the crop.</strong> Drag the box to move it, pull the
            handles to resize, and optionally lock an aspect ratio like 1:1 or
            16:9.
          </li>
          <li>
            <strong>Crop and download.</strong> Processing runs in your
            browser. Compare with the before/after slider, then download a PNG
            at the cropped dimensions.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#crop-image-tool">image cropper</a> anytime to process
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
            <strong>Social crops</strong> — Cut photos to square, story
            (9:16), or widescreen (16:9) before posting.
          </li>
          <li>
            <strong>Product and marketplace listings</strong> — Remove
            excess background so the subject fills the frame.
          </li>
          <li>
            <strong>Thumbnails and cards</strong> — Trim screenshots and
            graphics to exact ratios your layouts expect.
          </li>
          <li>
            <strong>Print prep</strong> — Focus on the important area before
            resizing or exporting for print.
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
          crop an image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            width and height after cropping.
          </li>
          <li>
            <Link href="/flip-image">Flip Image</Link> — Mirror the photo
            horizontally or vertically before or after cropping.
          </li>
          <li>
            <Link href="/round-image">Round Image</Link> — Crop to a circle
            with a transparent edge for avatars and badges.
          </li>
          <li>
            <Link href="/profile-photo-maker">Profile Photo Maker</Link> —
            Square or circle crops sized for LinkedIn, Instagram, and Discord.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting a cropped PNG.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects before or after cropping.
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
