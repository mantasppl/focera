import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Full-length page capture",
    description:
      "Paste a public URL and get a PDF of the entire webpage — not just the visible viewport. Lazy-loaded sections are scrolled into view before export.",
  },
  {
    title: "Full page, A4, or Letter",
    description:
      "Choose one tall PDF that matches the page height, or a classic paginated A4 / US Letter print layout with backgrounds.",
  },
  {
    title: "Preview before you download",
    description:
      "Review the generated PDF in the browser, then download with one click. Filenames are branded automatically.",
  },
  {
    title: "Free and fast",
    description:
      "No account, install, or credit card. Convert public HTTPS pages for research, archiving, and sharing.",
  },
];

export default function UrlToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="url-to-pdf-features"
        title="Everything you need to save a webpage as PDF"
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
          Saving a live webpage as a PDF should cover the full article, not a
          cropped screenshot. Focera loads the URL in a headless browser, scrolls
          the full length so lazy content appears, then prints to PDF.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste the webpage URL.</strong> Use any public HTTPS link —
            articles, docs, landing pages, or blog posts.
          </li>
          <li>
            <strong>Pick a layout.</strong> Full page keeps one continuous tall
            PDF; A4 or Letter paginates like a browser print dialog.
          </li>
          <li>
            <strong>Convert, preview, and download.</strong> Review the PDF in
            the preview pane, then download when it looks right.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#url-to-pdf-tool">URL to PDF tool</a> anytime to convert
          another page.
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
            <strong>Research archives</strong> — Keep offline copies of articles,
            docs, and references with the full scrollable length intact.
          </li>
          <li>
            <strong>Client deliverables</strong> — Export a live page as a clean
            PDF for proposals, reviews, or email attachments.
          </li>
          <li>
            <strong>Print-ready pages</strong> — Use A4 or Letter when you need
            standard paper sizes instead of one tall page.
          </li>
          <li>
            <strong>Sharing without links</strong> — Send a PDF snapshot when the
            original URL may change, expire, or sit behind a login later.
          </li>
        </ul>
        <p>
          Login-walled, paywalled, or blocked pages cannot be rendered. Very
          long or media-heavy sites may take longer or fall back to a paginated
          layout.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-tools"
      >
        <h2 id="related-tools" className="tool-content__heading">
          Related Tools
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine several PDFs into
            one file.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink large PDF
            exports for email and uploads.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Turn PDF pages into
            images when you need screenshots instead of documents.
          </li>
          <li>
            <Link href="/markdown-editor">Markdown Editor</Link> — Write and
            export Markdown to PDF in the browser.
          </li>
        </ul>
      </section>
    </article>
  );
}
