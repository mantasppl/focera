import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "JPG to WebP in seconds",
    description:
      "Turn JPEG photos into modern WebP files that usually download faster while staying sharp for the web.",
  },
  {
    title: "Batch convert multiple JPGs",
    description:
      "Upload up to 20 JPG or JPEG files at once. One image downloads as WebP; batches download as a ZIP.",
  },
  {
    title: "Choose WebP quality",
    description:
      "Pick Smaller, Balanced, or High so you control file size versus detail before downloading.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs on your device. Nothing uploads to Focera.",
  },
];

export default function JpgToWebpLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="jpg-to-webp-features"
        title="Everything you need in a free JPG to WebP converter"
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
          WebP is a modern image format that often shrinks JPEG file size for
          websites and apps. Focera converts JPG to WebP on one page — upload,
          choose quality, convert, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your JPG files.</strong> Drag and drop .jpg or .jpeg
            images (up to 10 MB each), or click the zone to browse. Add up to 20
            files per conversion.
          </li>
          <li>
            <strong>Choose WebP quality.</strong> Balanced is a solid default.
            Use Smaller for faster pages, or High when you want more detail.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to WebP.
            Processing runs locally — one image downloads as a .webp; multiple
            images download as a ZIP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#jpg-to-webp-tool">JPG to WebP converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert JPG to WebP?
        </h2>
        <p>
          WebP often produces smaller files than JPEG at similar visual quality,
          which helps product pages, blogs, and social previews load faster.
          Most modern browsers and CDNs serve WebP natively, so converting
          camera photos and stock JPGs is a simple performance win.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="quality"
      >
        <h2 id="quality" className="tool-content__heading">
          How Does WebP Quality Work?
        </h2>
        <p>
          Smaller favors speed and bandwidth. Balanced is the default for most
          photos. High keeps more detail when you need sharper edges or text in
          the image. Try a setting, preview the result, and convert again if you
          want a different trade-off.
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
            <strong>Website performance</strong> — Serve lighter hero and
            product photos without a noticeable quality drop.
          </li>
          <li>
            <strong>E-commerce catalogs</strong> — Shrink gallery JPGs before
            uploading to a storefront or CDN.
          </li>
          <li>
            <strong>Blog and CMS assets</strong> — Convert camera exports to
            WebP for faster article pages.
          </li>
          <li>
            <strong>App and design handoff</strong> — Deliver WebP assets that
            modern browsers and frameworks understand.
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
            <Link href="/png-to-webp">PNG to WebP</Link> — Convert PNG images to
            WebP with transparency preserved.
          </li>
          <li>
            <Link href="/webp-to-jpg">WebP to JPG</Link> — Convert WebP images
            (including animated frames) back to JPEG.
          </li>
          <li>
            <Link href="/jpg-to-png">JPG to PNG</Link> — Convert JPEG photos to
            lossless PNG files.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            JPG, PNG, or WebP file size for email and uploads.
          </li>
          <li>
            <Link href="/png-to-jpg">PNG to JPG</Link> — Convert PNG images to
            standard JPEG when you do not need transparency.
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
