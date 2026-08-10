import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "True circle crop",
    description:
      "Export a round PNG with a transparent edge — ready for avatars, stickers, product badges, and circular UI frames.",
  },
  {
    title: "Size presets",
    description:
      "One-click sizes from 128 to 2048 px, or enter any custom diameter so the circle matches your layout.",
  },
  {
    title: "Drag to reframe",
    description:
      "Zoom and pan so faces and subjects stay centered. The circular preview matches what you download.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
];

export default function RoundImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="round-image-features"
        title="Everything you need in a free round image maker"
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
          Making a circular image should be fast and private. Focera keeps the
          whole flow on one page — upload, frame, export, and download without
          an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Frame the circle.</strong> Pick a size preset or enter a
            custom diameter. Drag and zoom to center the subject inside the
            round preview.
          </li>
          <li>
            <strong>Export and download.</strong> Processing runs in your
            browser. Preview the circular PNG with transparent edges, then save
            it for web, social, or design work.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#round-image-tool">round image tool</a> anytime to process
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
            <strong>Circular avatars</strong> — Cut photos into a clean circle
            for chat apps, forums, and profile widgets.
          </li>
          <li>
            <strong>Stickers and badges</strong> — Make round product shots or
            logo marks with a transparent background.
          </li>
          <li>
            <strong>Website UI</strong> — Produce consistent circular images for
            team pages, testimonials, and cards.
          </li>
          <li>
            <strong>Social graphics</strong> — Frame headshots and subjects for
            round story highlights and profile layouts.
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
          make a round image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/profile-photo-maker">Profile Photo Maker</Link> —
            Square or circle crops sized for LinkedIn, Instagram, and Discord.
          </li>
          <li>
            <Link href="/crop-image">Crop Image</Link> — Rectangular freeform
            or locked-ratio crops when you need a non-circle frame.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out the subject before framing a cleaner circle.
          </li>
          <li>
            <Link href="/make-background-transparent">
              Make Background Transparent
            </Link>{" "}
            — Soften edges further for stickers and overlays.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting your round PNG.
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
