import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "PNG that actually composites",
    description:
      "Download a PNG (or WebP) whose empty pixels other editors and browsers honor.",
  },
  {
    title: "Crop, padding, and outline",
    description:
      "Crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom sticker outline before you export.",
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

export default function TransparentBackgroundPngSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="transparent-background-png-features"
        title="Everything you need in Transparent Background PNG"
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
          A transparent background PNG should not be a checkerboard baked into RGB. Focera writes alpha locally after cutout.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Make a transparent background PNG.</strong> Click Make
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
          <a href="#transparent-background-png-tool">
            transparent background png tool
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
            <strong>CSS heroes</strong> — Let a page background show through around a product.
          </li>
          <li>
            <strong>Marketplace rules</strong> — Meet a template that wants PNG with no scene.
          </li>
          <li>
            <strong>Print partners</strong> — Send a file a RIP can treat as a knockout.
          </li>
          <li>
            <strong>Ad builders</strong> — Place an item on a video poster frame.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="transparent-background-png" />
    </article>
  );
}
