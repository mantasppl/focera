import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Remove PDF passwords",
    description:
      "Unlock password-protected PDFs when you know the open password — download a clean copy with protection removed.",
  },
  {
    title: "Keep text and layout",
    description:
      "Pages are decrypted and copied as real PDF content, so selectable text, vectors, and layout stay intact.",
  },
  {
    title: "100% browser-based",
    description:
      "Unlocking decrypts the PDF in your browser. Your document and password stay on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), enter the password, unlock, preview, and download in a few clicks.",
  },
];

export default function UnlockPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="unlock-pdf-features"
        title="Everything you need in a free PDF unlocker"
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
          Removing a PDF password should be quick and private. Focera keeps the
          whole flow on one page — upload, enter the password, unlock, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop a password-protected
            file up to 25 MB (max 50 pages), or click the zone to browse from
            your device.
          </li>
          <li>
            <strong>Enter the password.</strong> Use the open password for the
            file. Leave it blank only if the PDF uses an empty open password
            with owner/permissions restrictions.
          </li>
          <li>
            <strong>Unlock and download.</strong> Protection is removed locally.
            Preview the unlocked PDF and download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#unlock-pdf-tool">PDF unlocker</a> anytime to process another
          file.
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
            <strong>Prep files for other tools</strong> — Unlock a PDF before
            merging, splitting, compressing, or converting to Word.
          </li>
          <li>
            <strong>Open older protected exports</strong> — Remove a password you
            still know from a bank statement, ticket, or shared report.
          </li>
          <li>
            <strong>Share without friction</strong> — Send a clean copy to
            teammates who should not need a separate password.
          </li>
          <li>
            <strong>Clear owner restrictions</strong> — Strip permissions locks
            when you have the credentials to open the document.
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
          Your PDF and password are handled entirely in your browser. Focera
          does not receive the file, store the password, or run decryption on a
          remote server. When you leave the page, temporary previews are revoked
          and nothing remains on our infrastructure.
        </p>
        <p>
          Only unlock documents you are authorized to open. This tool does not
          crack or recover forgotten passwords.
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
            <Link href="/protect-pdf">Protect PDF</Link> — Add a password to a
            PDF after unlocking or editing.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine unlocked PDFs
            into one file.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages,
            ranges, or fixed-size chunks.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink file size
            after removing protection.
          </li>
          <li>
            <Link href="/pdf-editor">PDF Editor</Link> — Reorder, rotate, or
            extract pages from the unlocked file.
          </li>
          <li>
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert the unlocked
            PDF into an editable .docx.
          </li>
          <li>
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract selectable
            text once the password is removed.
          </li>
        </ul>
      </section>
    </article>
  );
}
