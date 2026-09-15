import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Any still image you can upload",
    description:
      "JPG, PNG, or WebP up to 10 MB. People, products, and graphics all go through the same cutout control.",
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

export default function BackgroundRemoverForImagesSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="background-remover-for-images-features"
        title="Everything you need in Background Remover for Images"
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
          A background remover for images should not care whether the file came from a camera or an export. Focera keeps the workflow on one page with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the image background.</strong> Click Make
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
          <a href="#background-remover-for-images-tool">
            background remover for images tool
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
            <strong>Mixed asset folders</strong> — Clear a JPEG product and a PNG icon with the same steps.
          </li>
          <li>
            <strong>Screenshot objects</strong> — Lift a UI element photo off a monitor glare.
          </li>
          <li>
            <strong>Scanned sketches</strong> — Separate pencil from paper texture.
          </li>
          <li>
            <strong>Archive photos</strong> — Isolate a person from an old print you just photographed.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="background-remover-for-images" />
    </article>
  );
}
