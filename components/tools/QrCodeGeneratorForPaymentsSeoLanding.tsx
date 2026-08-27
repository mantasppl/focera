import Link from "next/link";

export default function QrCodeGeneratorForPaymentsSeoLanding() {
  return (
    <article className="tool-content">
      <section className="tool-content__section" aria-labelledby="what-is-qr">
        <h2 id="what-is-qr" className="tool-content__heading">
          What Is a QR Code and Why Does It Matter?
        </h2>
        <p>
          A QR code is a grid a camera reads as a string. For checkout
          that string is a URL to a payment page, invoice, or donation
          form you already run — the phone opens that page; this
          generator does not take money.
        </p>
        <p>
          A <strong>QR code generator for payments</strong> encodes that
          https:// link in the browser. It does not create bank-network
          payment marks or process cards.
        </p>
        <p>
          Export PNG, SVG, or PDF. Complete a test checkout before you
          tape the mark to a till.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-free-generator"
      >
        <h2 id="why-free-generator" className="tool-content__heading">
          Why Generate a Payment-Link QR Online?
        </h2>
        <p>
          A counter still needs a file. Paste the checkout URL, preview,
          and download with no account or watermark. Card numbers never
          enter this page.
        </p>
        <p>
          Tag print vs email invoices in the{" "}
          <Link href="/utm-builder">free UTM builder</Link> if you need
          those channels in your reports, then encode the finished URL.
        </p>
        <p>
          Jump to the{" "}
          <a href="#qr-code-generator-for-payments-tool">
            QR code generator for payments tool
          </a>{" "}
          when you are ready for the next checkout link.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-generate"
      >
        <h2 id="how-to-generate" className="tool-content__heading">
          How to Generate a Payment QR Code in Three Simple Steps
        </h2>
        <p>Host checkout first, encode the URL, then test a real pay flow.</p>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter your content.</strong> Choose URL and paste the
            full https:// checkout, invoice, or donation page.
          </li>
          <li>
            <strong>Customize and preview.</strong> Set colors, modules,
            frame, size, and an optional logo.
          </li>
          <li>
            <strong>Download or copy.</strong> PNG for a till sign, SVG
            for layouts, PDF for print, ZIP for a batch of stalls.
          </li>
        </ol>
        <p>
          After export, the{" "}
          <Link href="/tools">Focera catalog</Link> has converters and
          other helpers if the rest of the kit still needs them.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="use-cases">
        <h2 id="use-cases" className="tool-content__heading">
          Popular Use Cases for QR Codes
        </h2>
        <p>Payment-link codes fit jobs where a scan should open checkout:</p>
        <ul className="tool-content__list">
          <li>
            <strong>Till and counter</strong> — A hosted pay page.
          </li>
          <li>
            <strong>Invoices</strong> — A pay-now URL on a PDF or paper
            bill.
          </li>
          <li>
            <strong>Events</strong> — Tickets or donations at a booth.
          </li>
          <li>
            <strong>Pop-ups</strong> — One checkout link per stall.
          </li>
          <li>
            <strong>Tips</strong> — A donation page on a table tent.
          </li>
          <li>
            <strong>Remote jobs</strong> — An invoice URL on a card.
          </li>
        </ul>
        <p>
          If the checkout URL changes, encode a path you control so you
          can redirect without reprinting.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="design-tips">
        <h2 id="design-tips" className="tool-content__heading">
          Design Tips for Scannable, Professional QR Codes
        </h2>
        <p>Till lighting and glare fail more codes than style:</p>
        <ul className="tool-content__list">
          <li>Print large enough for a phone at arm’s length.</li>
          <li>Dark modules on a light field.</li>
          <li>Leave a quiet margin around the grid.</li>
          <li>Keep logos small.</li>
          <li>Complete a test payment after you print a sample.</li>
        </ul>
        <p>Re-scan the sign in place, not only the preview.</p>
      </section>

      <section className="tool-content__section" aria-labelledby="privacy">
        <h2 id="privacy" className="tool-content__heading">
          Privacy, Security, and Offline Generation
        </h2>
        <p>
          Checkout URLs stay on this device during encoding. Never put
          card numbers, PINs, or one-time codes in the QR payload.
        </p>
        <p>
          Anyone who scans reaches the live pay page. Use HTTPS. Confirm
          the destination after launch.
        </p>
        <p>
          Nearby utilities:{" "}
          <Link href="/password-generator">password generator</Link> and{" "}
          <Link href="/password-checker">password strength checker</Link>.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="related-tools">
        <h2 id="related-tools" className="tool-content__heading">
          Related Free Tools from Focera
        </h2>
        <p>After you export a payment-link code, these often sit nearby:</p>
        <ul className="tool-content__list">
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Tag invoice
            vs counter URLs before you encode them.
          </li>
          <li>
            <Link href="/profit-calculator">Profit Calculator</Link> — Check
            margin on scan-driven offers.
          </li>
          <li>
            <Link href="/json-formatter">JSON Formatter</Link> — Tidy JSON
            for apps that read QR payloads.
          </li>
          <li>
            <Link href="/">Focera home</Link> — Browse the rest of the hub.
          </li>
        </ul>
        <p>Same no-signup layout from a checkout URL to a till sign.</p>
      </section>
    </article>
  );
}
