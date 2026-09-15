import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Instant subject cutout",
    description:
      "AI segmentation pulls a person, product, or graphic off the scene so you can make a picture transparent and keep real alpha — no tracing by hand.",
  },
  {
    title: "Crop, shadow, and sticker outline",
    description:
      "Trim leftover empty space, add padding, drop a soft or hard shadow, or wrap the subject in a white, black, or custom stroke.",
  },
  {
    title: "PNG or WebP with true alpha",
    description:
      "Save a transparent PNG for the widest compatibility, or WebP when you need a smaller web-ready file.",
  },
  {
    title: "100% browser-based",
    description:
      "Cutouts run locally with ONNX models. Pictures stay on your device for private, free edits.",
  },
];

export default function MakePictureTransparentSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="make-picture-transparent-features"
        title="Everything you need to make a picture transparent"
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
          Making a picture transparent should stay simple: upload once, isolate
          the subject, then save. Focera keeps that path on one page with no
          account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your picture.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Run the cutout.</strong> Click Make background transparent
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
          <a href="#make-picture-transparent-tool">
            make picture transparent tool
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
            <strong>Marketplace listings</strong> — Lift a mug, shoe, or gadget
            off a busy table so it sits on a clean catalog canvas.
          </li>
          <li>
            <strong>Posters and decks</strong> — Place a person or object on a
            new layout without leftover walls behind them.
          </li>
          <li>
            <strong>Stories and covers</strong> — Cut subjects free for
            stickers, thumbnails, and outline graphics.
          </li>
          <li>
            <strong>Directory headshots</strong> — Prepare portraits that can
            sit on any branded color or photo.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="make-picture-transparent" />
    </article>
  );
}
