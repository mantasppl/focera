import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Clean subject isolation",
    description:
      "AI separates people, products, and graphics so you can make an image background transparent and keep real alpha — no pen-tool tracing.",
  },
  {
    title: "Crop, shadow, and sticker outline",
    description:
      "Trim leftover empty space, add padding, drop a soft or hard shadow, or wrap the subject in a white, black, or custom stroke.",
  },
  {
    title: "PNG or WebP with true alpha",
    description:
      "Save a transparent PNG for the widest compatibility, or WebP when you need a smaller web-ready file.",
  },
  {
    title: "100% browser-based",
    description:
      "Cutouts run locally with ONNX models. Images stay on your device for private, free edits.",
  },
];

export default function MakeImageBackgroundTransparentSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="make-image-background-transparent-features"
        title="Everything you need to make an image background transparent"
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
          Making an image background transparent should stay on one screen:
          upload, isolate the subject, then download. Focera keeps that path
          free and without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Clear the backdrop.</strong> Click Make background
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
          <a href="#make-image-background-transparent-tool">
            make image background transparent tool
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
            <strong>Product listings</strong> — Lift a bottle, bag, or gadget
            off a cluttered desk so it sits on a clean store canvas.
          </li>
          <li>
            <strong>Campaign layouts</strong> — Place a person or object on
            banners and slides without leftover walls.
          </li>
          <li>
            <strong>Thumbnails and stickers</strong> — Cut subjects free for
            covers, stories, and outline graphics.
          </li>
          <li>
            <strong>Team portraits</strong> — Prepare headshots that can sit
            on any branded color or photo.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="make-image-background-transparent" />
    </article>
  );
}
