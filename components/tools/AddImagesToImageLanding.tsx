import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Layer logos, stamps & stickers",
    description:
      "Place PNG, JPG, or WebP overlays on a base photo with position, size, opacity, and rotation controls.",
  },
  {
    title: "Live composite preview",
    description:
      "See overlays update as you tweak settings — then export a full-resolution PNG when it looks right.",
  },
  {
    title: "Multiple overlays per image",
    description:
      "Add up to five overlays, reorder stacking, and configure each one independently.",
  },
  {
    title: "100% browser-based",
    description:
      "Compositing runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
];

export default function AddImagesToImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="add-images-to-image-features"
        title="Everything you need to overlay images"
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
          Putting a logo, watermark, or sticker on a photo should be fast and
          private. Focera keeps the whole flow on one page — upload a base
          image, add overlays, preview the composite, then download without an
          account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your base image.</strong> Drag and drop a JPG, PNG,
            or WebP file up to 10 MB, or click the zone to browse from your
            device.
          </li>
          <li>
            <strong>Add overlay images.</strong> Drop one or more logos,
            stamps, or cutouts. Select each overlay to set position, size,
            opacity, and rotation.
          </li>
          <li>
            <strong>Compose and download.</strong> Processing runs in your
            browser. Preview live, then save a PNG with every overlay baked in.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#add-images-to-image-tool">add images to image tool</a>{" "}
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
            <strong>Brand watermarks</strong> — Stamp a logo or mark on product
            photos before sharing online.
          </li>
          <li>
            <strong>Social stickers</strong> — Layer PNG stickers or badges on
            portraits and graphics.
          </li>
          <li>
            <strong>Before/after badges</strong> — Drop a transparent label onto
            marketing or real-estate shots.
          </li>
          <li>
            <strong>Mockups</strong> — Place artwork onto a template photo for
            quick client previews.
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
          overlay images, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/combine-photo">Combine Photos</Link> — Side-by-side or
            grid collage instead of layered overlays.
          </li>
          <li>
            <Link href="/add-text-on-image">Add Text on Image</Link> — Stamp
            captions and labels with fonts and colors.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out a subject, then layer it onto another photo.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting your PNG.
          </li>
          <li>
            <Link href="/pdf-watermark">PDF Watermark</Link> — Stamp an image
            watermark across PDF pages instead.
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
