import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "DOCX to PDF in one click",
    description:
      "Turn Microsoft Word documents into shareable PDFs without installing desktop software or creating an account.",
  },
  {
    title: "A4 or Letter pages",
    description:
      "Pick the page size that matches your region or printer, then download a clean PDF ready to email or archive.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion reads your .docx locally, builds HTML, and renders a PDF on your device. Nothing uploads to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a Word file up to 25 MB, choose a page size, convert, preview a text summary, and download in a few clicks.",
  },
];

export default function WordToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="word-to-pdf-features"
        title="Everything you need in a free Word to PDF converter"
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
          Converting Word to PDF should be quick and private. Focera keeps the
          whole flow on one page — upload a .docx, pick a page size, convert,
          and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your Word file.</strong> Drag and drop a .docx up to
            25 MB, or click the zone to browse from your device. Legacy .doc
            files need to be saved as .docx first.
          </li>
          <li>
            <strong>Choose page size.</strong> Use A4 for international
            documents or Letter for US-sized pages.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PDF. The
            file is built locally and downloads automatically — preview a text
            summary in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#word-to-pdf-tool">Word to PDF converter</a> anytime to
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
          Headings, paragraphs, lists, tables, links, and embedded images are
          carried into the PDF when possible. Complex Word features — floating
          text boxes, advanced columns, SmartArt, macros, and some custom styles
          — may simplify or look different after conversion.
        </p>
        <p>
          For best results, use a standard .docx with flowing text and
          inline images. If you need a pixel-perfect visual match for a complex
          layout, export to PDF from Word or LibreOffice when you can.
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
            <strong>Share read-only drafts</strong> — Convert a Word proposal or
            contract to PDF before emailing clients.
          </li>
          <li>
            <strong>Archive reports</strong> — Keep a fixed PDF copy of memos
            and monthly reports that should not change.
          </li>
          <li>
            <strong>Print-ready handouts</strong> — Generate A4 or Letter PDFs
            for meetings without opening a desktop suite.
          </li>
          <li>
            <strong>Cross-platform delivery</strong> — Send a PDF when
            recipients may not have Microsoft Word installed.
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
          Your Word file is read and converted entirely in your browser. Focera
          does not receive the document, store pages, or run conversion on a
          remote server. When you leave the page, object URLs are revoked and
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
            <Link href="/powerpoint-to-pdf">PowerPoint to PDF</Link> — Convert
            .pptx decks into landscape PDFs.
          </li>
          <li>
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert PDFs into
            editable .docx files.
          </li>
          <li>
            <Link href="/pdf-to-excel">PDF to Excel</Link> — Convert PDF tables
            and text into an .xlsx spreadsheet.
          </li>
          <li>
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract plain text
            from a PDF to copy or download as .txt.
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
            <Link href="/pdf-watermark">PDF Watermark</Link> — Add a text
            watermark before sharing.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages or
            ranges after conversion.
          </li>
          <li>
            <Link href="/markdown-editor">Markdown Editor</Link> — Write docs
            with live preview and export to PDF.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG images for sharing and design tools.
          </li>
          <li>
            <Link href="/png-to-pdf">PNG to PDF</Link> — Convert PNG, JPG, or
            WebP images into a multi-page PDF.
          </li>
        </ul>
      </section>
    </article>
  );
}
