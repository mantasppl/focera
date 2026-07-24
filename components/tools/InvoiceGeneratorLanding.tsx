import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Company & client fields",
    description:
      "Capture sender and recipient details — name, email, address, phone, and tax ID — in structured sections.",
  },
  {
    title: "Unlimited line items",
    description:
      "Add products and services with quantity and unit price. Remove rows anytime; totals recalculate instantly.",
  },
  {
    title: "Automatic totals",
    description:
      "Subtotal, VAT, and grand total update live as you type — no manual spreadsheet formulas required.",
  },
  {
    title: "VAT / sales tax",
    description:
      "Toggle tax on or off and set your rate. Preview and PDF both reflect the same calculated amounts.",
  },
  {
    title: "PDF export",
    description:
      "Download a clean, print-ready PDF invoice generated locally in your browser — no server upload.",
  },
  {
    title: "Private drafts",
    description:
      "Your invoice draft auto-saves to local storage so you can return later without creating an account.",
  },
];

export default function InvoiceGeneratorLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="invoice-features"
        title="Everything you need in one invoice tool"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="what-is-invoice-generator"
      >
        <h2 id="what-is-invoice-generator" className="tool-content__heading">
          What Is a Free Online Invoice Generator?
        </h2>
        <p>
          An invoice generator helps freelancers, agencies, and small businesses
          create professional billing documents without desktop software or paid
          subscriptions. You enter your company details, client information,
          and line items; the tool calculates totals and produces a downloadable
          PDF you can email or print. For many teams, a{" "}
          <strong>free invoice generator</strong> is the fastest path from
          completed work to getting paid.
        </p>
        <p>
          Focera&apos;s invoice builder runs entirely in your browser. Nothing
          is uploaded to our servers — drafts stay on your device until you
          export. That privacy-first approach suits client work, internal
          billing, and one-off invoices where you want control over sensitive
          business data. Scroll to the{" "}
          <a href="#invoice-generator-tool">invoice generator tool</a> at the top
          of this page to start a new invoice in seconds.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-create-invoice"
      >
        <h2 id="how-to-create-invoice" className="tool-content__heading">
          How to Create and Download an Invoice
        </h2>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter company details.</strong> Add your business name,
            contact information, address, and tax ID so clients know who is
            billing them.
          </li>
          <li>
            <strong>Add client details.</strong> Fill in the recipient&apos;s
            name, email, and billing address for a complete Bill To section.
          </li>
          <li>
            <strong>List products or services.</strong> Add line items with
            descriptions, quantities, and unit prices. Click &quot;Add line
            item&quot; for as many rows as you need.
          </li>
          <li>
            <strong>Set VAT if applicable.</strong> Enable the tax toggle and
            enter your rate. Subtotal, tax, and total update automatically in
            the live preview.
          </li>
          <li>
            <strong>Download your PDF.</strong> Click Download PDF to save a
            print-ready invoice file you can attach to email or upload to
            accounting software.
          </li>
        </ol>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="invoice-vat"
      >
        <h2 id="invoice-vat" className="tool-content__heading">
          VAT and Sales Tax on Invoices
        </h2>
        <p>
          Value-added tax (VAT) and sales tax rules vary by country and region.
          This tool lets you apply a percentage on top of the subtotal so your
          invoice reflects standard B2B or B2C billing. Disable the tax toggle
          when tax is included in your prices or not applicable to your
          transaction.
        </p>
        <p>
          Always verify the correct rate and wording with your accountant or
          local tax authority. The generator handles arithmetic; compliance
          remains your responsibility. Pair this tool with our{" "}
          <Link href="/profit-calculator">profit calculator</Link> to model
          margins before you set line-item prices.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="invoice-privacy"
      >
        <h2 id="invoice-privacy" className="tool-content__heading">
          Privacy and Local Draft Storage
        </h2>
        <p>
          Invoices often contain names, addresses, and payment terms you would
          not want stored on a third-party server without consent. Focera saves
          drafts in your browser&apos;s local storage only. PDF generation also
          happens locally via JavaScript — your data never leaves your device
          during export.
        </p>
        <p>
          Clearing your browser data or using a private window will remove unsaved
          drafts. Download your PDF when you are finished, or keep a copy in your
          own file system for your records.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-invoice-tools"
      >
        <h2 id="related-invoice-tools" className="tool-content__heading">
          Related Free Tools
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/profit-calculator">Profit Calculator</Link> — Model
            revenue, cost, and margin before you finalize invoice amounts.
          </li>
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Track marketing
            campaigns linked from client-facing materials.
          </li>
          <li>
            <Link href="/tools">All tools</Link> — Browse the full Focera
            catalog of free online utilities.
          </li>
        </ul>
      </section>
    </article>
  );
}
