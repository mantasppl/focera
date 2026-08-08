import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Brush over people to remove",
    description:
      "Paint precisely over a person, photobomber, or crowd member. Adjust brush size and erase mistakes before restoring the photo.",
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

export default function RemovePersonLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="remove-person-features"
        title="Everything you need to remove a person from a photo"
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
          Removing a person from a photo should be fast and private. Focera
          keeps the whole flow on one page — upload, mark, restore, compare, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Paint over the person.</strong> Use the brush to cover
            whoever you want gone. Switch to Erase to trim the mask, and adjust
            brush size for edges and small details.
          </li>
          <li>
            <strong>Remove and download.</strong> Click Remove person.
            Processing runs in your browser. Compare with the before/after
            slider, then download a cleaned PNG.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#remove-person-tool">person remover</a> anytime to clean
          another photo.
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
            <strong>Travel and vacation photos</strong> — Clear strangers or
            photobombers from landmarks and scenic shots.
          </li>
          <li>
            <strong>Group and event photos</strong> — Remove someone who walked
            into the frame or no longer belongs in the shot.
          </li>
          <li>
            <strong>Personal photo cleanup</strong> — Erase people from family
            pictures, portraits, or candid moments before sharing.
          </li>
          <li>
            <strong>Real estate and listings</strong> — Remove people from
            property photos before publishing.
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
          remove a person, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/remove-objects">Remove Objects</Link> — Brush out
            clutter, poles, trash, or other distractions.
          </li>
          <li>
            <Link href="/remove-watermark">Remove Watermark</Link> — Brush out
            logos and text overlays specifically.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects after cleaning the frame.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution before or after person removal.
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
