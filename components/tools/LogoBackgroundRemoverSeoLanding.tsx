import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Photo of a logo in, alpha out",
    description:
      "Not a vector tracer. The remover clears the scene around the mark you photographed or scanned.",
  },
  {
    title: "Crop, shadow, and sticker outline",
    description:
      "Trim leftover empty space, add padding, drop a soft or hard shadow, or wrap the subject in a white, black, or custom stroke.",
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

export default function LogoBackgroundRemoverSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="logo-background-remover-features"
        title="Everything you need in Logo Background Remover"
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
          A logo background remover here is cutout. If you need paths, use a drawing tool after you export the PNG.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Remove the logo background.</strong> Click Make
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
          <a href="#logo-background-remover-tool">
            logo background remover tool
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
            <strong>Vehicle wraps photos</strong> — Lift a door mark off a van panel.
          </li>
          <li>
            <strong>Embroidery photos</strong> — Clear a shirt behind a stitched crest.
          </li>
          <li>
            <strong>Window clings</strong> — Isolate a mark from glass reflections as much as the model allows.
          </li>
          <li>
            <strong>Event step-and-repeats</strong> — Cut a sponsor mark from a media wall.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-tools"
      >
        <h2 id="related-tools" className="tool-content__heading">
          Related Free Tools
        </h2>
        <p>
          Focera groups fast, privacy-friendly utilities in one hub. After this logo background remover, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/background-remover">Background Remover</Link> — Full
            remover with optional color, image, or blur export modes.
          </li>
          <li>
            <Link href="/change-background">Change Background</Link> — Swap in
            a solid color or custom photo after cutout.
          </li>
          <li>
            <Link href="/blur-background">Blur Background</Link> — Soften the
            original scene with adjustable portrait-style depth blur.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution before or after exporting transparent PNGs.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size for web uploads and messaging apps.
          </li>
          <li>
            <Link href="/tools">All tools</Link> — Browse every free utility in
            the Focera catalog.
          </li>
        </ul>
      </section>
    </article>
  );
}
