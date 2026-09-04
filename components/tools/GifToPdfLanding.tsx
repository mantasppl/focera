import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "GIF to PDF in seconds",
    description:
      "Turn one GIF — or a batch of images — into a shareable PDF without installing software or creating an account.",
  },
  {
    title: "Multi-page from many images",
    description:
      "Each image becomes a page. Reorder the list before converting so memes, screenshots, and reaction GIFs land in the right sequence.",
  },
  {
    title: "Fit, A4, or Letter",
    description:
      "Keep the page sized to the image, or place images on A4/Letter with optional margins for printing and archiving.",
  },
  {
    title: "100% browser-based",
    description:
      "GIF is converted locally and embedded into a PDF on your device with pdf-lib. Nothing uploads to Focera.",
  },
];

export default function GifToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="gif-to-pdf-features"
        title="Everything you need in a free GIF to PDF converter"
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
          Converting GIF images to PDF should be quick and private. Focera keeps
          the whole flow on one page — add images, set page size, convert, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your images.</strong> Drag and drop GIF, PNG, JPG, or
            WebP files (up to 10 MB each), or click the zone to browse. Add up to
            30 images per PDF.
          </li>
          <li>
            <strong>Choose page size.</strong> Use Fit so each page matches the
            image, or pick A4 / Letter with a margin for print-ready documents.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PDF. The
            file is built locally and is ready to download — preview the
            first image in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#gif-to-pdf-tool">GIF to PDF converter</a> anytime to
          process another batch.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="formats"
      >
        <h2 id="formats" className="tool-content__heading">
          Why Convert GIF to PDF?
        </h2>
        <p>
          GIFs are common for memes, UI demos, and short loops, but many viewers,
          printers, and email clients expect PDF. Focera converts each GIF
          locally before embedding so the downloaded file opens reliably across
          readers. Animated GIFs use the frame your browser displays when the
          file is loaded (typically the first frame).
        </p>
        <p>
          PNG, JPG, and WebP are also accepted. Prefer a broader landing page?
          Use <Link href="/image-to-pdf">Image to PDF</Link> — same converter,
          different SEO entry point.
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
            <strong>Share packs</strong> — Package GIF stickers or reaction
            images into one PDF for teammates who cannot open GIF previews.
          </li>
          <li>
            <strong>UI and product demos</strong> — Turn short GIF walkthroughs
            into a printable or email-friendly document (first frame per file).
          </li>
          <li>
            <strong>Archive downloads</strong> — Convert browser-saved GIFs into
            a standard PDF for long-term storage.
          </li>
          <li>
            <strong>Print-ready pages</strong> — Place images on A4 or Letter
            with margins before sending to a printer.
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
          Your images are read and converted entirely in your browser. Focera
          does not receive the files, store pages, or run conversion on a remote
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
            <Link href="/image-to-pdf">Image to PDF</Link> — Convert PNG, JPG,
            WebP, or GIF photos into a multi-page PDF.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Same converter focused
            on PNG workflows and transparency.
          </li>
          <li>
            <Link href="/webp-to-pdf">WebP to PDF</Link> — Convert WebP images
            into a multi-page PDF.
          </li>
          <li>
            <Link href="/tiff-to-pdf">TIFF to PDF</Link> — Convert .tif / .tiff
            scans, including multi-page files, into a PDF.
          </li>
          <li>
            <Link href="/video-to-gif">Video to GIF</Link> — Create a GIF from a
            video clip before converting to PDF.
          </li>
          <li>
            <Link href="/pdf-to-png">PDF to PNG</Link> — Convert PDF pages back
            into PNG images.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages back
            into JPEG images.
          </li>
          <li>
            <Link href="/add-images-to-pdf">Add Images to PDF</Link> — Insert
            images into an existing PDF instead of creating a new one.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file after converting.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document.
          </li>
          <li>
            <Link href="/gif-to-mp4">GIF to MP4 Converter</Link> — Convert GIF
            to video when you need a smaller animated file.
          </li>
        </ul>
      </section>
    </article>
  );
}
