import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Fast AI cutout",
    description:
      "Segment people, products, and graphics in one pass so the background transparent file keeps only the subject — no tracing by hand.",
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
      "Cutouts run locally with ONNX models. Photos stay on your device for private, free edits.",
  },
];

export default function BackgroundTransparentSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="background-transparent-features"
        title="Everything you need for a background transparent export"
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
          Getting a background transparent file should be simple: upload once,
          isolate the subject, then download. Focera keeps upload, cutout, and
          export on a single page with no account.
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
          <a href="#background-transparent-tool">background transparent tool</a>{" "}
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
            <strong>Online shop listings</strong> — Isolate a bottle, shoe, or
            gadget so it sits on a consistent catalog canvas.
          </li>
          <li>
            <strong>Print and presentation layouts</strong> — Drop a person or
            object onto posters, decks, and banners without leftover walls.
          </li>
          <li>
            <strong>Stories and profile art</strong> — Cut subjects free for
            stickers, covers, and round avatars.
          </li>
          <li>
            <strong>Team directories</strong> — Prepare headshots that can sit
            on any branded color or photo behind them.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="background-transparent" />
    </article>
  );
}
