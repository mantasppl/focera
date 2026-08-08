import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "AI subject cutout",
    description:
      "Advanced segmentation isolates people, products, and objects so the background can soft-blur while your subject stays crisp.",
  },
  {
    title: "Adjustable portrait blur",
    description:
      "Dial blur intensity from a light haze to a strong bokeh look — perfect for headshots, product shots, and social photos.",
  },
  {
    title: "100% browser-based",
    description:
      "Your photos never leave your device. Cutout and blur compositing run locally with ONNX models for private, free edits.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original photo with the blurred background using a slider, then download a ready-to-use PNG.",
  },
];

export default function BlurBackgroundLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="blur-background-features"
        title="Everything you need for portrait-style background blur"
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
          Softening a busy photo background should be fast, private, and free.
          Focera keeps the whole workflow on one page — upload, blur the
          background, fine-tune intensity, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the upload zone to browse. Your
            original preview appears immediately on the right.
          </li>
          <li>
            <strong>Blur the background.</strong> Click Blur background to run
            AI cutout in your browser, then drag the intensity slider until the
            scene looks right.
          </li>
          <li>
            <strong>Compare and download.</strong> Use the before/after slider
            to inspect the result, then download a PNG for your project.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#blur-background-tool">blur background tool</a> anytime to
          process another file.
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
            <strong>Headshots and profiles</strong> — Soften cluttered rooms
            for LinkedIn, team pages, and ID-style photos.
          </li>
          <li>
            <strong>Product photography</strong> — Keep the item sharp while
            dialing down distracting shelves or table clutter.
          </li>
          <li>
            <strong>Social posts and stories</strong> — Add instant portrait
            depth to selfies and lifestyle shots without a DSLR lens.
          </li>
          <li>
            <strong>Video call stills</strong> — Clean up desk backgrounds for
            thumbnails, bios, and presentation slides.
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
          blur a background, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/change-background">Change Background</Link> — Swap in
            a solid color or custom photo instead of blur.
          </li>
          <li>
            <Link href="/background-remover">Background Remover</Link> —
            Export a transparent PNG cutout without compositing.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution before or after blurring backgrounds.
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
