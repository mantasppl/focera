import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Leave a tidy silhouette",
    description:
      "The scene is cleared to alpha so the subject can sit on a new canvas without leftover walls.",
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

export default function CleanBackgroundFromImageSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="clean-background-from-image-features"
        title="Everything you need in Clean Background from Image"
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
          Cleaning a background from an image should not mean bleaching the photo white. Focera removes the scene to empty pixels you can composite.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Clean the background.</strong> Click Make
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
          <a href="#clean-background-from-image-tool">
            clean background from image tool
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
            <strong>White-wall leftovers</strong> — Remove a scuffed studio wall that still photographs gray.
          </li>
          <li>
            <strong>Store aisles</strong> — Clean shelves out from behind a bottle.
          </li>
          <li>
            <strong>Home offices</strong> — Clean a bookcase out from behind a gadget.
          </li>
          <li>
            <strong>Event booths</strong> — Clean banners out from behind a product demo.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="clean-background-from-image" />
    </article>
  );
}
