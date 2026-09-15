import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Paper and bed disappear",
    description:
      "A scan often includes a gray border or a desk edge. Cutout keeps the drawing, stamp, or object.",
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

export default function RemoveBackgroundFromScanSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-from-scan-features"
        title="Everything you need in Remove Background from Scan"
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
          Removing background from a scan is for a PNG overlay. Focera does not run OCR or rebuild a multi-page PDF.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the scan background.</strong> Click Make
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
          <a href="#remove-background-from-scan-tool">
            remove background from scan tool
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
            <strong>Sketch scans</strong> — Lift pencil off a notebook page.
          </li>
          <li>
            <strong>Receipt logos</strong> — Clear thermal paper behind a printed mark.
          </li>
          <li>
            <strong>Stamp scans</strong> — Isolate ink from a form photocopy.
          </li>
          <li>
            <strong>Small-object scans</strong> — Lift a coin or pin off the scanner glass.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-from-scan" />
    </article>
  );
}
