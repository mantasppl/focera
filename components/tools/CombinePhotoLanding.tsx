import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Side by side, stacked, or grid",
    description:
      "Combine two or more photos into one collage — horizontal strips, vertical stacks, or an auto grid for three to nine images.",
  },
  {
    title: "Reorder before you export",
    description:
      "Move photos up or down in the list so the collage reads left-to-right and top-to-bottom exactly how you want.",
  },
  {
    title: "Gap, fit, and background",
    description:
      "Add spacing between cells, fill or fit each photo, and choose a white, black, or transparent PNG background.",
  },
  {
    title: "100% browser-based",
    description:
      "Combining runs locally on your device. Your photos never upload to Focera servers — private by design.",
  },
];

export default function CombinePhotoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="combine-photo-features"
        title="Everything you need in a free photo combiner"
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
          Building a photo collage should be fast and private. Focera keeps the
          whole flow on one page — upload, arrange, combine, preview, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photos.</strong> Drag and drop two or more JPG,
            PNG, or WebP files (up to 10 MB each), or click the zone to browse.
            Add up to nine photos per collage.
          </li>
          <li>
            <strong>Choose layout and style.</strong> Pick side by side,
            stacked, or grid. Adjust gap, fill vs fit, and background color.
            Reorder the list until the sequence looks right.
          </li>
          <li>
            <strong>Combine and download.</strong> Processing runs in your
            browser. Preview the collage, then download a PNG ready for social,
            slides, or print.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#combine-photo-tool">combine photo tool</a> anytime to make
          another collage.
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
            <strong>Before and after</strong> — Place two photos side by side
            for renovations, edits, or product comparisons.
          </li>
          <li>
            <strong>Social carousels as one image</strong> — Merge a few frames
            into a single post-ready collage.
          </li>
          <li>
            <strong>Trip or event grids</strong> — Arrange four to nine photos
            in a clean grid for albums and invitations.
          </li>
          <li>
            <strong>Slides and reports</strong> — Stack screenshots or product
            shots into one shareable PNG.
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
          combine photos, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/add-images-to-image">Add Images to Image</Link> —
            Layer logos or stickers on a single photo instead of a collage.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            dimensions for the finished collage.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size before uploading to social or email.
          </li>
          <li>
            <Link href="/image-to-pdf">Image to PDF</Link> — Turn photos or a
            collage into a multi-page or single-page PDF.
          </li>
          <li>
            <Link href="/profile-photo-maker">Profile Photo Maker</Link> —
            Crop a single photo into a square or circle avatar.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects before arranging them in a collage.
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
