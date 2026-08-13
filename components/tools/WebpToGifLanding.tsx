import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Animated WebP to GIF",
    description:
      "Turn looping WebP stickers, reactions, and short clips into a GIF that plays in chat, email, and forums.",
  },
  {
    title: "Still WebP supported too",
    description:
      "Drop a single-frame WebP and download a still .gif for uploads that still expect GIF.",
  },
  {
    title: "Size and color controls",
    description:
      "Choose Small, Medium, or Large output and 64–256 colors so you can balance quality against file size.",
  },
  {
    title: "100% browser-based",
    description:
      "Decoding and encoding run on your device. Nothing uploads to Focera.",
  },
];

export default function WebpToGifLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="webp-to-gif-features"
        title="Everything you need in a free WebP to GIF converter"
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
          GIF is still the easiest way to share a short loop. Focera converts
          WebP to GIF on one page — upload, convert, and download without an
          account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your WebP.</strong> Drag and drop an animated or
            still .webp file (up to 25 MB, max 300 frames), or click the zone to
            browse.
          </li>
          <li>
            <strong>Choose size and colors.</strong> Medium size and Medium
            quality are solid defaults. Use Small and Low for chat, or Large
            and High when you want more detail.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to GIF.
            Encoding runs locally in your browser. Preview the result, then
            download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#webp-to-gif-tool">WebP to GIF converter</a> anytime to
          process another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert WebP to GIF?
        </h2>
        <p>
          WebP is efficient, but many messengers, forums, and CMS fields still
          play GIF more reliably than animated WebP. Converting WebP to GIF
          lets you share stickers, memes, and short loops where GIF playback is
          built in.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="animated"
      >
        <h2 id="animated" className="tool-content__heading">
          Does It Keep the Animation?
        </h2>
        <p>
          Yes. Animated WebP files are decoded frame by frame and encoded as a
          looping GIF. Frame timing from the source is preserved. A still WebP
          downloads as a single-frame GIF.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="file-size"
      >
        <h2 id="file-size" className="tool-content__heading">
          Will the GIF Be Larger Than the WebP?
        </h2>
        <p>
          Often yes. GIF is limited to 256 colors and is less efficient than
          WebP, especially for photos and long animations. Smaller output size
          and fewer colors keep the file lighter. For video clips, use{" "}
          <Link href="/video-to-gif">Video to GIF</Link> instead.
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
            <strong>Chat and email</strong> — Share a looping GIF that plays
            inline in messengers and docs.
          </li>
          <li>
            <strong>Stickers and reactions</strong> — Convert animated WebP
            stickers into GIF for apps that do not play WebP.
          </li>
          <li>
            <strong>Uploads that require GIF</strong> — Meet forms and CMSs that
            only accept .gif.
          </li>
          <li>
            <strong>Still WebP photos</strong> — Turn a single-frame WebP into a
            still GIF when that is the required format.
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
            <Link href="/webp-to-jpg">WebP to JPG</Link> — Extract every WebP
            frame as JPEG.
          </li>
          <li>
            <Link href="/webp-to-png">WebP to PNG</Link> — Convert WebP frames
            to PNG with transparency preserved.
          </li>
          <li>
            <Link href="/video-to-gif">Video to GIF</Link> — Turn an MP4, WebM,
            or MOV clip into an animated GIF.
          </li>
          <li>
            <Link href="/png-to-gif">PNG to GIF</Link> — Turn PNG screenshots
            and graphics into still or animated GIFs.
          </li>
          <li>
            <Link href="/jpg-to-gif">JPG to GIF</Link> — Make a still or
            animated GIF from JPEG photos.
          </li>
          <li>
            <Link href="/gif-to-mp4">GIF to MP4</Link> — Convert a GIF into a
            smaller MP4 for sharing.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            file size after converting for email and uploads.
          </li>
        </ul>
      </section>
    </article>
  );
}
