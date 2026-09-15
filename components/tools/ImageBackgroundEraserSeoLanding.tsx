import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Erase the scene, keep the subject",
    description:
      "The eraser is a one-pass cutout, not a pixel-by-pixel clone stamp. Review the edge, then download.",
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

export default function ImageBackgroundEraserSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="image-background-eraser-features"
        title="Everything you need in Image Background Eraser"
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
          An image background eraser should not require a tablet and a tiny brush. Focera runs AI cutout locally and keeps export on this page.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Erase the background.</strong> Click Make
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
          <a href="#image-background-eraser-tool">
            image background eraser tool
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
            <strong>Cluttered desks</strong> — Erase monitors and cables behind a gadget you are selling.
          </li>
          <li>
            <strong>Yard sales</strong> — Erase grass and fences behind furniture for a cleaner post.
          </li>
          <li>
            <strong>Party photos</strong> — Erase a crowded room behind one person for an invite.
          </li>
          <li>
            <strong>Whiteboard shots</strong> — Erase a wall so a prototype sits on a deck background.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="image-background-eraser" />
    </article>
  );
}
