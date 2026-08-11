import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Translate text in images",
    description:
      "OCR photos, screenshots, and scans, then translate the extracted text into 15+ languages you can copy or download.",
  },
  {
    title: "Local OCR, private by design",
    description:
      "Text recognition runs in your browser with Tesseract. Your image never uploads — only the extracted text is sent for translation.",
  },
  {
    title: "Multiple source languages",
    description:
      "Read English, Spanish, French, German, Portuguese, Chinese, or Japanese from the image, then translate into your target language.",
  },
  {
    title: "Edit before you export",
    description:
      "Fix OCR or translation wording in the result panel, then copy to the clipboard or download a plain-text .txt file.",
  },
];

export default function TranslateYourImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="translate-your-image-features"
        title="Everything you need in a free image translator"
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
          Translating text from a photo should not mean uploading the whole
          image to an opaque converter. Focera runs OCR on your device,
          translates that text, and lets you export the result — no account
          required.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Choose languages.</strong> Pick the language of the text in
            the image, then the language you want it translated into.
          </li>
          <li>
            <strong>Translate, edit, and download.</strong> Review the result,
            fix wording if needed, then copy the text or download a .txt file.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#translate-your-image-tool">translate your image tool</a>{" "}
          anytime to process another photo.
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
            <strong>Menus and signs</strong> — Translate restaurant menus,
            street signs, or product labels from a quick photo.
          </li>
          <li>
            <strong>Screenshots and slides</strong> — Turn foreign UI text or
            presentation captures into a language you can read.
          </li>
          <li>
            <strong>Scanned documents</strong> — Digitize printed letters or
            forms, then get a first-pass translation without retyping.
          </li>
          <li>
            <strong>Travel and study</strong> — Capture notes, handouts, or
            packaging abroad and translate them on the spot.
          </li>
        </ul>
        <p>
          Clear, high-contrast images with upright printed text usually produce
          the best OCR and translation results.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="privacy"
      >
        <h2 id="privacy" className="tool-content__heading">
          Private by Design
        </h2>
        <p>
          OCR runs entirely in your browser — Focera does not receive the
          original image. Only the extracted text is sent to the translation
          service so the model can produce the target-language output. When you
          leave the page, nothing remains on our infrastructure from the upload
          itself.
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
          translate image text, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/image-to-text">Image to Text</Link> — Extract text
            with OCR without translating.
          </li>
          <li>
            <Link href="/pdf-translator">PDF Translator</Link> — Translate
            selectable text from digital PDFs.
          </li>
          <li>
            <Link href="/add-text-on-image">Add Text on Image</Link> — Overlay
            captions or labels on a photo after you translate.
          </li>
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Enlarge a blurry
            photo before OCR for sharper recognition.
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
