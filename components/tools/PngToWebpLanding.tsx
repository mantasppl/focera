import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "PNG to WebP in seconds",
    description:
      "Turn PNG images into modern WebP files that stay sharp while usually downloading faster than PNG.",
  },
  {
    title: "Batch convert multiple PNGs",
    description:
      "Upload up to 20 PNG files at once. One image downloads as WebP; batches download as a ZIP.",
  },
  {
    title: "Choose WebP quality",
    description:
      "Pick Smaller, Balanced, or High so you control file size versus detail before downloading.",
  },
  {
    title: "Transparency preserved",
    description:
      "WebP keeps PNG alpha. Transparent logos and graphics stay clear — no white background fill.",
  },
];

export default function PngToWebpLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="png-to-webp-features"
        title="Everything you need in a free PNG to WebP converter"
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
          WebP is a modern image format that often shrinks PNG file size while
          keeping transparency. Focera converts PNG to WebP on one page —
          upload, choose quality, convert, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PNG files.</strong> Drag and drop .png images
            (up to 10 MB each), or click the zone to browse. Add up to 20 files
            per conversion.
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
          <a href="#png-to-webp-tool">PNG to WebP converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-convert"
      >
        <h2 id="why-convert" className="tool-content__heading">
          Why Convert PNG to WebP?
        </h2>
        <p>
          WebP usually produces smaller files than PNG for photos and graphics,
          which helps web pages load faster. Unlike JPG, WebP also supports
          transparency — so logos, icons, and cutouts keep their alpha channel
          after conversion.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="transparency"
      >
        <h2 id="transparency" className="tool-content__heading">
          Does WebP Keep Transparency?
        </h2>
        <p>
          Yes. Transparent PNG pixels stay transparent in the WebP output. No
          white fill is applied, so soft edges and see-through areas look the
          same as the original.
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
            <strong>Website performance</strong> — Serve lighter product shots
            and UI assets without dropping transparency.
          </li>
          <li>
            <strong>Logos and icons</strong> — Convert brand PNGs to WebP for
            faster pages with clean alpha edges.
          </li>
          <li>
            <strong>Marketing creatives</strong> — Shrink campaign graphics
            before publishing to CMS or CDN hosts.
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
            <Link href="/webp-to-png">WebP to PNG</Link> — Convert WebP images
            back into lossless PNG files.
          </li>
          <li>
            <Link href="/png-to-jpg">PNG to JPG</Link> — Convert PNG images to
            standard JPEG when you do not need transparency.
          </li>
          <li>
            <Link href="/image-compressor">Compress Image Size</Link> — Shrink
            JPG, PNG, or WebP file size for email and uploads.
          </li>
          <li>
            <Link href="/webp-to-jpg">WebP to JPG</Link> — Convert WebP images
            (including animated frames) to JPEG.
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
