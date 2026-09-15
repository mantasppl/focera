import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Arm's-length photos welcome",
    description:
      "A selfie still works as input. Isolate your face and shoulders, then sit the PNG on a new color.",
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

export default function RemoveBackgroundFromSelfieSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-from-selfie-features"
        title="Everything you need in Remove Background from Selfie"
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
          Removing background from a selfie should not require a second person holding a camera. Focera cuts out locally from the file you already have.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the selfie background.</strong> Click Make
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
          <a href="#remove-background-from-selfie-tool">
            remove background from selfie tool
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
            <strong>Story stickers</strong> — Cut yourself free for a reply sticker.
          </li>
          <li>
            <strong>Dating-app variants</strong> — Place the same face on a simpler canvas.
          </li>
          <li>
            <strong>Creator intros</strong> — Drop a bust onto a thumbnail layout.
          </li>
          <li>
            <strong>Club membership cards</strong> — Sit a face on a template color.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-from-selfie" />
    </article>
  );
}
