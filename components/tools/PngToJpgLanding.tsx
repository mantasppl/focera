import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "PNG to JPG in seconds",
    description:
      "Turn PNG images into standard JPG files that are smaller, widely supported, and easy to share by email or upload.",
  },
  {
    title: "Batch convert multiple PNGs",
    description:
      "Upload up to 20 PNG files at once. One image downloads as JPG; batches download as a ZIP.",
  },
  {
    title: "Choose JPEG quality",
    description:
      "Pick Smaller, Balanced, or High so you control file size versus detail before downloading.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function PngToJpgLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="png-to-jpg-features"
        title="Everything you need in a free PNG to JPG converter"
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
          PNG is great for graphics with transparency, but JPG is often better
          for photos and uploads that need a smaller file. Focera converts PNG
          to JPG on one page — upload, choose quality, convert, and download
          without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PNG files.</strong> Drag and drop .png images
            (up to 10 MB each), or click the zone to browse. Add up to 20 files
            per conversion.
          </li>
          <li>
            <strong>Choose JPEG quality.</strong> Balanced is a solid default.
            Use Smaller for email and forms, or High when you want more detail.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to JPG.
            Processing runs locally — one image downloads as a .jpg; multiple
            images download as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#png-to-jpg-tool">PNG to JPG converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert PNG to JPG?
        </h2>
        <p>
          JPG (JPEG) usually produces smaller files for photographs and complex
          images. Many websites, forms, and messaging apps prefer or require
          JPEG. Converting PNG to JPG makes sharing and uploading simpler when
          you do not need transparency.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="transparency"
      >
        <h2 id="transparency" className="tool-content__heading">
          What Happens to Transparent Areas?
        </h2>
        <p>
          JPEG does not support transparency. Transparent PNG pixels are filled
          with a white background so the JPG looks correct in viewers, editors,
          and email clients.
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
            <strong>Web and form uploads</strong> — Meet site requirements that
            only accept JPG or JPEG.
          </li>
          <li>
            <strong>Email attachments</strong> — Convert screenshots or exports
            into smaller JPGs that preview inline.
          </li>
          <li>
            <strong>Social and messaging</strong> — Share photos that open
            everywhere without PNG bloat.
          </li>
          <li>
            <strong>Print and Office</strong> — Drop converted images into Word,
            PowerPoint, and design tools that expect JPEG.
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
          Your PNG files are converted entirely in your browser. Focera does not
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
            <Link href="/png-to-eps">PNG to EPS</Link> — Wrap PNG images in
            Encapsulated PostScript for print workflows.
          </li>
          <li>
            <Link href="/png-to-gif">PNG to GIF</Link> — Turn PNG images into
            still or animated GIFs for chat and uploads.
          </li>
          <li>
            <Link href="/png-to-webp">PNG to WebP</Link> — Convert PNG images to
            smaller WebP files while keeping transparency.
          </li>
          <li>
            <Link href="/jpg-to-png">JPG to PNG</Link> — Convert JPEG photos
            into lossless PNG files.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            JPG file size after converting for email and uploads.
          </li>
          <li>
            <Link href="/webp-to-jpg">WebP to JPG</Link> — Convert WebP images
            (including animated frames) to JPEG.
          </li>
          <li>
            <Link href="/heic-to-jpg">HEIC to JPG</Link> — Turn iPhone HEIC
            photos into standard JPG files.
          </li>
          <li>
            <Link href="/psd-to-jpg">PSD to JPG</Link> — Flatten Photoshop PSD
            files into standard JPEG images.
          </li>
          <li>
            <Link href="/tiff-to-jpg">TIFF to JPG</Link> — Convert .tif / .tiff
            scans, including multi-page files, into JPEG.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Combine PNG images into
            a multi-page PDF instead.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Set exact pixel
            dimensions for web, profiles, and print.
          </li>
        </ul>
      </section>
    </article>
  );
}
