import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Horizontal or vertical",
    description:
      "Mirror a photo left–right, top–bottom, or both axes — useful for selfies, layouts, and matching a design’s orientation.",
  },
  {
    title: "Instant live preview",
    description:
      "See the flip as soon as you pick a direction. Export when it looks right — no extra steps or desktop software.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and flipped PNG with a slider, then download a file ready for design, social, or print.",
  },
];

export default function FlipImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="flip-image-features"
        title="Everything you need in a free image flipper"
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
          Flipping a photo should be fast and private. Focera keeps the whole
          flow on one page — upload, choose a direction, preview, and download
          without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Pick a direction.</strong> Horizontal mirrors left and
            right, vertical mirrors top and bottom, and both flips both axes.
          </li>
          <li>
            <strong>Flip and download.</strong> Processing runs in your
            browser. Compare with the before/after slider, then download a PNG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#flip-image-tool">image flipper</a> anytime to process
          another file.
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
            <strong>Selfies and portraits</strong> — Mirror a photo so text
            or a pose matches how it looked in a front-facing camera.
          </li>
          <li>
            <strong>Design and mockups</strong> — Flip product shots or
            screenshots to fit a layout without reshooting.
          </li>
          <li>
            <strong>Print and crafts</strong> — Create a reversed image for
            iron-on transfers, vinyl, or stencil work.
          </li>
          <li>
            <strong>Social posts</strong> — Match a mirrored composition
            across a carousel or side-by-side collage.
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
          flip an image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/crop-image">Crop Image</Link> — Reframe the photo
            after you mirror it.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            width and height for the flipped PNG.
          </li>
          <li>
            <Link href="/round-image">Round Image</Link> — Crop to a circle
            with a transparent edge for avatars and badges.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting a flipped PNG.
          </li>
          <li>
            <Link href="/png-to-jpg">PNG to JPG Converter</Link> — Convert
            PNG images to JPEG when your destination needs a smaller photo
            format.
          </li>
          <li>
            <Link href="/tools">All tools</Link> — Browse every free utility
            in the Focera catalog.
          </li>
        </ul>
      </section>
    </article>
  );
}
