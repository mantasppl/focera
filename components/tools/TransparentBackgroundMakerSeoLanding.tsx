import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "AI subject isolation",
    description:
      "The transparent background maker finds people, products, and graphics in one click so you download a PNG with real alpha — no pen-tool tracing.",
  },
  {
    title: "Crop, shadow, and sticker outline",
    description:
      "Trim empty pixels, add padding, drop a soft or hard shadow, or wrap the subject in a white, black, or custom sticker stroke.",
  },
  {
    title: "PNG or WebP with true alpha",
    description:
      "Export a transparent PNG for compatibility, or WebP when you want a lighter file for the web.",
  },
  {
    title: "100% browser-based",
    description:
      "Your photos never leave your device. Cutouts run locally with ONNX models for private, free edits.",
  },
];

export default function TransparentBackgroundMakerSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="transparent-background-maker-features"
        title="Everything you need in a transparent background maker"
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
          A transparent background maker should stay out of the way: pick a
          file, isolate the subject, then save. Focera keeps that path on one
          page — upload, cutout, refine, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Make the cutout.</strong> Click Make background transparent
            to run AI cutout in your browser. A loading indicator shows model
            download and processing progress on the first visit.
          </li>
          <li>
            <strong>Refine and download.</strong> Use the before/after slider
            to inspect edges, then crop to the subject, add padding, a drop
            shadow, or a sticker outline. Download a transparent PNG or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#transparent-background-maker-tool">
            transparent background maker
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
            <strong>Packaging and catalog shots</strong> — Pull items off busy
            tables so they sit on a clean storefront canvas.
          </li>
          <li>
            <strong>Ads and landing pages</strong> — Place a person or product
            on campaign colors without a leftover room behind them.
          </li>
          <li>
            <strong>Stickers and social covers</strong> — Cut subjects free for
            stories, thumbnails, and outline graphics.
          </li>
          <li>
            <strong>ID and staff photos</strong> — Prepare headshots that can
            sit on any directory or badge template.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="transparent-background-maker" />
    </article>
  );
}
