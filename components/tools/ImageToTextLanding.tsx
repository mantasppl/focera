import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Extract text from photos",
    description:
      "Turn screenshots, scans, receipts, and documents into editable text you can copy or download as a .txt file.",
  },
  {
    title: "Multiple languages",
    description:
      "Run OCR in English, Spanish, French, German, Portuguese, Chinese, or Japanese — pick the language that matches your image.",
  },
  {
    title: "100% browser-based",
    description:
      "Recognition runs on your device with Tesseract. Images never upload to Focera servers — private by design.",
  },
  {
    title: "Edit before you copy",
    description:
      "Fix OCR mistakes in the result panel, then copy to the clipboard or download a plain-text file.",
  },
];

export default function ImageToTextLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="image-to-text-features"
        title="Everything you need in a free image to text converter"
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
          Converting an image to text should be fast and private. Focera keeps
          the whole OCR flow on one page — upload, choose a language, extract,
          edit, and copy without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose the text language.</strong> Select the language that
            matches the writing in your photo for more accurate recognition.
          </li>
          <li>
            <strong>Extract, edit, and copy.</strong> Click Extract text.
            Processing runs in your browser. Review the result, fix any
            mistakes, then copy or download a .txt file.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#image-to-text-tool">image to text tool</a> anytime to
          convert another photo.
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
            <strong>Screenshots and slides</strong> — Pull quotes, URLs, or
            bullet lists out of screen captures without retyping.
          </li>
          <li>
            <strong>Scanned documents</strong> — Digitize printed letters,
            forms, or notes into searchable plain text.
          </li>
          <li>
            <strong>Receipts and labels</strong> — Capture totals, product
            names, or instructions from photos on the go.
          </li>
          <li>
            <strong>Handouts and whiteboards</strong> — Convert classroom or
            meeting photos into notes you can paste into docs.
          </li>
        </ul>
        <p>
          Clear, high-contrast images with upright text usually produce the
          best OCR results.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-tools"
      >
        <h2 id="related-tools" className="tool-content__heading">
          Related Free Tools
        </h2>
        <p>
          Focera groups fast, privacy-friendly utilities in one hub. After you
          extract text, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/text-case-converter">Text Case Converter</Link> —
            Change capitalization of the extracted text.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Enlarge a blurry
            photo before OCR for sharper recognition.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Isolate subjects from photos in the same private browser flow.
          </li>
          <li>
            <Link href="/tools">All tools</Link> — Browse every free utility
            in the Focera catalog.
          </li>
        </ul>
      </section>
    </article>
  );
}
