import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Image in, PNG out, no invoice",
    description:
      "JPG, PNG, or WebP up to 10 MB. The remover does not meter downloads.",
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

export default function FreeImageBackgroundRemoverSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="free-image-background-remover-features"
        title="Everything you need in Free Image Background Remover"
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
          A free image background remover should still protect the original file. Focera runs cutout in your browser with no signup.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the image background.</strong> Click Make
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
          <a href="#free-image-background-remover-tool">
            free image background remover tool
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
            <strong>Hobby shops</strong> — Clear a workbench behind a 3D print you will list.
          </li>
          <li>
            <strong>PTA flyers</strong> — Isolate a kid activity photo for a school PDF.
          </li>
          <li>
            <strong>Band posters</strong> — Lift a musician off a rehearsal-room wall.
          </li>
          <li>
            <strong>Recipe blogs</strong> — Cut a plated dish free from a home kitchen.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="free-image-background-remover" />
    </article>
  );
}
