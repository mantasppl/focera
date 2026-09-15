import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "One-pass AI cutout",
    description:
      "Isolate a person, product, or graphic so you can make an image transparent and keep a PNG with real alpha — no manual masking.",
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

export default function MakeImageTransparentSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="make-image-transparent-features"
        title="Everything you need to make an image transparent"
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
          When you need to make an image transparent, the job should stay on
          one screen. Focera handles upload, cutout, refine, and download
          without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Clear the backdrop.</strong> Click Make background
            transparent to run AI cutout in your browser. A loading indicator
            shows model download and processing progress on the first visit.
          </li>
          <li>
            <strong>Refine and download.</strong> Use the before/after slider
            to inspect edges, then crop to the subject, add padding, a drop
            shadow, or a sticker outline. Download a transparent PNG or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#make-image-transparent-tool">make image transparent tool</a>{" "}
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
            <strong>Storefront product shots</strong> — Lift items off cluttered
            shelves so they sit on a consistent listing canvas.
          </li>
          <li>
            <strong>Slides and posters</strong> — Place a subject on a new
            layout without dragging the original room along with it.
          </li>
          <li>
            <strong>Thumbnails and stickers</strong> — Cut people and objects
            free for covers, stories, and outline graphics.
          </li>
          <li>
            <strong>Staff and profile photos</strong> — Prepare headshots that
            can sit on any branded color or photo behind them.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="make-image-transparent" />
    </article>
  );
}
