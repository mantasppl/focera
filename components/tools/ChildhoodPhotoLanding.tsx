import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Turn any portrait into a 90s memory",
    description:
      "Upload a clear face photo and get a nostalgic childhood look — warm flash, soft grain, and imperfect framing that feels pulled from a real family album.",
  },
  {
    title: "Face-preserving AI",
    description:
      "Built on an IP-Adapter face model so the generated photo keeps the same person and identity while restyling the era, lighting, and film vibe.",
  },
  {
    title: "Three ready-made vibes",
    description:
      "Choose 90s family album, school portrait, or disposable camera. Each preset uses a tuned prompt for flash, grain, and composition quirks.",
  },
  {
    title: "Free 90s photo generator",
    description:
      "Generate and download childhood-style photos online with no account, watermark, or install. Compare before and after, then save a share-ready image.",
  },
];

export default function ChildhoodPhotoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="90s-photo-generator-features"
        title="Everything you need in a free 90s photo generator"
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
          Turning your photo into a 90s childhood memory should feel simple.
          Focera keeps the whole flow on one page — upload, pick a vibe,
          generate, compare, and download without signing up.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload a clear face photo.</strong> Drag and drop a JPG,
            PNG, or WebP up to 10 MB. Front-facing portraits with a visible face
            work best for identity-preserving results.
          </li>
          <li>
            <strong>Pick a childhood vibe.</strong> Choose 90s family album,
            school portrait, or disposable camera — each adds nostalgic flash,
            grain, and imperfect framing.
          </li>
          <li>
            <strong>Generate and download.</strong> AI restyles the photo into a
            childhood memory look. Compare with the before/after slider, then
            download your free 90s photo.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#90s-photo-generator-tool">90s photo generator</a> anytime
          to try another preset.
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
            <strong>Nostalgia posts</strong> — Make a throwback avatar or reel
            cover that looks like a real childhood snapshot.
          </li>
          <li>
            <strong>Birthday and reunion invites</strong> — Turn adult portraits
            into playful 90s school or family-album cards.
          </li>
          <li>
            <strong>Creative mood boards</strong> — Explore disposable-camera
            grain and flash for design or storytelling projects.
          </li>
          <li>
            <strong>Gifts and prints</strong> — Download a childhood-style photo
            for scrapbooks, frames, or party decorations.
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
          After you generate a 90s childhood photo, these Focera tools often fit
          the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/ai-image-generator">AI Image Generator</Link> — Create
            brand-new scenes from text when you need a fresh visual.
          </li>
          <li>
            <Link href="/colorize-photo">Colorize Photo</Link> — Add natural
            color to real black &amp; white archive photos.
          </li>
          <li>
            <Link href="/black-and-white-photo">Black and White Photo</Link> —
            Convert a color shot to grayscale for a different retro mood.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution before printing your generated memory.
          </li>
          <li>
            <Link href="/profile-photo-maker">Profile Photo Maker</Link> —
            Crop the result into a clean avatar size.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size before sharing or uploading elsewhere.
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
