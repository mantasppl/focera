import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Highlight, draw, and note",
    description:
      "Mark up any PDF with highlights, freehand pen strokes, box outlines, and click-to-place text notes — then download the annotated file.",
  },
  {
    title: "Page-by-page workspace",
    description:
      "Browse thumbnails, jump between pages, undo marks, and clear a page or the whole document before you export.",
  },
  {
    title: "Colors and stroke control",
    description:
      "Pick highlight and ink colors, adjust pen or box thickness, and set text size so reviews stay readable.",
  },
  {
    title: "100% browser-based",
    description:
      "Annotation runs with PDF.js and pdf-lib in your browser. Your documents stay on your device — nothing is uploaded to Focera.",
  },
];

export default function AnnotatePdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="annotate-pdf-features"
        title="Everything you need in a free annotate PDF tool"
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
          Annotating a PDF should feel quick and private. Focera keeps the whole
          flow on one page — upload your file, mark it up visually, and download
          without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Mark up the pages.</strong> Choose highlight, pen, box, or
            text, pick a color, and draw or click on the page preview.
          </li>
          <li>
            <strong>Download the annotated PDF.</strong> Marks are baked into
            the file locally. Preview the result and download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the <a href="#annotate-pdf-tool">annotate tool</a>{" "}
          anytime to process another file.
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
            <strong>Document review</strong> — Highlight passages and leave short
            notes before sending feedback.
          </li>
          <li>
            <strong>Study and research</strong> — Mark key lines in papers or
            handouts without printing.
          </li>
          <li>
            <strong>Form callouts</strong> — Box fields or draw arrows-style
            marks so others know where to look.
          </li>
          <li>
            <strong>Quick redlines</strong> — Circle issues and add a brief text
            note before a meeting.
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
          Your PDF is read and annotated entirely in your browser. Focera does
          not receive the file, store pages, or process marks on a remote
          server. When you leave the page, temporary previews are revoked and
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
            <Link href="/add-text-to-pdf">Add Text to PDF</Link> — Stamp the
            same text on every page with position presets.
          </li>
          <li>
            <Link href="/esign-pdf">eSign PDF</Link> — Add a typed or drawn
            signature instead of review marks.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate,
            duplicate, or delete pages.
          </li>
          <li>
            <Link href="/pdf-watermark">PDF Watermark</Link> — Stamp a logo or
            image across pages.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine files before you
            annotate.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink the finished
            file for email and uploads.
          </li>
        </ul>
      </section>
    </article>
  );
}
