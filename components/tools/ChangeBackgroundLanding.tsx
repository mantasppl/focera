import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "AI subject cutout",
    description:
      "Advanced segmentation isolates people, products, and objects so you can drop them onto a new background in seconds.",
  },
  {
    title: "Color, photo, or blur",
    description:
      "Replace the scene with a solid color, upload a custom backdrop, or apply a portrait-style blur to the original background.",
  },
  {
    title: "100% browser-based",
    description:
      "Your photos never leave your device. Cutout and compositing run locally with ONNX models for private, free edits.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original photo with your new background using a slider, then download a ready-to-use PNG.",
  },
];

export default function ChangeBackgroundLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="change-background-features"
        title="Everything you need to change an image background"
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
          Changing a photo background should be fast, private, and free. Focera
          keeps the whole workflow on one page — upload, cut out the subject,
          pick a new backdrop, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Change the background.</strong> Click Change background to
            run AI cutout in your browser, then choose a solid color, custom
            image, or portrait blur.
          </li>
          <li>
            <strong>Compare and download.</strong> Use the before/after slider
            to inspect the result, then download a PNG for your project.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#change-background-tool">change background tool</a> anytime
          to process another file.
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
            <strong>Product photography</strong> — Place items on clean white,
            brand-colored, or lifestyle backdrops for store listings.
          </li>
          <li>
            <strong>Headshots and profiles</strong> — Soften busy rooms with
            blur or swap in a studio-style color for LinkedIn and team pages.
          </li>
          <li>
            <strong>Marketing creatives</strong> — Drop subjects onto campaign
            scenes, textures, or seasonal backgrounds without a design suite.
          </li>
          <li>
            <strong>Social posts and thumbnails</strong> — Refresh old photos
            with new scenes for stories, covers, and YouTube stills.
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
          change a background, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/background-remover">Background Remover</Link> —
            Export a transparent PNG cutout without compositing a new scene.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution before or after swapping backgrounds.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size for web uploads and messaging apps.
          </li>
          <li>
            <Link href="/remove-watermark">Remove Watermark</Link> — Brush out
            logos or text overlays from photos you own.
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
