import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Grid presets & custom splits",
    description:
      "Cut into 2×2, 3×3, 4×4, side-by-side, or set your own rows and columns up to 10×10.",
  },
  {
    title: "Live grid preview",
    description:
      "See how the image will be sliced before you cut — then browse every piece in a thumbnail strip.",
  },
  {
    title: "ZIP or single downloads",
    description:
      "Download one PNG piece or grab a ZIP of the full set, named by row and column.",
  },
  {
    title: "100% browser-based",
    description:
      "Splitting runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
];

export default function ImageSplitterLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="image-splitter-features"
        title="Everything you need in a free image splitter"
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
          Cutting a photo into pieces should be fast and private. Focera keeps
          the whole flow on one page — upload, choose a grid, preview the
          cuts, then download PNGs without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose the grid.</strong> Pick a preset like 2×2 or 3×3,
            or set custom rows and columns. The overlay shows where each piece
            will land.
          </li>
          <li>
            <strong>Split and download.</strong> Processing runs in your
            browser. Preview each piece, download one PNG, or save a ZIP of
            every tile.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#image-splitter-tool">image splitter</a> anytime to process
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
            <strong>Social carousels</strong> — Slice a wide graphic into
            equal frames for Instagram or LinkedIn posts.
          </li>
          <li>
            <strong>Puzzle and print tiles</strong> — Cut photos into a grid
            for crafts, wall art, or classroom activities.
          </li>
          <li>
            <strong>Sprite sheets and assets</strong> — Separate a sheet into
            individual PNGs for design or game workflows.
          </li>
          <li>
            <strong>Before/after pairs</strong> — Split a side-by-side image
            into two clean files with a 1×2 grid.
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
          split an image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/crop-image">Crop Image</Link> — Reframe a single
            area before or after splitting.
          </li>
          <li>
            <Link href="/combine-photo">Combine Photos</Link> — The inverse:
            stitch pieces back into one collage.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            width and height on a piece.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting PNG tiles.
          </li>
          <li>
            <Link href="/image-converter">Image Converter</Link> — Convert
            between PNG, JPG, and WebP when your destination needs a specific
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
