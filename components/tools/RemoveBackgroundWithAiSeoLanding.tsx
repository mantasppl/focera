import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "AI does the isolation",
    description:
      "You still choose crop, shadow, and outline. The model handles the hard split between subject and scene.",
  },
  {
    title: "Crop, shadow, and sticker outline",
    description:
      "Trim leftover empty space, add padding, drop a soft or hard shadow, or wrap the subject in a white, black, or custom stroke.",
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

export default function RemoveBackgroundWithAiSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-with-ai-features"
        title="Everything you need in Remove Background with AI"
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
          Removing a background with AI should not mean giving up the original file. Focera infers locally and you download on this page.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the background with AI.</strong> Click Make
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
          <a href="#remove-background-with-ai-tool">
            remove background with ai tool
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
            <strong>Hair and fur</strong> — Let the model separate strands from a bright window.
          </li>
          <li>
            <strong>Transparent bottles</strong> — Isolate glass from a store fridge.
          </li>
          <li>
            <strong>Foliage products</strong> — Lift a plant pot off a patio.
          </li>
          <li>
            <strong>Patterned clothes</strong> — Keep fabric print while a busy mall disappears.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-with-ai" />
    </article>
  );
}
