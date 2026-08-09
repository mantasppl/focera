import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "One-click transparent cutout",
    description:
      "AI segmentation clears the background from portraits, products, and graphics so you get a clean PNG with alpha — no manual masking.",
  },
  {
    title: "100% browser-based",
    description:
      "Your photos never leave your device. Cutouts run locally with ONNX models for private, free edits.",
  },
  {
    title: "True alpha PNG export",
    description:
      "Download a transparent PNG ready for e-commerce listings, Canva/Figma layouts, slides, and social graphics.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original photo with the transparent result using a slider, then download when edges look right.",
  },
];

export default function MakeBackgroundTransparentLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="make-background-transparent-features"
        title="Everything you need for a transparent background"
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
          Making a photo background transparent should be fast, private, and
          free. Focera keeps the whole workflow on one page — upload, clear the
          background, compare, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Make the background transparent.</strong> Click Make
            background transparent to run AI cutout in your browser. A loading
            indicator shows model download and processing progress on the first
            visit.
          </li>
          <li>
            <strong>Compare and download.</strong> Use the before/after slider
            to inspect edges, then download a transparent PNG for your project.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#make-background-transparent-tool">
            make background transparent tool
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
            <strong>Product photos for stores</strong> — Clear busy shelves so
            items sit on white or branded storefront backgrounds.
          </li>
          <li>
            <strong>Design and marketing layouts</strong> — Drop subjects into
            Canva, Figma, or presentation slides without a hard rectangle.
          </li>
          <li>
            <strong>Social graphics and stickers</strong> — Cut out people and
            objects for stories, thumbnails, and profile images.
          </li>
          <li>
            <strong>Headshots and ID photos</strong> — Prepare transparent
            cutouts for team pages, badges, and composite backgrounds.
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
          Focera groups fast, privacy-friendly utilities in one hub. After you
          make a background transparent, these tools often fit the same
          workflow:
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
