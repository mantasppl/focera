import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Images that will live in a PDF",
    description:
      "Isolate the subject here. Insert the PNG with a PDF editor, merge tool, or export you already use.",
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

export default function RemoveBackgroundForPdfImagesSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-for-pdf-images-features"
        title="Everything you need in Remove Background for PDF Images"
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
          Removing a background for PDF images does not open the PDF on this page. Focera gives you a transparent still to drop into the document afterward.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the PDF image background.</strong> Click Make
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
          <a href="#remove-background-for-pdf-images-tool">
            remove background for pdf images tool
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
            <strong>Report covers</strong> — Sit a product on a PDF cover color.
          </li>
          <li>
            <strong>Spec sheets</strong> — Clear a bench behind a device photo.
          </li>
          <li>
            <strong>Portfolios</strong> — Place a piece on a page without the gallery wall.
          </li>
          <li>
            <strong>Handbooks</strong> — Isolate a tool for a procedure illustration.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-for-pdf-images" />
    </article>
  );
}
