import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Photo in, empty pixels out",
    description:
      "The original scene is discarded as alpha. The subject remains for a new color, texture, or layout.",
  },
  {
    title: "Crop, padding, and outline",
    description:
      "Crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom sticker outline before you export.",
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

export default function RemoveBackgroundFromPhotoSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-from-photo-features"
        title="Everything you need in Remove Background from Photo"
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
          Removing background from a photo should not require a studio sweep. Focera isolates the subject locally and keeps download on this page.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove background from the photo.</strong> Click Make
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
          <a href="#remove-background-from-photo-tool">
            remove background from photo tool
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
            <strong>Balcony plants</strong> — Lift a planter off a railing for a shop grid.
          </li>
          <li>
            <strong>Couch portraits</strong> — Clear cushions behind a person for a speaker tile.
          </li>
          <li>
            <strong>Driveway sales</strong> — Isolate a bike from asphalt and houses.
          </li>
          <li>
            <strong>Desk setups</strong> — Cut a keyboard free from a messy cable nest.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-from-photo" />
    </article>
  );
}
