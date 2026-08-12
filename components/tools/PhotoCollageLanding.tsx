import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Template collage layouts",
    description:
      "Build photo collages with hero, magazine, grid, and stacked templates — mixed cell sizes, not just uniform grids.",
  },
  {
    title: "Ratios for every post",
    description:
      "Export square feed posts, 16:9 landscape, 3:4 portrait, or 9:16 stories from the same set of photos.",
  },
  {
    title: "Reorder, gap, and fit",
    description:
      "Control photo order, spacing, fill vs fit, and white, black, or transparent backgrounds before you download.",
  },
  {
    title: "100% browser-based",
    description:
      "Collages render locally on your device. Your photos never upload to Focera servers — private by design.",
  },
];

export default function PhotoCollageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="photo-collage-features"
        title="Everything you need in a free photo collage maker"
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
          Making a photo collage should be fast and private. Focera keeps the
          whole flow on one page — upload, pick a template, preview, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photos.</strong> Drag and drop two to six JPG,
            PNG, or WebP files (up to 10 MB each), or click the zone to browse.
          </li>
          <li>
            <strong>Choose a template and ratio.</strong> Pick a layout that
            matches your photo count, set square / landscape / portrait /
            story, then adjust gap, fit, and background.
          </li>
          <li>
            <strong>Create and download.</strong> Processing runs in your
            browser. Preview the collage, then download a PNG ready for social,
            slides, or print.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#photo-collage-tool">photo collage tool</a> anytime to make
          another layout.
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
            <strong>Instagram and TikTok posts</strong> — Drop trip or event
            photos into square or story-ready collages.
          </li>
          <li>
            <strong>Mood boards</strong> — Use magazine-style templates for
            design references and product lookbooks.
          </li>
          <li>
            <strong>Family and party albums</strong> — Arrange four to six
            moments into one shareable image.
          </li>
          <li>
            <strong>Before / after with context</strong> — Pair a hero shot with
            supporting frames in a left- or top-hero layout.
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
          make a collage, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/combine-photo">Combine Photos</Link> — Simple side by
            side, stacked, or even grid when you want uniform cells.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            dimensions for the finished collage.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink the
            PNG for email or social uploads.
          </li>
          <li>
            <Link href="/add-border-to-image">Add Border to Image</Link> — Frame
            the collage with a clean border.
          </li>
          <li>
            <Link href="/crop-image">Crop Image</Link> — Trim individual photos
            before placing them in a template.
          </li>
        </ul>
      </section>
    </article>
  );
}
