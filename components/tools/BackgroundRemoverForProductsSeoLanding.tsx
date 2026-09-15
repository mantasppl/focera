import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Products, not just portraits",
    description:
      "Boxes, bottles, garments, and gadgets are valid subjects. Review the edge, then download.",
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

export default function BackgroundRemoverForProductsSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="background-remover-for-products-features"
        title="Everything you need in Background Remover for Products"
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
          A background remover for products should not assume a face. Focera isolates still-life subjects locally for catalog work.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the product background.</strong> Click Make
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
          <a href="#background-remover-for-products-tool">
            background remover for products tool
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
            <strong>Cosmetics</strong> — Lift a compact off a bathroom shelf.
          </li>
          <li>
            <strong>Hardware</strong> — Clear a pegboard behind a tool.
          </li>
          <li>
            <strong>Groceries</strong> — Isolate a bag from a pantry.
          </li>
          <li>
            <strong>Toys</strong> — Separate a figure from a playroom floor.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="background-remover-for-products" />
    </article>
  );
}
