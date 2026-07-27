import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Brush over watermarks",
    description:
      "Paint precisely over logos, stamps, or text overlays. Adjust brush size and erase mistakes before restoring the photo.",
  },
  {
    title: "Smart local restoration",
    description:
      "Marked pixels are rebuilt from surrounding detail so backgrounds, skies, and textures blend back in naturally.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs on your device. Photos never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and cleaned result with a slider, then download a PNG ready for editing or sharing.",
  },
];

export default function RemoveWatermarkLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-watermark-features"
        title="Everything you need in a free watermark remover"
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
          Removing a watermark should be fast and private. Focera keeps the
          whole flow on one page — upload, mark, restore, compare, and download
          without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Paint over the watermark.</strong> Use the brush to cover
            logos or text. Switch to Erase to trim the mask, and adjust brush
            size for small details.
          </li>
          <li>
            <strong>Remove and download.</strong> Click Remove watermark.
            Processing runs in your browser. Compare with the before/after
            slider, then download a cleaned PNG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#remove-watermark-tool">watermark remover</a> anytime to
          clean another photo.
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
            <strong>Your own stock exports</strong> — Clean preview watermarks
            from images you purchased or created once you have usage rights.
          </li>
          <li>
            <strong>Screenshots and mockups</strong> — Remove accidental UI
            stamps or overlay text before sharing a design review.
          </li>
          <li>
            <strong>Personal photo cleanup</strong> — Erase date stamps, camera
            logos, or app overlays from family photos you own.
          </li>
          <li>
            <strong>Marketing assets</strong> — Tidy graphics you control before
            placing them into ads, decks, or listings.
          </li>
        </ul>
        <p>
          Only remove watermarks from images you own or have permission to edit.
        </p>
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
          clean a photo, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects after cleaning overlays.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution before or after watermark removal.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting a cleaned PNG.
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
