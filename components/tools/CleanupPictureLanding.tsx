import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Brush over what to clean",
    description:
      "Paint precisely over clutter, people, stamps, logos, or other distractions. Adjust brush size and erase mistakes before restoring the photo.",
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

export default function CleanupPictureLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="cleanup-picture-features"
        title="Everything you need in a free picture cleanup tool"
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
          Cleaning up a picture should be fast and private. Focera keeps the
          whole flow on one page — upload, mark, restore, compare, and download
          without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Paint over the area.</strong> Use the brush to cover
            whatever you want cleaned. Switch to Erase to trim the mask, and
            adjust brush size for small details.
          </li>
          <li>
            <strong>Cleanup and download.</strong> Click Cleanup picture.
            Processing runs in your browser. Compare with the before/after
            slider, then download a cleaned PNG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#cleanup-picture-tool">picture cleanup tool</a> anytime to
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
            <strong>Travel and vacation photos</strong> — Clear strangers,
            signs, or clutter from the background of shots you took.
          </li>
          <li>
            <strong>Product and listing images</strong> — Erase props, cables, or
            labels before uploading to a store or marketplace.
          </li>
          <li>
            <strong>Personal photo cleanup</strong> — Remove photobombers, date
            stamps, or small distractions from family pictures.
          </li>
          <li>
            <strong>Design and mockups</strong> — Brush out UI chrome or
            temporary objects before sharing a review.
          </li>
        </ul>
        <p>
          Only edit photos you own or have permission to change.
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
            <Link href="/remove-objects">Remove Objects</Link> — Brush out
            poles, trash, or other distractions from photos.
          </li>
          <li>
            <Link href="/remove-person">Remove Person</Link> — Brush out people
            or photobombers from photos.
          </li>
          <li>
            <Link href="/remove-watermark">Remove Watermark</Link> — Brush out
            logos and text overlays specifically.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects after cleaning distractions.
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
