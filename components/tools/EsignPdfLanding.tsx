import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Type or draw your signature",
    description:
      "Create a cursive typed signature with script fonts, draw with your mouse or finger, or upload a PNG of your handwritten mark.",
  },
  {
    title: "Place it where you need it",
    description:
      "Stamp the last page, first page, or every page. Choose a corner or center, then tune size and opacity.",
  },
  {
    title: "Keeps PDF text selectable",
    description:
      "Only the signature image is drawn on top. Original pages, text, and layout stay intact.",
  },
  {
    title: "100% browser-based",
    description:
      "Signing runs with pdf-lib in your browser. Your document and signature stay on your device — nothing is uploaded to Focera.",
  },
];

export default function EsignPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="esign-pdf-features"
        title="Everything you need in a free eSign PDF tool"
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
          Adding a signature should be quick and private. Focera keeps the whole
          flow on one page — upload your PDF, create a signature, place it, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a file up to 25 MB
            (max 50 pages), or click the zone to browse from your device.
          </li>
          <li>
            <strong>Create a signature.</strong> Type your name in a script
            font, draw on the pad, or upload a transparent PNG of your
            handwritten signature.
          </li>
          <li>
            <strong>Place, sign, and download.</strong> Choose position and
            pages, then download the signed PDF. Adjust and sign again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#esign-pdf-tool">eSign PDF tool</a> anytime to process
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
            <strong>Contracts and agreements</strong> — Add your mark to the
            signature page before sending a copy back.
          </li>
          <li>
            <strong>Letters and forms</strong> — Sign permission slips, cover
            letters, and simple paperwork without a printer.
          </li>
          <li>
            <strong>Approvals and acknowledgments</strong> — Stamp last-page
            sign-off on proposals, quotes, and internal docs.
          </li>
          <li>
            <strong>Reusable signature image</strong> — Upload a scanned PNG
            once and reuse it across documents.
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
          Your PDF and signature are read and processed entirely in your
          browser. Focera does not receive the files, store pages, or run
          signing on a remote server. When you leave the page, temporary
          previews are revoked and nothing remains on our infrastructure.
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
            <Link href="/pdf-watermark">PDF Watermark</Link> — Stamp a logo or
            seal on every page with tiling and rotation.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine documents before
            adding your signature.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Extract the pages you
            need to sign, then recombine.
          </li>
          <li>
            <Link href="/unlock-pdf">Unlock PDF</Link> — Remove a password
            before signing a protected file.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink the signed
            file for email and uploads.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder or rotate pages
            before placing a signature.
          </li>
          <li>
            <Link href="/background-remover">Background Remover</Link> — Cut
            out a handwritten signature on a transparent PNG.
          </li>
        </ul>
      </section>
    </article>
  );
}
