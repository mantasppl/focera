import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Alpha from a photo you already have",
    description:
      "This generator does not invent a picture from a prompt. It clears the backdrop of the file you upload so empty pixels remain.",
  },
  {
    title: "Crop, padding, and outline",
    description:
      "Crop to the subject, add padding, apply a drop shadow, or add a white, black, or custom sticker outline before you export.",
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

export default function TransparentImageGeneratorSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="transparent-image-generator-features"
        title="Everything you need in Transparent Image Generator"
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
          A transparent image generator here means cutout, not synthesis. Upload a JPG, PNG, or WebP, isolate the subject, and download a file with real alpha.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Generate the transparent image.</strong> Click Make
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
          <a href="#transparent-image-generator-tool">
            transparent image generator tool
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
            <strong>Existing product shots</strong> — Turn a camera JPEG into a PNG that composites on any color.
          </li>
          <li>
            <strong>Scanned doodles</strong> — Lift ink off paper so it can sit on a poster.
          </li>
          <li>
            <strong>Logo photos</strong> — Clear a wall behind a printed mark so it can sit on a slide.
          </li>
          <li>
            <strong>Sticker masters</strong> — Export a subject with empty pixels for print-on-demand.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="transparent-image-generator" />
    </article>
  );
}
