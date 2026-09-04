import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Kindle KF8 / AZW3 output",
    description:
      "Extract text from PDFs into a modern .azw3 (KF8) ebook you can sideload to Kindle devices, Kindle apps, and Calibre.",
  },
  {
    title: "Exact page mode",
    description:
      "For scans and complex layouts, embed each page as an image so the ebook matches what you see in the PDF.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion uses PDF.js and builds the AZW3 package on your device. Your documents stay private — nothing uploads to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), pick a mode, convert, preview a text summary, and download in a few clicks.",
  },
];

export default function PdfToAzw3Landing() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-to-azw3-features"
        title="Everything you need in a free PDF to AZW3 converter"
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
          Turning a PDF into a Kindle AZW3 ebook should be quick and private.
          Focera keeps the whole flow on one page — upload, choose a mode,
          convert, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose conversion mode.</strong> Use Reflowable text for
            documents with selectable text, or Exact pages when you need a
            visual match for scanned or design-heavy PDFs.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to AZW3. A
            .azw3 KF8 file is built locally and is ready to download —
            preview the extracted summary in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-to-azw3-tool">PDF to AZW3 converter</a> anytime to
          process another file.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="modes">
        <h2 id="modes" className="tool-content__heading">
          Reflowable Text vs Exact Pages
        </h2>
        <p>
          <strong>Reflowable text</strong> reads text from the PDF and builds
          one chapter per page. Kindle and other readers can resize fonts,
          change themes, and reflow lines. Layout may differ from the original —
          columns, tables, and graphics are flattened into flowing paragraphs.
        </p>
        <p>
          <strong>Exact pages</strong> renders each PDF page as an image and
          places it in the AZW3. The look stays faithful, but text inside images
          is not selectable or reflowable. Use this for scans, certificates, and
          design-heavy pages.
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
            <strong>Sideload reports to Kindle</strong> — Convert long PDFs into
            AZW3 for comfortable reading on e-ink Kindles and Kindle apps.
          </li>
          <li>
            <strong>Archive manuals as ebooks</strong> — Keep product guides in
            a portable KF8 format that works offline on phones and tablets.
          </li>
          <li>
            <strong>Preserve scans visually</strong> — Use Exact pages when you
            need a page-faithful ebook of scanned paperwork.
          </li>
          <li>
            <strong>Share without desktop software</strong> — Send a .azw3 when
            collaborators prefer Kindle apps over PDF viewers.
          </li>
        </ul>
      </section>

      <section className="tool-content__section" aria-labelledby="privacy">
        <h2 id="privacy" className="tool-content__heading">
          Private by Design
        </h2>
        <p>
          Your PDF is read and converted entirely in your browser. Focera does
          not receive the file, store pages, or run conversion on a remote
          server. When you leave the page, object URLs are revoked and nothing
          remains on our infrastructure.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="related">
        <h2 id="related" className="tool-content__heading">
          Related Tools
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/pdf-to-mobi">PDF to MOBI</Link> — Convert PDFs into
            classic .mobi ebooks for older Kindle workflows.
          </li>
          <li>
            <Link href="/pdf-to-epub">PDF to EPUB</Link> — Convert PDFs into
            reflowable or image-based .epub ebooks.
          </li>
          <li>
            <Link href="/azw3-to-pdf">AZW3 to PDF</Link> — Convert Kindle KF8
            .azw3 ebooks into PDF.
          </li>
          <li>
            <Link href="/mobi-to-pdf">MOBI to PDF</Link> — Convert Kindle .mobi
            and .azw3 ebooks into PDF.
          </li>
          <li>
            <Link href="/epub-to-pdf">EPUB to PDF</Link> — Convert .epub ebooks
            into A4 or Letter PDFs.
          </li>
          <li>
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert PDFs into
            editable .docx documents.
          </li>
          <li>
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract plain text
            from a PDF to copy or download as .txt.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG images for sharing and design tools.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages before converting to AZW3.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before converting.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages or
            ranges before converting.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document.
          </li>
        </ul>
      </section>
    </article>
  );
}
