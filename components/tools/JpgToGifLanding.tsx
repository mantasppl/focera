import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "JPG to GIF in seconds",
    description:
      "Turn JPEG photos into GIF files for chat, email, and sites that still expect .gif. One image becomes a still GIF; several can become an animation.",
  },
  {
    title: "Make an animated GIF from photos",
    description:
      "Drop up to 20 JPG or JPEG files, reorder the frames, pick a delay, and export one looping GIF.",
  },
  {
    title: "Size and color controls",
    description:
      "Choose Small, Medium, or Large output and 64–256 colors so you can balance quality against file size.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function JpgToGifLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="jpg-to-gif-features"
        title="Everything you need in a free JPG to GIF converter"
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
          GIF is still the easiest way to share a short loop in chat and docs.
          Focera converts JPG to GIF on one page — upload, convert, and download
          without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your JPG files.</strong> Drag and drop .jpg or .jpeg
            images (up to 10 MB each), or click the zone to browse. Add up to 20
            files per conversion.
          </li>
          <li>
            <strong>Choose output.</strong> One photo becomes a still GIF.
            Several photos default to one animated GIF — or switch to Separate
            GIFs for a ZIP of individual files. Set size, colors, and frame
            delay as needed.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to GIF.
            Encoding runs locally in your browser. Preview the result, then
            download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#jpg-to-gif-tool">JPG to GIF converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert JPG to GIF?
        </h2>
        <p>
          JPEG is great for photos, but many messengers, forums, and CMS fields
          still ask for GIF. Converting JPG to GIF lets you share a still image
          or a simple photo slideshow where GIF playback is built in.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="animated"
      >
        <h2 id="animated" className="tool-content__heading">
          Can I Make an Animated GIF From JPGs?
        </h2>
        <p>
          Yes. Upload two or more JPG files and keep Animated GIF selected.
          Reorder the list so frames play in the right sequence, pick a delay
          (0.1s to 1s), and convert. Frames with different aspect ratios are
          letterboxed so the animation stays aligned.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="file-size"
      >
        <h2 id="file-size" className="tool-content__heading">
          Will the GIF Be Larger Than the JPG?
        </h2>
        <p>
          Often yes for photos. GIF is limited to 256 colors and is not as
          efficient as JPEG for still photography. Smaller output size and
          fewer colors keep the file lighter. For video clips, use{" "}
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
            <strong>Chat and email</strong> — Share a still or looping GIF that
            plays inline in messengers and docs.
          </li>
          <li>
            <strong>Photo slideshows</strong> — Turn a handful of JPGs into a
            short looping animation for social posts.
          </li>
          <li>
            <strong>Uploads that require GIF</strong> — Meet forms and CMSs that
            only accept .gif.
          </li>
          <li>
            <strong>Before-and-after</strong> — Drop two photos and let them
            alternate as a simple comparison GIF.
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
          Your JPG files are converted entirely in your browser. Focera does not
          receive the images, store results, or run conversion on a remote
          server. When you leave the page, object URLs are revoked and nothing
          remains on our infrastructure.
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
            <Link href="/png-to-gif">PNG to GIF</Link> — Turn PNG screenshots
            and graphics into still or animated GIFs.
          </li>
          <li>
            <Link href="/webp-to-gif">WebP to GIF</Link> — Turn animated or still
            WebP into a looping GIF.
          </li>
          <li>
            <Link href="/video-to-gif">Video to GIF</Link> — Turn an MP4, WebM,
            or MOV clip into an animated GIF.
          </li>
          <li>
            <Link href="/gif-to-mp4">GIF to MP4</Link> — Convert a GIF into a
            smaller MP4 for sharing.
          </li>
          <li>
            <Link href="/jpg-to-png">JPG to PNG</Link> — Convert JPEG photos to
            lossless PNG files.
          </li>
          <li>
            <Link href="/jpg-to-webp">JPG to WebP</Link> — Shrink JPEGs into
            smaller WebP files.
          </li>
          <li>
            <Link href="/gif-to-pdf">GIF to PDF</Link> — Place GIF frames or
            stills into a PDF.
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
