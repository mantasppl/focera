import Link from "next/link";

export default function QrCodeGeneratorForMenuSeoLanding() {
  return (
    <article className="tool-content">
      <section className="tool-content__section" aria-labelledby="what-is-qr">
        <h2 id="what-is-qr" className="tool-content__heading">
          What Is a QR Code and Why Does It Matter?
        </h2>
        <p>
          A QR code is a grid a camera reads as a URL. For a restaurant
          that URL is a menu page or a hosted PDF, so a table tent can
          open dishes without handing out paper that goes stale.
        </p>
        <p>
          A <strong>QR code generator for menu</strong> encodes that
          https:// address in the browser. It does not host the menu. You
          update prices on the page or file you already control.
        </p>
        <p>
          Export PNG, SVG, or PDF. Test from a guest phone in the real
          lighting.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-free-generator"
      >
        <h2 id="why-free-generator" className="tool-content__heading">
          Why Generate a Menu QR Code Online?
        </h2>
        <p>
          Specials change. Encoding a URL you host means you can swap the
          menu without reprinting every tent. This page builds the mark
          locally — no account, no watermark.
        </p>
        <p>
          If you want to know which room’s tents drove orders, tag copies
          of the menu URL in the{" "}
          <Link href="/utm-builder">free UTM builder</Link>, then encode
          each tagged link.
        </p>
        <p>
          Jump to the{" "}
          <a href="#qr-code-generator-for-menu-tool">
            QR code generator for menu tool
          </a>{" "}
          when you are ready for the next tent.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-generate"
      >
        <h2 id="how-to-generate" className="tool-content__heading">
          How to Generate a Menu QR Code in Three Simple Steps
        </h2>
        <p>Host the menu, encode the URL, then scan at the table.</p>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter your content.</strong> Choose URL and paste the
            https:// menu page or PDF you host.
          </li>
          <li>
            <strong>Customize and preview.</strong> Set colors, modules,
            frame, size, and an optional logo.
          </li>
          <li>
            <strong>Download or copy.</strong> PNG or SVG for tents, PDF
            for print, ZIP for a batch of rooms.
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
        <p>Menu codes fit hospitality jobs:</p>
        <ul className="tool-content__list">
          <li>
            <strong>Table tents</strong> — Lunch and dinner without a
            reprint for every price change.
          </li>
          <li>
            <strong>Window clings</strong> — A takeaway menu from the
            sidewalk.
          </li>
          <li>
            <strong>Hotels</strong> — Room-service lists on the desk.
          </li>
          <li>
            <strong>Pop-ups</strong> — A one-day board you can update.
          </li>
          <li>
            <strong>Allergens</strong> — A detail page you can revise.
          </li>
          <li>
            <strong>Wine lists</strong> — A long PDF guests open on a
            phone.
          </li>
        </ul>
        <p>
          Wi‑Fi for guests is a separate code. Encode network details in
          the Wi‑Fi tab, not in the menu URL.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="design-tips">
        <h2 id="design-tips" className="tool-content__heading">
          Design Tips for Scannable, Professional QR Codes
        </h2>
        <p>Restaurant lighting is harder than a desk lamp:</p>
        <ul className="tool-content__list">
          <li>Print larger than a business-card mark.</li>
          <li>Dark modules on a light field.</li>
          <li>Leave a quiet margin; do not crowd the caption.</li>
          <li>Keep logos small.</li>
          <li>Test at the table, including low light.</li>
        </ul>
        <p>Re-scan a printed tent, not only the preview.</p>
      </section>

      <section className="tool-content__section" aria-labelledby="privacy">
        <h2 id="privacy" className="tool-content__heading">
          Privacy, Security, and Offline Generation
        </h2>
        <p>
          Menu URLs stay on this device during encoding. Prices are not
          uploaded to draw the pattern.
        </p>
        <p>
          Anyone who scans reaches the live menu. Use HTTPS. Confirm the
          page after you change dishes.
        </p>
        <p>
          Nearby utilities:{" "}
          <Link href="/password-generator">password generator</Link>.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="related-tools">
        <h2 id="related-tools" className="tool-content__heading">
          Related Free Tools from Focera
        </h2>
        <p>After you export a menu code, these often sit nearby:</p>
        <ul className="tool-content__list">
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Tag room or
            shift URLs before you encode them.
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
        <p>Same no-signup layout from a hosted menu to a table tent.</p>
      </section>
    </article>
  );
}
