import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Professional bust, empty pixels",
    description:
      "Keep the person, drop the office wall, then sit the PNG on a studio color your site already uses.",
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

export default function RemoveBackgroundForHeadshotSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-for-headshot-features"
        title="Everything you need in Remove Background for Headshot"
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
          Removing a background for a headshot is for web and print comps. It is not a passport bureau — follow any official photo rules separately.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the headshot background.</strong> Click Make
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
          <a href="#remove-background-for-headshot-tool">
            remove background for headshot tool
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
            <strong>Firm websites</strong> — Line partners up on one color despite different offices.
          </li>
          <li>
            <strong>Speaker bios</strong> — Clear a hotel lamp from behind a guest.
          </li>
          <li>
            <strong>Press kits</strong> — Export a PNG editors can place on a magazine color.
          </li>
          <li>
            <strong>Badge lanyards</strong> — Sit a face on the print template color.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-for-headshot" />
    </article>
  );
}
