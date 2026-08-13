import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "TIFF to JPG in seconds",
    description:
      "Turn .tif and .tiff scans into standard JPG files that open in any browser, email client, or photo app.",
  },
  {
    title: "Multi-page TIFF support",
    description:
      "Each page in a multi-page TIFF becomes its own JPG. Batch-convert up to 20 files (100 pages total).",
  },
  {
    title: "Choose JPEG quality",
    description:
      "Pick Smaller, Balanced, or High so you control file size versus detail before downloading.",
  },
  {
    title: "100% browser-based",
    description:
      "Decoding and conversion run on your device. Nothing uploads to Focera.",
  },
];

export default function TiffToJpgLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="tiff-to-jpg-features"
        title="Everything you need in a free TIFF to JPG converter"
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
          TIFF is common for scans and archival images, but JPG is easier to
          share. Focera converts TIFF to JPG on one page — upload, choose
          quality, convert, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your TIFF files.</strong> Drag and drop .tif or
            .tiff images (up to 10 MB each), or click the zone to browse. Add
            up to 20 files per conversion.
          </li>
          <li>
            <strong>Choose JPEG quality.</strong> Balanced is a solid default.
            Use Smaller for email and forms, or High when you want more detail.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to JPG.
            Processing runs locally — one page downloads as a .jpg; multiple
            pages download as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#tiff-to-jpg-tool">TIFF to JPG converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert TIFF to JPG?
        </h2>
        <p>
          Many cameras, scanners, and document systems save TIFF. JPG (JPEG)
          files are smaller, preview inline in email, and are accepted by most
          websites and messaging apps. Converting TIFF to JPG makes sharing
          scans and photos simpler when you do not need lossless archival
          quality.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="multipage"
      >
        <h2 id="multipage" className="tool-content__heading">
          What Happens to Multi-page TIFFs?
        </h2>
        <p>
          JPEG is a single-image format. Each page inside a multi-page TIFF
          becomes a separate JPG (named with a page number). One page downloads
          as a .jpg; two or more pages download together as a ZIP.
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
          JPEG does not support transparency. Transparent TIFF pixels are filled
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
            <strong>Scans and paperwork</strong> — Convert office or home scans
            into JPGs for email, forms, and cloud storage.
          </li>
          <li>
            <strong>Web and form uploads</strong> — Meet site requirements that
            only accept JPG or JPEG.
          </li>
          <li>
            <strong>Photo sharing</strong> — Turn archival TIFFs into smaller
            files that open on phones and social apps.
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
          Your TIFF files are decoded and converted entirely in your browser.
          Focera does not receive the images, store results, or run conversion
          on a remote server. When you leave the page, object URLs are revoked
          and nothing remains on our infrastructure.
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
            <Link href="/jpg-to-tiff">JPG to TIFF</Link> — Convert JPEG photos
            into uncompressed .tif / .tiff files (the reverse of TIFF to JPG).
          </li>
          <li>
            <Link href="/tiff-to-pdf">TIFF to PDF</Link> — Convert .tif / .tiff
            scans into a multi-page PDF instead of JPEG images.
          </li>
          <li>
            <Link href="/png-to-jpg">PNG to JPG</Link> — Convert PNG images to
            JPEG with the same quality controls.
          </li>
          <li>
            <Link href="/heic-to-jpg">HEIC to JPG</Link> — Turn iPhone HEIC
            photos into standard JPG files.
          </li>
          <li>
            <Link href="/webp-to-jpg">WebP to JPG</Link> — Convert WebP images
            (including animated frames) to JPEG.
          </li>
          <li>
            <Link href="/pdf-to-tiff">PDF to TIFF</Link> — Convert PDF pages
            back into TIFF images.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            JPG file size after converting for email and uploads.
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
