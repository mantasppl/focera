import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Store images without the room they were shot in",
    description:
      "Removal is for the still you will upload, not a live connection to your cart platform.",
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

export default function EcommerceImageBackgroundRemovalSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="ecommerce-image-background-removal-features"
        title="Everything you need in Ecommerce Image Background Removal"
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
          Ecommerce image background removal here is a local PNG. You still add the file in your store admin after download.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the ecommerce image background.</strong> Click Make
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
          <a href="#ecommerce-image-background-removal-tool">
            ecommerce image background removal tool
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
            <strong>Variant colors</strong> — Shoot once on a table, then sit each colorway on the same canvas.
          </li>
          <li>
            <strong>Gift guides</strong> — Line up SKUs on one background in a blog block.
          </li>
          <li>
            <strong>Retargeting ads</strong> — Place the item on a campaign texture.
          </li>
          <li>
            <strong>Size charts adjacent</strong> — Keep the product isolated next to a diagram.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="ecommerce-image-background-removal" />
    </article>
  );
}
