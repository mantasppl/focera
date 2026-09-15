import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Fast backdrop removal",
    description:
      "AI finds the subject in portraits, products, and graphics so you can make a picture background transparent and keep real alpha — no tracing.",
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
      "Cutouts run locally with ONNX models. Pictures stay on your device for private, free edits.",
  },
];

export default function MakePictureBackgroundTransparentSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="make-picture-background-transparent-features"
        title="Everything you need to make a picture background transparent"
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
          Making a picture background transparent should stay on one screen:
          upload, isolate the subject, then download. Focera keeps that path
          free and without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your picture.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Clear the background.</strong> Click Make background
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
          <a href="#make-picture-background-transparent-tool">
            make picture background transparent tool
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
            <strong>Shop catalogs</strong> — Lift a mug, shoe, or gadget off a
            busy table so it sits on a clean listing canvas.
          </li>
          <li>
            <strong>Print and slide layouts</strong> — Place a person or object
            on posters and decks without leftover walls.
          </li>
          <li>
            <strong>Covers and stickers</strong> — Cut subjects free for
            stories, thumbnails, and outline graphics.
          </li>
          <li>
            <strong>Staff directories</strong> — Prepare portraits that can sit
            on any branded color or photo.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="make-picture-background-transparent" />
    </article>
  );
}
