import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "Directory photos without the room",
    description:
      "Clear the scene so a CRM, LMS, or company org chart can use one background color.",
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

export default function ProfilePhotoBackgroundRemoverSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="profile-photo-background-remover-features"
        title="Everything you need in Profile Photo Background Remover"
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
          A profile photo background remover should be safe for internal portraits. Focera keeps the file in the browser during cutout.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the profile photo background.</strong> Click Make
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
          <a href="#profile-photo-background-remover-tool">
            profile photo background remover tool
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
            <strong>HR directories</strong> — Unify photos from home offices.
          </li>
          <li>
            <strong>Alumni pages</strong> — Clear a campus lawn behind a graduate.
          </li>
          <li>
            <strong>Creator bios</strong> — Place a host on channel art color.
          </li>
          <li>
            <strong>Customer success pages</strong> — Sit a CSM on a product-site theme.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="profile-photo-background-remover" />
    </article>
  );
}
