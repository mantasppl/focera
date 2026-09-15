import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Short path to the file",
    description:
      "No extra mode picker before cutout. Upload, run, inspect the slider, download.",
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

export default function RemoveBackgroundFastSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-fast-features"
        title="Everything you need in Remove Background Fast"
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
          Removing a background fast still includes a one-time model download. After that, Focera keeps each extra file on this page with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the background fast.</strong> Click Make
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
          <a href="#remove-background-fast-tool">
            remove background fast tool
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
            <strong>Closing tabs at 5 p.m.</strong> — Clear a product shot before you leave the desk.
          </li>
          <li>
            <strong>Stand-up comps</strong> — Isolate an object during a short design huddle.
          </li>
          <li>
            <strong>Flash sales</strong> — Turn a phone photo into a PNG before the promo goes live.
          </li>
          <li>
            <strong>Support replies</strong> — Cut a part free to show a customer what to return.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-fast" />
    </article>
  );
}
