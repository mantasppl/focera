import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Outlook MSG & EML to PDF",
    description:
      "Turn Microsoft Outlook emails into shareable PDFs without installing desktop software or creating an account.",
  },
  {
    title: "Headers, body, and attachments list",
    description:
      "The PDF includes From, To, Cc, Date, Subject, the email body, and a list of attachment file names when present.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion reads your .msg or .eml locally and renders a PDF on your device. Nothing uploads to Focera.",
  },
  {
    title: "A4 or Letter pages",
    description:
      "Pick the page size that matches your region or printer, then download a clean archive-ready PDF.",
  },
];

export default function OutlookToPdfLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="outlook-to-pdf-features"
        title="Everything you need in a free Outlook to PDF converter"
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
          Converting Outlook emails to PDF should be quick and private. Focera
          keeps the whole flow on one page — upload a .msg or .eml, pick a page
          size, convert, and download without an account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Export from Outlook.</strong> Save the message as{" "}
            <strong>Outlook Message Format (.msg)</strong> or{" "}
            <strong>Outlook Email Message (.eml)</strong>, then drag it here
            (up to 25 MB).
          </li>
          <li>
            <strong>Choose page size.</strong> Use A4 for international
            documents or Letter for US-sized pages.
          </li>
          <li>
            <strong>Convert and download.</strong> Click Convert to PDF. The
            file is built locally and is ready to download — preview a text
            summary in the panel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#outlook-to-pdf-tool">Outlook to PDF converter</a> anytime
          to process another email.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="formatting"
      >
        <h2 id="formatting" className="tool-content__heading">
          What Gets Included?
        </h2>
        <p>
          Subject, sender, recipients, date, and the email body (HTML or plain
          text) are rendered into the PDF. Inline images referenced with CID
          are embedded when the parser can read them. Attachment file names are
          listed for reference — binary attachments are not unpacked into the
          PDF.
        </p>
        <p>
          Complex HTML emails, custom fonts, and some calendar or contact items
          saved as .msg may simplify or look different after conversion. For
          best results, export a standard email message from Outlook.
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
            <strong>Archive important mail</strong> — Keep a fixed PDF copy of
            approvals, contracts, and client threads.
          </li>
          <li>
            <strong>Share without Outlook</strong> — Send a PDF when recipients
            do not use Microsoft Outlook.
          </li>
          <li>
            <strong>Print-ready records</strong> — Generate A4 or Letter PDFs
            for meetings, audits, or filing.
          </li>
          <li>
            <strong>Legal and support trails</strong> — Convert saved .msg /
            .eml evidence into a portable document format.
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
          Your Outlook file is read and converted entirely in your browser.
          Focera does not receive the email, store pages, or run conversion on a
          remote server. When you leave the page, object URLs are revoked and
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
            <Link href="/word-to-pdf">Word to PDF</Link> — Convert .docx
            documents into A4 or Letter PDFs.
          </li>
          <li>
            <Link href="/powerpoint-to-pdf">PowerPoint to PDF</Link> — Convert
            .pptx decks into landscape PDFs.
          </li>
          <li>
            <Link href="/url-to-pdf">URL to PDF</Link> — Capture a webpage as a
            PDF.
          </li>
          <li>
            <Link href="/pdf-to-word">PDF to Word</Link> — Convert PDFs into
            editable .docx files.
          </li>
          <li>
            <Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDFs
            into one file after converting.
          </li>
          <li>
            <Link href="/compress-pdf">Compress PDF</Link> — Shrink PDFs for
            email and uploads.
          </li>
          <li>
            <Link href="/pdf-watermark">PDF Watermark</Link> — Add a text
            watermark before sharing.
          </li>
          <li>
            <Link href="/pdf-to-text">PDF to Text</Link> — Extract plain text
            from a PDF.
          </li>
        </ul>
      </section>
    </article>
  );
}
