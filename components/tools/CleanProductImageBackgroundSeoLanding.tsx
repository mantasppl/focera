import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Catalogs look neater with empty pixels",
    description:
      "Aisle clutter and table clutter disappear so the SKU is the only object.",
  },
  {
    title: "Crop, shadow, and sticker outline",
    description:
      "Trim empty pixels, add padding, drop a soft or hard shadow, or wrap the subject in a white, black, or custom sticker stroke.",
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

export default function CleanProductImageBackgroundSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="clean-product-image-background-features"
        title="Everything you need in Clean Product Image Background"
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
          Cleaning a product image background should not bleach the item. Focera isolates the product locally and leaves crop tools for a tight tile.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Clean the product background.</strong> Click Make
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
          <a href="#clean-product-image-background-tool">
            clean product image background tool
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
            <strong>Warehouse aisles</strong> — Clean pallet wrap out from behind a carton.
          </li>
          <li>
            <strong>Kitchen tables</strong> — Clean crumbs and towels out from behind a jar.
          </li>
          <li>
            <strong>Garage floors</strong> — Clean oil stains out from behind a tool.
          </li>
          <li>
            <strong>Retail endcaps</strong> — Clean neighboring SKUs out of the frame.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="clean-product-image-background" />
    </article>
  );
}
