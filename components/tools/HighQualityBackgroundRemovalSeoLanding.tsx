import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Edges you can inspect",
    description:
      "Use the before/after slider on hair, straps, and bottle rims before you download.",
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

export default function HighQualityBackgroundRemovalSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="high-quality-background-removal-features"
        title="Everything you need in High Quality Background Removal"
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
          High-quality background removal here means a careful preview, not a mystery upscaler. Focera runs locally so you can check the cutout on this device.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Run high-quality removal.</strong> Click Make
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
          <a href="#high-quality-background-removal-tool">
            high quality background removal tool
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
            <strong>Lookbook garments</strong> — Keep stitching visible while the fitting-room wall disappears.
          </li>
          <li>
            <strong>Glassware</strong> — Inspect the rim after a bar shelf is cleared.
          </li>
          <li>
            <strong>Jewelry macros</strong> — Check prongs after a velvet tray is gone.
          </li>
          <li>
            <strong>Speaker key art</strong> — Confirm hair edges before a conference site goes live.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="high-quality-background-removal" />
    </article>
  );
}
