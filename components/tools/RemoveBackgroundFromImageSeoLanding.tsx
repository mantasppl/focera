import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "One-click background removal",
    description:
      "AI segmentation isolates people, products, and graphics so you can remove background from an image and keep a clean PNG with alpha — no manual masking.",
  },
  {
    title: "Crop, shadow, and sticker outline",
    description:
      "Trim empty pixels, add padding, drop a soft or hard shadow, or wrap the subject in a white, black, or custom sticker stroke.",
  },
  {
    title: "PNG or WebP with true alpha",
    description:
      "Download a transparent PNG for compatibility, or WebP when you want a smaller file for the web.",
  },
  {
    title: "100% browser-based",
    description:
      "Your photos never leave your device. Cutouts run locally with ONNX models for private, free edits.",
  },
];

export default function RemoveBackgroundFromImageSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-from-image-features"
        title="Everything you need to remove a background from an image"
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
          Removing a background from an image should be fast, private, and
          free. Focera keeps the whole workflow on one page — upload, clear the
          backdrop, refine the cutout, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the background.</strong> Click Make background
            transparent to run AI cutout in your browser. A loading indicator
            shows model download and processing progress on the first visit.
          </li>
          <li>
            <strong>Refine and download.</strong> Use the before/after slider
            to inspect edges, then crop to the subject, add padding, a drop
            shadow, or a sticker outline. Download a transparent PNG or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#remove-background-from-image-tool">
            remove background from image tool
          </a>{" "}
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
            <strong>Product photos for stores</strong> — Clear busy shelves so
            items sit on white or branded storefront backgrounds.
          </li>
          <li>
            <strong>Design and marketing layouts</strong> — Place subjects on
            slides, posters, and web banners without a leftover rectangle.
          </li>
          <li>
            <strong>Social graphics and stickers</strong> — Cut out people and
            objects for stories, thumbnails, and profile images.
          </li>
          <li>
            <strong>Headshots and ID photos</strong> — Prepare transparent
            cutouts for team pages, badges, and composite backgrounds.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-from-image" />
    </article>
  );
}
