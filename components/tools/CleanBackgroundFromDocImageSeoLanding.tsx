import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "A tidier still for a page",
    description:
      "Remove desk clutter and walls so the remaining subject can sit on letterhead color.",
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

export default function CleanBackgroundFromDocImageSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="clean-background-from-doc-image-features"
        title="Everything you need in Clean Background from Doc Image"
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
          Cleaning a background from a doc image should not rewrite the document. You still place the PNG in Word, Google Docs, or a PDF tool.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Clean the document image background.</strong> Click Make
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
          <a href="#clean-background-from-doc-image-tool">
            clean background from doc image tool
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
            <strong>Policy covers</strong> — Clear a lobby behind a building photo.
          </li>
          <li>
            <strong>Training PDFs</strong> — Isolate a tool from a bench.
          </li>
          <li>
            <strong>Board packets</strong> — Sit an executive portrait on a divider color — not an ID authority.
          </li>
          <li>
            <strong>SOP figures</strong> — Remove a messy shop from behind a machine.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="clean-background-from-doc-image" />
    </article>
  );
}
