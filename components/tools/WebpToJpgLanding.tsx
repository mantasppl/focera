import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Extract every WebP frame",
    description:
      "Turn animated WebP “videos” into individual JPG frames you can preview, download singly, or save together as a ZIP.",
  },
  {
    title: "Still WebP supported too",
    description:
      "Drop a regular single-frame WebP and download one clean JPG — same quality controls, same private workflow.",
  },
  {
    title: "JPEG quality controls",
    description:
      "Pick Smaller, Balanced, or High so exports match email, chat, or archival needs.",
  },
  {
    title: "100% browser-based",
    description:
      "Decoding uses your browser’s WebCodecs stack. Your files stay on your device — nothing uploads to Focera.",
  },
];

export default function WebpToJpgLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="webp-to-jpg-features"
        title="Everything you need in a free WebP to JPG converter"
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
          Animated WebP files pack many frames into one image. Focera demuxes
          them on one page — upload, choose quality, convert, preview, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your WebP.</strong> Drag and drop an animated or
            still .webp file (up to 25 MB, max 300 frames), or click the zone to
            browse.
          </li>
          <li>
            <strong>Choose JPEG quality.</strong> Balanced is a solid default.
            Use Smaller for chat and email, or High when you want more detail.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to JPG. Preview
            thumbnails, download the active frame, or grab a ZIP with every
            frame.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#webp-to-jpg-tool">WebP to JPG converter</a> anytime to
          process another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert WebP to JPG?
        </h2>
        <p>
          WebP is efficient for the web, but many apps, email clients, and
          editors still prefer JPEG — especially when you need individual
          frames from an animation. Exporting frames as JPG makes stickers,
          memes, and short clips easy to edit, attach, and share.
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
            <strong>Pull frames from animated WebP</strong> — Export every frame
            of a sticker, reaction, or short clip as separate JPGs.
          </li>
          <li>
            <strong>Edit in classic tools</strong> — Open frames in Photoshop,
            Paint, or Office apps that handle JPEG more reliably than WebP.
          </li>
          <li>
            <strong>Share widely</strong> — Attach or post JPGs that preview
            inline in email and messaging apps.
          </li>
          <li>
            <strong>Convert still WebP photos</strong> — Turn a single WebP into
            a standard JPG for forms and uploads.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="privacy"
      >
        <h2 id="privacy" className="tool-content__heading">
          Private by Design
        </h2>
        <p>
          Your WebP file is decoded and converted entirely in your browser.
          Focera does not receive the file, store results, or run conversion on
          a remote server. When you leave the page, object URLs are revoked and
          nothing remains on our infrastructure.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related"
      >
        <h2 id="related" className="tool-content__heading">
          Related Tools
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/webp-to-pdf">WebP to PDF</Link> — Turn WebP images into
            a multi-page PDF.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            JPG file size after converting for email and uploads.
          </li>
          <li>
            <Link href="/video-to-gif">Video to GIF</Link> — Convert short videos
            into animated GIFs.
          </li>
          <li>
            <Link href="/heic-to-jpg">HEIC to JPG</Link> — Convert iPhone HEIC
            photos to standard JPEG.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Export PDF pages as JPG
            images.
          </li>
        </ul>
      </section>
    </article>
  );
}
