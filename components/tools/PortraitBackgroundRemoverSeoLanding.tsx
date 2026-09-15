import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "People as the subject",
    description:
      "The model looks for a person in the frame. Check hair and glasses with the slider, then download.",
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

export default function PortraitBackgroundRemoverSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="portrait-background-remover-features"
        title="Everything you need in Portrait Background Remover"
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
          A portrait background remover should stay on-device when the photo is of a colleague or a client. Focera runs locally with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the portrait background.</strong> Click Make
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
          <a href="#portrait-background-remover-tool">
            portrait background remover tool
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
            <strong>Team grids</strong> — Unify staff photos shot in different rooms.
          </li>
          <li>
            <strong>Author pages</strong> — Clear a cafe behind a writer.
          </li>
          <li>
            <strong>Coaching sites</strong> — Isolate a trainer from a gym mirror wall.
          </li>
          <li>
            <strong>Wedding vendors</strong> — Place a planner on a brand color.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="portrait-background-remover" />
    </article>
  );
}
