import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "One-click backdrop clear",
    description:
      "AI segmentation isolates people, products, and graphics so you can clear a background and keep a PNG with real alpha — no manual masking.",
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

export default function ClearBackgroundSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="clear-background-features"
        title="Everything you need to clear a background"
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
          Clearing a background should stay fast and private. Focera keeps
          upload, cutout, refine, and download on one page with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Clear the background.</strong> Click Make background
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
          <a href="#clear-background-tool">clear background tool</a> anytime to
          process another file.
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
            <strong>Product listings</strong> — Clear busy shelves so items sit
            on a consistent storefront canvas.
          </li>
          <li>
            <strong>Marketing layouts</strong> — Place subjects on banners and
            slides without leftover rooms behind them.
          </li>
          <li>
            <strong>Social graphics</strong> — Cut people and objects free for
            stories, thumbnails, and stickers.
          </li>
          <li>
            <strong>Headshots</strong> — Prepare portraits that can sit on any
            branded color or photo.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="clear-background" />
    </article>
  );
}
