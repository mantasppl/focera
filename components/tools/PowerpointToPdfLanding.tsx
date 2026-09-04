import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "PPTX to PDF in one click",
    description:
      "Turn Microsoft PowerPoint decks into shareable PDFs without installing desktop software or creating an account.",
  },
  {
    title: "One slide per page",
    description:
      "Each slide becomes its own landscape PDF page — pick widescreen, A4, or Letter to match how you share or print.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion reads your .pptx locally, renders slides, and builds a PDF on your device. Nothing uploads to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PowerPoint file up to 25 MB, choose a page size, convert, preview a text summary, and download in a few clicks.",
  },
];

export default function PowerpointToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="powerpoint-to-pdf-features"
        title="Everything you need in a free PowerPoint to PDF converter"
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
          Converting PowerPoint to PDF should be quick and private. Focera keeps
          the whole flow on one page — upload a .pptx, pick a page size,
          convert, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PowerPoint file.</strong> Drag and drop a .pptx
            up to 25 MB (50 slides max), or click the zone to browse from your
            device. Legacy .ppt files need to be saved as .pptx first.
          </li>
          <li>
            <strong>Choose page size.</strong> Use widescreen for typical 16:9
            decks, or A4 / Letter landscape for print-friendly handouts.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PDF. The
            file is built locally and is ready to download — preview a text
            summary in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#powerpoint-to-pdf-tool">PowerPoint to PDF converter</a>{" "}
          anytime to process another file.
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
          Text, basic shapes fills, and common embedded images (PNG, JPG, GIF,
          WebP, SVG) are carried into the PDF when possible. Charts rendered as
          images, SmartArt, animations, videos, EMF/WMF media, and some theme
          fonts may simplify or look different after conversion.
        </p>
        <p>
          For best results, use a standard .pptx with text boxes and common image
          formats. If you need a pixel-perfect visual match for a complex deck,
          export to PDF from PowerPoint or LibreOffice when you can.
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
            <strong>Share read-only decks</strong> — Convert a pitch or training
            presentation to PDF before emailing clients.
          </li>
          <li>
            <strong>Print handouts</strong> — Generate landscape PDFs for
            meetings without opening a desktop suite.
          </li>
          <li>
            <strong>Archive slides</strong> — Keep a fixed PDF copy of decks
            that should not change.
          </li>
          <li>
            <strong>Cross-platform delivery</strong> — Send a PDF when
            recipients may not have Microsoft PowerPoint installed.
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
          Your PowerPoint file is read and converted entirely in your browser.
          Focera does not receive the presentation, store slides, or run
          conversion on a remote server. When you leave the page, object URLs
          are revoked and nothing remains on our infrastructure.
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
            <Link href="/pdf-to-powerpoint">PDF to PowerPoint</Link> — Convert
            PDFs into editable .pptx slides.
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
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG images for sharing and design tools.
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
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages or
            ranges after conversion.
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
