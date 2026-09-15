import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "A subject for a letter or form",
    description:
      "Clear a desk or wall behind an image you will drop into a PDF or a Word-style layout later.",
  },
  {
    title: "Crop, shadow, and sticker outline",
    description:
      "Trim empty pixels, add padding, drop a soft or hard shadow, or wrap the subject in a white, black, or custom sticker stroke.",
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

export default function RemoveBackgroundForDocumentsSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-for-documents-features"
        title="Everything you need in Remove Background for Documents"
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
          Removing a background for documents is a PNG export. Focera does not edit the PDF itself — you place the cutout in your document tool.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the background for documents.</strong> Click Make
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
          <a href="#remove-background-for-documents-tool">
            remove background for documents tool
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
            <strong>Letterheads</strong> — Sit a photographed seal on a page color.
          </li>
          <li>
            <strong>Reports</strong> — Place a prototype on a cover without the lab bench.
          </li>
          <li>
            <strong>Invoices-adjacent</strong> — Isolate a product for a line-item illustration.
          </li>
          <li>
            <strong>Handouts</strong> — Clear a classroom wall behind a diagram photo.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-for-documents" />
    </article>
  );
}
