import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Avatar from a real photo",
    description:
      "This maker does not draw a cartoon from a prompt. It clears the backdrop of the picture you upload.",
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

export default function TransparentAvatarMakerSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="transparent-avatar-maker-features"
        title="Everything you need in Transparent Avatar Maker"
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
          A transparent avatar maker here is cutout. Upload a head-and-shoulders shot, isolate the person, and download PNG or WebP.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Make a transparent avatar.</strong> Click Make
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
          <a href="#transparent-avatar-maker-tool">
            transparent avatar maker tool
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
            <strong>Slack-style tiles</strong> — Place a person on a workspace color.
          </li>
          <li>
            <strong>Game overlays</strong> — Sit a webcam-style bust on a stream scene later.
          </li>
          <li>
            <strong>Course platforms</strong> — Drop instructors onto a lesson theme.
          </li>
          <li>
            <strong>Support widgets</strong> — Use a cutout in a chat bubble graphic.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="transparent-avatar-maker" />
    </article>
  );
}
