import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "No brush, no threshold",
    description:
      "The model decides the subject automatically. You review edges with the slider, then export.",
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
      "Cutouts run locally with ONNX models. Photos stay on your device for private, free edits.",
  },
];

export default function AutoBackgroundRemovalSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="auto-background-removal-features"
        title="Everything you need in Auto Background Removal"
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
          Auto background removal should not bury you in sliders before the first result. Focera runs segmentation locally and keeps download on the same page.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Run automatic removal.</strong> Click Make
            background transparent to run AI cutout in your browser. A loading
            indicator shows model download and processing progress on the first
            visit.
          </li>
          <li>
            <strong>Refine and download.</strong> Use the before/after slider
            to inspect edges, then crop to the subject, add padding, a drop
            shadow, or a sticker outline. Download a transparent PNG or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#auto-background-removal-tool">
            auto background removal tool
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
            <strong>Batch-of-one catalogs</strong> — Let the model clear a shelf behind each item as you photograph them.
          </li>
          <li>
            <strong>Family albums</strong> — Isolate a relative for a card without learning masks.
          </li>
          <li>
            <strong>App store shots</strong> — Lift a device off a wood table for a feature graphic.
          </li>
          <li>
            <strong>Menu specials</strong> — Clear a plate from a restaurant interior for a daily post.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="auto-background-removal" />
    </article>
  );
}
