import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Maker output is a PNG of your ink",
    description:
      "This does not generate a fake autograph. It clears paper behind the signature you already wrote.",
  },
  {
    title: "Crop, shadow, and sticker outline",
    description:
      "Trim leftover empty space, add padding, drop a soft or hard shadow, or wrap the subject in a white, black, or custom stroke.",
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

export default function TransparentSignatureMakerSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="transparent-signature-maker-features"
        title="Everything you need in Transparent Signature Maker"
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
          A transparent signature maker here is cutout from your scan or photo. Keep original wet-ink copies when a process requires them.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Make a transparent signature.</strong> Click Make
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
          <a href="#transparent-signature-maker-tool">
            transparent signature maker tool
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
            <strong>Offer letters</strong> — Overlay ink on a digital letterhead.
          </li>
          <li>
            <strong>Permission slips</strong> — Place a parent mark on a school form template.
          </li>
          <li>
            <strong>Art prints</strong> — Sit a signed name on a poster border.
          </li>
          <li>
            <strong>Contract drafts</strong> — Use a PNG while a full e-sign flow is handled elsewhere.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="transparent-signature-maker" />
    </article>
  );
}
