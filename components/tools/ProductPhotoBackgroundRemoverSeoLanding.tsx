import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Built for pack shots",
    description:
      "Bottles, boxes, apparel, and gadgets isolate in one pass so catalog grids stay consistent.",
  },
  {
    title: "Crop, padding, and outline",
    description:
      "Crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom sticker outline before you export.",
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

export default function ProductPhotoBackgroundRemoverSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="product-photo-background-remover-features"
        title="Everything you need in Product Photo Background Remover"
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
          A product photo background remover should survive messy tables. Focera clears the scene in your browser and writes PNG or WebP.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the product photo background.</strong> Click Make
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
          <a href="#product-photo-background-remover-tool">
            product photo background remover tool
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
            <strong>Kitchen candles</strong> — Lift a jar off a cutting board for a shop tile.
          </li>
          <li>
            <strong>Shoe boxes</strong> — Clear a hallway behind footwear.
          </li>
          <li>
            <strong>Tech unboxings</strong> — Isolate a device from packing paper.
          </li>
          <li>
            <strong>Apparel hangers</strong> — Separate a shirt from a closet door.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="product-photo-background-remover" />
    </article>
  );
}
