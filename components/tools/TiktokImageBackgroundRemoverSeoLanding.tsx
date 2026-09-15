import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Still cutouts for a vertical canvas",
    description:
      "Clear a room behind a person or product so a cover, carousel, or profile image can use a solid color.",
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

export default function TiktokImageBackgroundRemoverSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="tiktok-image-background-remover-features"
        title="Everything you need in Tiktok Image Background Remover"
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
          This TikTok image background remover does not open TikTok. You download a PNG here and attach it in the app.
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
          <a href="#tiktok-image-background-remover-tool">
            tiktok image background remover tool
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
            <strong>Cover stills</strong> — Place a creator on a color that matches on-screen text.
          </li>
          <li>
            <strong>Product carousels</strong> — Isolate an item from a bedroom shoot.
          </li>
          <li>
            <strong>Profile photos</strong> — Clear a messy room behind a face.
          </li>
          <li>
            <strong>Spark ads stills</strong> — Export a clean subject for a still that leads a video.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="tiktok-image-background-remover" />
    </article>
  );
}
