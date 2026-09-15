import FeatureGrid from "@/components/tools/FeatureGrid";
import MoreWaysToUseThisTool from "@/components/tools/MoreWaysToUseThisTool";

const FEATURES = [
  {
    title: "A face that sits on any theme",
    description:
      "Clear the room behind you so a round avatar or a directory tile can use brand color.",
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

export default function RemoveBackgroundForProfilePicSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-background-for-profile-pic-features"
        title="Everything you need in Remove Background for Profile Pic"
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
          Removing a background for a profile pic should not require a studio. Focera isolates the person locally so you can composite the PNG in your site or app.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the background for a profile pic.</strong> Click Make
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
          <a href="#remove-background-for-profile-pic-tool">
            remove background for profile pic tool
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
            <strong>Directory tiles</strong> — Sit everyone on the same color even if they shot at home.
          </li>
          <li>
            <strong>Chat avatars</strong> — Keep the face and drop a busy kitchen.
          </li>
          <li>
            <strong>Speaker pages</strong> — Place a person on a conference theme.
          </li>
          <li>
            <strong>Forum profiles</strong> — Export a PNG that will not flash a rectangle.
          </li>
        </ul>
      </section>

      <MoreWaysToUseThisTool currentSlug="remove-background-for-profile-pic" />
    </article>
  );
}
