import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "AZW3 to PDF in one click",
    description:
      "Turn Kindle KF8 .azw3 ebooks into shareable PDFs without installing Calibre or creating an account.",
  },
  {
    title: "A4 or Letter pages",
    description:
      "Pick the page size that matches your region or printer, then download a clean PDF ready to archive or print.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion reads your AZW3 locally, walks chapters in order, and builds a PDF on your device. Nothing uploads to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop an AZW3 up to 25 MB, choose a page size, convert, preview a text summary, and download in a few clicks.",
  },
];

export default function Azw3ToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="azw3-to-pdf-features"
        title="Everything you need in a free AZW3 to PDF converter"
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
          Converting AZW3 to PDF should be quick and private. Focera keeps the
          whole flow on one page — upload a Kindle KF8 ebook, pick a page size,
          convert, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your AZW3.</strong> Drag and drop a DRM-free .azw3
            file up to 25 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose page size.</strong> Use A4 for international
            documents or Letter for US-sized pages.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PDF.
            Chapters are read in order, rendered locally, and the PDF downloads
            automatically — preview a text summary in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#azw3-to-pdf-tool">AZW3 to PDF converter</a> anytime to
          process another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="formatting"
      >
        <h2 id="formatting" className="tool-content__heading">
          What About Formatting?
        </h2>
        <p>
          Reflowable KF8 (AZW3) books with headings, paragraphs, lists, links,
          and embedded images convert best. Stylesheets from the book are
          applied when possible. Fixed-layout comics, complex CSS, custom fonts,
          and interactive features may simplify or look different after
          conversion.
        </p>
        <p>
          DRM-protected Kindle store books cannot be opened in the browser.
          Export or download a DRM-free AZW3 before converting. For older .mobi
          or .azw files, use{" "}
          <Link href="/mobi-to-pdf">MOBI to PDF</Link>.
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
            <strong>Print a chapter or book</strong> — Convert to A4 or Letter
            PDF for home or office printing.
          </li>
          <li>
            <strong>Share read-only copies</strong> — Send a PDF when recipients
            do not have a Kindle app installed.
          </li>
          <li>
            <strong>Archive for long-term storage</strong> — Keep a fixed PDF
            alongside the original AZW3.
          </li>
          <li>
            <strong>Annotate elsewhere</strong> — Open the PDF in tools that
            highlight and comment more easily than ebook readers.
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
          Your AZW3 is read and converted entirely in your browser. Focera does
          not receive the ebook, store chapters, or run conversion on a remote
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
            <Link href="/mobi-to-pdf">MOBI to PDF</Link> — Convert Kindle .mobi
            and .azw ebooks into A4 or Letter PDFs.
          </li>
          <li>
            <Link href="/epub-to-pdf">EPUB to PDF</Link> — Convert .epub ebooks
            into A4 or Letter PDFs the same way.
          </li>
          <li>
            <Link href="/pdf-to-mobi">PDF to MOBI</Link> — Convert PDFs into
            Kindle .mobi ebooks for sideloading.
          </li>
          <li>
            <Link href="/pdf-to-epub">PDF to EPUB</Link> — Convert PDFs into
            reflowable or image-based .epub ebooks.
          </li>
          <li>
            <Link href="/word-to-pdf">Word to PDF</Link> — Convert .docx
            documents into A4 or Letter PDFs.
          </li>
          <li>
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert PDFs into
            editable .docx files.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file after converting.
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
