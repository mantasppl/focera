import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Add a border to any photo",
    description:
      "Frame JPG, PNG, and WebP images with a clean colored border for prints, social posts, portfolios, and mockups.",
  },
  {
    title: "Width and color you control",
    description:
      "Pick Thin, Medium, Thick, or Extra padding, then choose White, Black, Gray, Cream, Navy, or Forest.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your photos never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and bordered result with a slider, then download a PNG ready to share or print.",
  },
];

export default function AddBorderToImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="add-border-to-image-features"
        title="Everything you need in a free add border to image tool"
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
          Adding a border to a photo should be fast and private. Focera keeps
          the whole flow on one page — upload, choose width and color, preview,
          and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Pick width and color.</strong> Thin through Extra scales
            with your image size. White and cream suit prints; black and navy
            suit social frames.
          </li>
          <li>
            <strong>Add border and download.</strong> Processing runs in your
            browser. Compare with the before/after slider, then download a PNG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#add-border-to-image-tool">add border to image tool</a>{" "}
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
            <strong>Prints and frames</strong> — Add a white or cream mat
            before sending a photo to a print shop or gallery wall.
          </li>
          <li>
            <strong>Social posts</strong> — Give carousel slides and story
            graphics a consistent edge so they stand out in feeds.
          </li>
          <li>
            <strong>Portfolios and lookbooks</strong> — Frame product or
            editorial shots with a matching border for a polished set.
          </li>
          <li>
            <strong>Mockups and presentations</strong> — Drop bordered images
            into slides and decks without opening a desktop editor.
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
          add a border to an image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/resize-image">Resize Image</Link> — Scale the bordered
            result for web, email, or print sizes.
          </li>
          <li>
            <Link href="/crop-image">Crop Image</Link> — Trim the photo before
            framing so the subject sits where you want.
          </li>
          <li>
            <Link href="/add-text-on-image">Add Text on Image</Link> — Overlay
            captions or labels after framing.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size before sharing or uploading elsewhere.
          </li>
          <li>
            <Link href="/combine-photo">Combine Photos</Link> — Build a collage
            of bordered shots side by side or in a grid.
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
