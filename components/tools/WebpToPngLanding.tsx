import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Extract every WebP frame",
    description:
      "Turn animated WebP “videos” into individual PNG frames you can preview, download singly, or save together as a ZIP.",
  },
  {
    title: "Transparency preserved",
    description:
      "PNG keeps alpha. Transparent stickers, logos, and UI assets stay clear — no white or black fill behind them.",
  },
  {
    title: "Still WebP supported too",
    description:
      "Drop a regular single-frame WebP and download one clean PNG — same private, local workflow.",
  },
  {
    title: "100% browser-based",
    description:
      "Decoding uses your browser’s WebCodecs stack. Your files stay on your device — nothing uploads to Focera.",
  },
];

export default function WebpToPngLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="webp-to-png-features"
        title="Everything you need in a free WebP to PNG converter"
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
          them on one page — upload, convert, preview, and download without an
          account or desktop installer. Transparency is kept in every PNG.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your WebP.</strong> Drag and drop an animated or
            still .webp file (up to 25 MB, max 300 frames), or click the zone to
            browse.
          </li>
          <li>
            <strong>Convert to PNG.</strong> Click Convert to PNG. Frames are
            decoded locally and encoded as lossless PNGs with alpha intact.
          </li>
          <li>
            <strong>Preview and download.</strong> Browse thumbnails, download
            the active frame, or grab a ZIP with every frame.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#webp-to-png-tool">WebP to PNG converter</a> anytime to
          process another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert WebP to PNG?
        </h2>
        <p>
          WebP is efficient for the web, but many design tools, printers, and
          CMS uploads expect PNG — especially when you need transparency or
          lossless frames from an animation. Exporting as PNG keeps sharp edges
          and clear backgrounds for stickers, logos, and UI assets.
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
            of a sticker, reaction, or short clip as separate PNGs.
          </li>
          <li>
            <strong>Keep transparency</strong> — Convert logos and cutouts to
            PNG so alpha channels survive in Photoshop, Figma, and Canva.
          </li>
          <li>
            <strong>Edit in classic tools</strong> — Open frames in apps that
            handle PNG more reliably than WebP.
          </li>
          <li>
            <strong>Convert still WebP photos</strong> — Turn a single WebP into
            a standard PNG for forms and uploads that reject WebP.
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
            <Link href="/webp-to-jpg">WebP to JPG</Link> — Convert WebP frames
            to JPEG when you need smaller files without transparency.
          </li>
          <li>
            <Link href="/webp-to-gif">WebP to GIF</Link> — Turn animated or still
            WebP into a looping GIF.
          </li>
          <li>
            <Link href="/webp-to-pdf">WebP to PDF</Link> — Turn WebP images into
            a multi-page PDF.
          </li>
          <li>
            <Link href="/jpg-to-png">JPG to PNG</Link> — Convert JPEG photos to
            lossless PNG.
          </li>
          <li>
            <Link href="/png-to-webp">PNG to WebP</Link> — Convert PNG images to
            smaller WebP files while keeping transparency.
          </li>
          <li>
            <Link href="/png-to-jpg">PNG to JPG</Link> — Convert PNG images to
            standard JPEG.
          </li>
          <li>
            <Link href="/make-background-transparent">
              Make Background Transparent
            </Link>{" "}
            — Remove a solid background and keep a clear PNG.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            file size after converting for email and uploads.
          </li>
          <li>
            <Link href="/pdf-to-png">PDF to PNG</Link> — Export PDF pages as PNG
            images.
          </li>
        </ul>
      </section>
    </article>
  );
}
