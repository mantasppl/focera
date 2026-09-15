import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "A subject that will composite",
    description:
      "Export alpha so posters, slides, and web blocks can show their own paper or color.",
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

export default function RemoveBackgroundForDesignSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-for-design-features"
        title="Everything you need in Remove Background for Design"
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
          Removing a background for design should leave a file a layout tool can place. Focera writes PNG or WebP locally after cutout.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the background for design.</strong> Click Make
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
          <a href="#remove-background-for-design-tool">
            remove background for design tool
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
            <strong>Poster stacks</strong> — Sit a person on illustrated type without a photo rectangle.
          </li>
          <li>
            <strong>Pitch decks</strong> — Place a prototype on a dark slide.
          </li>
          <li>
            <strong>Web heroes</strong> — Let a CSS gradient show through around a product.
          </li>
          <li>
            <strong>Packaging comps</strong> — Drop a bottle onto a dieline preview.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-for-design" />
    </article>
  );
}
