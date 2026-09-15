import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Still images for a composition",
    description:
      "Removal is the extract step. Type, grid, and brand stay in your design file.",
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

export default function DesignImageBackgroundRemovalSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="design-image-background-removal-features"
        title="Everything you need in Design Image Background Removal"
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
          Design image background removal should give you a clean plate. Focera isolates locally so you can place the PNG on the artboard you already have.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the design image background.</strong> Click Make
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
          <a href="#design-image-background-removal-tool">
            design image background removal tool
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
            <strong>Mood boards</strong> — Sit a product on a palette without the original room.
          </li>
          <li>
            <strong>Case-study headers</strong> — Place a device on a chapter color.
          </li>
          <li>
            <strong>Outdoor-to-studio</strong> — Clear a sidewalk behind apparel.
          </li>
          <li>
            <strong>Icon-plus-photo</strong> — Align a real object next to a pictogram.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="design-image-background-removal" />
    </article>
  );
}
