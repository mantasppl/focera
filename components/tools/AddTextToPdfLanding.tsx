import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Place custom text",
    description:
      "Add a note, label, header, or stamp to your PDF with position, font, size, color, and opacity controls — then download instantly.",
  },
  {
    title: "Flexible placement",
    description:
      "Put text in the center, header, or footer. Target every page, only the first page, or only the last.",
  },
  {
    title: "Readable standard fonts",
    description:
      "Choose Helvetica, Times, or Courier (including bold). Rotate diagonally when you need a watermark-style mark.",
  },
  {
    title: "100% browser-based",
    description:
      "Text is drawn with pdf-lib in your browser. Your documents stay on your device — nothing is uploaded to Focera.",
  },
];

export default function AddTextToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="add-text-to-pdf-features"
        title="Everything you need in a free add text to PDF tool"
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
          Adding text should be quick and private. Focera keeps the whole flow
          on one page — upload your PDF, type what you want, choose placement,
          and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Enter text and options.</strong> Type your message, then
            pick position, font, color, pages, size, opacity, and optional
            rotation.
          </li>
          <li>
            <strong>Add text and download.</strong> Text is drawn on the
            selected pages locally. Preview the result and download again
            anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#add-text-to-pdf-tool">add text tool</a> anytime to process
          another file.
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
            <strong>Draft and review marks</strong> — Stamp “DRAFT”,
            “CONFIDENTIAL”, or “FOR REVIEW” before sharing.
          </li>
          <li>
            <strong>Headers and footers</strong> — Add a company name, date, or
            short note without opening a desktop editor.
          </li>
          <li>
            <strong>Forms and packets</strong> — Label scanned pages so
            recipients know what they are looking at.
          </li>
          <li>
            <strong>Cover notes</strong> — Place a short message on the first
            or last page only.
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
          Your PDF is read and processed entirely in your browser. Focera does
          not receive the file, store pages, or draw text on a remote server.
          When you leave the page, temporary previews are revoked and nothing
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
            <Link href="/add-page-numbers-to-pdf">Add Page Numbers to PDF</Link>{" "}
            — Number every page with header or footer placement.
          </li>
          <li>
            <Link href="/pdf-watermark">PDF Watermark</Link> — Stamp a logo or
            image on every page.
          </li>
          <li>
            <Link href="/esign-pdf">eSign PDF</Link> — Add a typed or drawn
            signature instead of plain text.
          </li>
          <li>
            <Link href="/pdf-creator">PDF Creator</Link> — Build a new PDF from
            title and body text.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine files before
            adding text.
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
