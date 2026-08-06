import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Add a PDF password",
    description:
      "Password-protect PDFs so viewers need your open password before they can read the document.",
  },
  {
    title: "Keep text and layout",
    description:
      "Pages are encrypted as real PDF content — selectable text, vectors, and layout stay intact.",
  },
  {
    title: "100% browser-based",
    description:
      "Encryption runs in your browser. Your document and password stay on your device — nothing is uploaded to Focera.",
  },
  {
    title: "Drag & drop workflow",
    description:
      "Drop a PDF up to 25 MB (50 pages), choose a password, protect, and download in a few clicks.",
  },
];

export default function ProtectPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="protect-pdf-features"
        title="Everything you need in a free PDF password protector"
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
          Adding a password to a PDF should be quick and private. Focera keeps
          the whole flow on one page — upload, set a password, protect, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your PDF.</strong> Drag and drop an unprotected file
            up to 25 MB (max 50 pages), or click the zone to browse from your
            device.
          </li>
          <li>
            <strong>Choose a password.</strong> Enter and confirm the open
            password recipients will need. Use something memorable — Focera
            cannot recover it later.
          </li>
          <li>
            <strong>Protect and download.</strong> Encryption runs locally.
            Download the protected PDF and share the password separately.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#protect-pdf-tool">PDF protector</a> anytime to process
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
            <strong>Share sensitive documents</strong> — Protect contracts,
            tax forms, or medical records before emailing them.
          </li>
          <li>
            <strong>Secure client deliveries</strong> — Send invoices or reports
            that only the intended recipient can open.
          </li>
          <li>
            <strong>Lock personal exports</strong> — Add a password to bank
            statements, tickets, or ID scans stored on shared drives.
          </li>
          <li>
            <strong>Finish a PDF workflow</strong> — Merge, compress, or edit
            first, then protect the final file before sharing.
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
          does not receive the file, store the password, or run encryption on a
          remote server. When you leave the page, temporary state is discarded
          and nothing remains on our infrastructure.
        </p>
        <p>
          Choose a strong password and share it through a separate channel. If
          you forget it, you will need{" "}
          <Link href="/unlock-pdf">Unlock PDF</Link> with the correct password
          to remove protection later.
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
            <Link href="/unlock-pdf">Unlock PDF</Link> — Remove a password from
            a protected PDF when you know it.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine files, then
            protect the merged result.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink file size
            before adding password protection.
          </li>
          <li>
            <Link href="/split-pdf">Split PDF</Link> — Break a PDF into pages or
            ranges, then protect each part.
          </li>
          <li>
            <Link href="/password-generator">Password Generator</Link> — Create
            a strong random password to use with your PDF.
          </li>
          <li>
            <Link href="/pdf-watermark">PDF Watermark</Link> — Stamp a mark on
            pages before locking the file.
          </li>
        </ul>
      </section>
    </article>
  );
}
