import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "A dedicated removal page",
    description:
      "Not a full photo suite. Upload, isolate, refine, download — that is the tool.",
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

export default function ImageBackgroundRemovalToolSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="image-background-removal-tool-features"
        title="Everything you need in Image Background Removal Tool"
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
          An image background removal tool should stay narrow so it stays fast. Focera keeps that loop on one page with no account.
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
          <a href="#image-background-removal-tool-tool">
            image background removal tool tool
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
            <strong>Asset pipelines</strong> — Clear a still before it goes into a layout tool.
          </li>
          <li>
            <strong>CMS uploads</strong> — Isolate a hero object so the theme color shows through.
          </li>
          <li>
            <strong>Pitch appendices</strong> — Cut a prototype free for a deck appendix.
          </li>
          <li>
            <strong>Support macros</strong> — Export a part PNG for a help-center article.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="image-background-removal-tool" />
    </article>
  );
}
