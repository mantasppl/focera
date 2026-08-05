import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Translate PDF text online",
    description:
      "Extract selectable text from a PDF, translate it into another language, then copy or download the result as .txt or PDF.",
  },
  {
    title: "15+ languages",
    description:
      "Move between English, Spanish, French, German, Portuguese, Chinese, Japanese, Arabic, and more — with auto-detect for the source language.",
  },
  {
    title: "Private extraction",
    description:
      "Your PDF stays in the browser while text is pulled out. Only the extracted text is sent for translation — not the original file.",
  },
  {
    title: "Edit before you export",
    description:
      "Review and tweak the translation in the result panel, then copy it or download a branded .txt or PDF file.",
  },
];

export default function PdfTranslatorLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="pdf-translator-features"
        title="Everything you need in a free PDF translator"
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
          Translating a PDF should not mean uploading the whole document to an
          opaque converter. Focera extracts text locally, translates that text,
          and lets you export the result — no account required.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose languages.</strong> Pick a source language (or
            Auto-detect) and the language you want the document translated into.
          </li>
          <li>
            <strong>Translate, edit, and download.</strong> Review the result,
            fix wording if needed, then copy the text or download a .txt or PDF
            file.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#pdf-translator-tool">PDF translator</a> anytime to process
          another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="scanned"
      >
        <h2 id="scanned" className="tool-content__heading">
          Selectable Text vs Scanned PDFs
        </h2>
        <p>
          This tool translates text that already exists in the PDF (digital
          exports, Word-to-PDF files, and most reports). Image-only scans usually
          have no selectable text layer, so translation may fail until you run
          OCR.
        </p>
        <p>
          For scanned paperwork, convert pages with{" "}
          <Link href="/pdf-to-jpg">PDF to JPG</Link>, then run{" "}
          <Link href="/image-to-text">Image to Text</Link> OCR before pasting
          content into another workflow — or unlock and re-export a text-based
          PDF first.
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
            <strong>Understand foreign documents</strong> — Translate contracts,
            manuals, and reports into a language you can read quickly.
          </li>
          <li>
            <strong>Prep bilingual drafts</strong> — Pull a first-pass
            translation you can edit before sharing with clients or teammates.
          </li>
          <li>
            <strong>Study and research</strong> — Convert academic PDFs into
            plain text in your preferred language for notes and citations.
          </li>
          <li>
            <strong>Support multilingual teams</strong> — Turn a single-source
            PDF into a translated .txt or PDF you can circulate internally.
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
          PDF parsing runs in your browser with PDF.js — Focera does not receive
          the original file. Only the extracted text is sent to the translation
          service so the model can produce the target-language output. When you
          leave the page, nothing remains on our infrastructure from the upload
          itself.
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
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract selectable
            text without translating.
          </li>
          <li>
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert PDFs into
            editable .docx documents.
          </li>
          <li>
            <Link href="/image-to-text">Image to Text</Link> — OCR photos and
            screenshots into editable text.
          </li>
          <li>
            <Link href="/pdf-to-jpg">PDF to JPG</Link> — Convert PDF pages to
            JPEG images for sharing or OCR.
          </li>
          <li>
            <Link href="/unlock-pdf">Unlock PDF</Link> — Remove a password
            before extracting or translating text.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads when you need a smaller document.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a long PDF into
            smaller ranges before translating.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file before translating.
          </li>
        </ul>
      </section>
    </article>
  );
}
