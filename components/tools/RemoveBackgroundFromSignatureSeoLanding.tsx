import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Ink stays, paper goes",
    description:
      "Photograph or scan a signature on paper, then export empty pixels so it can sit on a letter.",
  },
  {
    title: "Crop, padding, and outline",
    description:
      "Crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom sticker outline before you export.",
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

export default function RemoveBackgroundFromSignatureSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-from-signature-features"
        title="Everything you need in Remove Background from Signature"
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
          Removing background from a signature is for a PNG overlay. It is not a legally certified e-sign product — use your own signing process for binding documents.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the signature background.</strong> Click Make
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
          <a href="#remove-background-from-signature-tool">
            remove background from signature tool
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
            <strong>Letter overlays</strong> — Place ink on a PDF that already has a signature line.
          </li>
          <li>
            <strong>Certificates</strong> — Sit a scanned name on a diploma template.
          </li>
          <li>
            <strong>Packing slips</strong> — Drop a mark onto a print layout.
          </li>
          <li>
            <strong>Internal memos</strong> — Use a PNG instead of a rectangular scan.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-from-signature" />
    </article>
  );
}
