import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const features = [
  {
    title: "Instant AI cutouts",
    description:
      "Advanced segmentation removes backgrounds from portraits, products, and graphics in seconds — no manual masking required.",
  },
  {
    title: "100% browser-based",
    description:
      "Your photos never leave your device. Processing runs locally with ONNX models, keeping client work and personal images private.",
  },
  {
    title: "Transparent PNG export",
    description:
      "Download a clean PNG with alpha transparency, ready for e-commerce listings, social posts, presentations, and design tools.",
  },
  {
    title: "Portrait background blur",
    description:
      "Apply a pro-style depth effect — keep your subject sharp while softly blurring the original scene, with an adjustable intensity slider.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a JPG, PNG, or WebP file onto the upload zone or browse from your device. A before/after slider helps you verify quality.",
  },
];

export default function BackgroundRemoverLanding() {
  return (
    <>
      <FeatureGrid
        id="bg-remover-features"
        title="Features"
        features={features}
      />

      <article className="tool-content">
        <section
          className="tool-content__section"
          aria-labelledby="how-it-works"
        >
          <h2 id="how-it-works" className="tool-content__heading">
            How It Works
          </h2>
          <p>
            Removing a background online should be fast, predictable, and free.
            Focera&apos;s AI background remover keeps the entire workflow on one
            page — upload, process, compare, and download without creating an
            account or installing desktop software.
          </p>
          <ol className="tool-content__steps">
            <li>
              <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
              WebP file up to 10 MB, or click the upload zone to browse. Your
              original preview appears immediately on the right.
            </li>
            <li>
              <strong>Remove the background.</strong> Click Remove background to
              run AI segmentation in your browser. A loading indicator shows
              model download and processing progress on the first visit.
            </li>
            <li>
              <strong>Compare and download.</strong> Use the before/after slider
              to inspect edges and fine details, then download a transparent PNG
              for your project.
            </li>
          </ol>
          <p>
            Jump back to the{" "}
            <a href="#background-remover-tool">background remover tool</a> at
            any time to process another file.
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
              <strong>E-commerce product photos</strong> — Place items on clean
              storefront backgrounds or composite them into marketing layouts.
            </li>
            <li>
              <strong>Social media graphics</strong> — Cut out subjects for
              stories, thumbnails, and profile images without a design subscription.
            </li>
            <li>
              <strong>Presentations and documents</strong> — Drop transparent
              PNGs into slides, proposals, and PDF exports.
            </li>
            <li>
              <strong>Profile and ID photos</strong> — Prepare headshots for
              LinkedIn, team directories, and internal tools.
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
            Focera groups fast, privacy-friendly utilities in one hub. After
            you remove a background, these tools often fit the same workflow:
          </p>
          <ul className="tool-content__list">
            <li>
              <Link href="/upscale-image">Upscale Image</Link> — Increase
              resolution before or after exporting transparent PNGs.
            </li>
            <li>
              <Link href="/remove-watermark">Remove Watermark</Link> — Brush
              out logos or text overlays from photos you own.
            </li>
            <li>
              <Link href="/image-compressor">Image Compressor</Link> — Reduce
              file size before or after exporting transparent PNGs.
            </li>
            <li>
              <Link href="/image-converter">Image Converter</Link> — Convert
              between PNG, JPG, and WebP when your destination requires a
              specific format.
            </li>
            <li>
              <Link href="/tools">All tools</Link> — Browse every free utility
              in the Focera catalog.
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
