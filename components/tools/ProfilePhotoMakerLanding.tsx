import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Square or circle crop",
    description:
      "Export a classic square avatar or a circular PNG with a transparent edge — ready for sites that show round profile pictures.",
  },
  {
    title: "Platform size presets",
    description:
      "One-click sizes for LinkedIn, Instagram, X, Facebook, Discord, plus HD and retina options — or enter any custom pixel size.",
  },
  {
    title: "Drag to reframe",
    description:
      "Zoom and pan so faces stay centered. The crop preview matches what you download — no guessing after export.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your photos never upload to Focera servers — private by design.",
  },
];

export default function ProfilePhotoMakerLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="profile-photo-maker-features"
        title="Everything you need in a free profile photo maker"
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
          Turning a photo into a clean profile picture should be fast and
          private. Focera keeps the whole flow on one page — upload, frame,
          export, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your photo.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose shape and size.</strong> Pick circle or square, then
            select a platform preset or enter a custom pixel size. Drag and zoom
            to frame the subject.
          </li>
          <li>
            <strong>Create and download.</strong> Processing runs in your
            browser. Preview the result, then save a PNG ready for social,
            Slack, LinkedIn, or your website.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#profile-photo-maker-tool">profile photo maker</a> anytime
          to process another file.
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
            <strong>Social avatars</strong> — Crop headshots to the exact size
            Instagram, X, Facebook, and Discord expect.
          </li>
          <li>
            <strong>Professional profiles</strong> — Make a clean LinkedIn or
            company directory photo from a casual snapshot.
          </li>
          <li>
            <strong>Team and chat apps</strong> — Export circular PNGs that look
            sharp in Slack, Teams, Discord, and Zoom.
          </li>
          <li>
            <strong>Website bios</strong> — Produce consistent square or round
            headshots for about pages and author cards.
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
          make a profile photo, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out the subject before framing a cleaner avatar.
          </li>
          <li>
            <Link href="/change-background">Change Background</Link> —
            Swap the scene for a solid color or studio-style look.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Change exact width
            and height when you need a non-square size.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting your profile PNG.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution first if your source photo is small.
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
