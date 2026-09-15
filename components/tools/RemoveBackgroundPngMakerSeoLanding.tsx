import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Maker output is PNG (or WebP)",
    description:
      "The point of this maker is a file other apps treat as transparency, not a flattened JPEG.",
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

export default function RemoveBackgroundPngMakerSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-png-maker-features"
        title="Everything you need in Remove Background PNG Maker"
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
          A remove-background PNG maker should finish with alpha. Focera isolates the subject locally and lets you download PNG or WebP.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Make the transparent PNG.</strong> Click Make
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
          <a href="#remove-background-png-maker-tool">
            remove background png maker tool
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
            <strong>Feed images</strong> — Upload a PNG that will not flash a box on a dark theme.
          </li>
          <li>
            <strong>POS screens</strong> — Sit a product on a register color.
          </li>
          <li>
            <strong>3D mockups</strong> — Drop a label onto a bottle template.
          </li>
          <li>
            <strong>Comparison charts</strong> — Line up SKUs on one background in a slide.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-png-maker" />
    </article>
  );
}
