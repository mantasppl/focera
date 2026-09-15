import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Three-step removal",
    description:
      "Upload, click once, download a PNG with real alpha. No layers, masks, or extra panels to learn before the first cutout.",
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

export default function SimpleBackgroundRemovalSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="simple-background-removal-features"
        title="Everything you need for simple background removal"
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
          Simple background removal should stay on one screen: upload, isolate
          the subject, then download. Focera keeps that path free and without
          an account.
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
          <a href="#simple-background-removal-tool">
            simple background removal tool
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
            <strong>First product photos</strong> — Clear a kitchen or desk
            behind an item without learning a full editor.
          </li>
          <li>
            <strong>School and club flyers</strong> — Place a person on a
            poster without leftover rooms behind them.
          </li>
          <li>
            <strong>Profile and story graphics</strong> — Cut a face or object
            free for a cover, sticker, or thumbnail.
          </li>
          <li>
            <strong>Directory portraits</strong> — Prepare a headshot that can
            sit on any branded color or photo.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="simple-background-removal" />
    </article>
  );
}
