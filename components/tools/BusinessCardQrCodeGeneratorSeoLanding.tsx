import Link from "next/link";

export default function BusinessCardQrCodeGeneratorSeoLanding() {
  return (
    <article className="tool-content">
      <section className="tool-content__section" aria-labelledby="what-is-qr">
        <h2 id="what-is-qr" className="tool-content__heading">
          What Is a QR Code and Why Does It Matter?
        </h2>
        <p>
          A QR code is a grid a camera reads as a string. On a business
          card that string is usually a vCard — name, organization,
          phone, email, website — so a scan can offer to save a contact
          without retyping after a handshake.
        </p>
        <p>
          A <strong>business card QR code generator</strong> is built
          for that small print: keep the payload short, leave a quiet
          margin on the card edge, and export PNG, SVG, or PDF that
          fits card stock. You can encode a short URL instead if you
          prefer a page over a save-contact prompt.
        </p>
        <p>
          The file stores what you typed. It is not a live, editable
          card on a server. Test a printed proof before a bulk run.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-free-generator"
      >
        <h2 id="why-free-generator" className="tool-content__heading">
          Why Generate a Business Card QR Code Online?
        </h2>
        <p>
          Card stock is unforgiving. A dense grid from a long payload
          fails at 2–3 cm. This page gives you guided vCard fields and
          a live preview so you can drop extra lines before you send
          the file to print — no account, no watermark.
        </p>
        <p>
          Contact fields stay on this device during encoding. If the
          card also needs a campaign landing page, tag that URL in the{" "}
          <Link href="/utm-builder">free UTM builder</Link> and encode
          it as a separate URL code, or put the site on the vCard
          website field.
        </p>
        <p>
          Jump to the{" "}
          <a href="#business-card-qr-code-generator-tool">
            business card QR code generator tool
          </a>{" "}
          when you are ready for the next card.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-generate"
      >
        <h2 id="how-to-generate" className="tool-content__heading">
          How to Generate a Business Card QR Code in Three Simple Steps
        </h2>
        <p>Short payload first, then style, then a save test on a proof.</p>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter your content.</strong> Choose vCard and fill
            name, organization, phone, email, and website — or choose
            URL for a short https:// page.
          </li>
          <li>
            <strong>Customize and preview.</strong> Set colors, modules,
            frame, size, and an optional logo. Watch how dense the grid
            gets.
          </li>
          <li>
            <strong>Download or copy.</strong> PNG or SVG for the card
            layout, PDF for print, ZIP for a team set.
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
        <p>Business card codes fit the card itself, not a poster:</p>
        <ul className="tool-content__list">
          <li>
            <strong>Standard cards</strong> — A save-contact vCard on
            the back.
          </li>
          <li>
            <strong>Team decks</strong> — One mark per person in a ZIP.
          </li>
          <li>
            <strong>Conference badges</strong> — The same payload on a
            lanyard clip.
          </li>
          <li>
            <strong>Minimal cards</strong> — Name plus a short site URL
            if vCard fields make the grid too dense.
          </li>
          <li>
            <strong>Email signatures</strong> — A small PNG of the same
            mark.
          </li>
          <li>
            <strong>Reception stands</strong> — A larger print of the
            office contact, not the wallet size.
          </li>
        </ul>
        <p>
          Changing a number later means a new code. The downloaded file
          is static.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="design-tips">
        <h2 id="design-tips" className="tool-content__heading">
          Design Tips for Scannable, Professional QR Codes
        </h2>
        <p>Card stock is small. Keep the payload and the logo modest:</p>
        <ul className="tool-content__list">
          <li>Skip extra fields you do not need — denser grids fail.</li>
          <li>Dark modules on a light field — skip yellow-on-white.</li>
          <li>Leave a quiet margin from the card edge and from type.</li>
          <li>Keep logos small so finder squares stay clear.</li>
          <li>Test a save-contact prompt on iOS and Android from a printed proof.</li>
        </ul>
        <p>Re-scan a printed card, not only the on-screen preview.</p>
      </section>

      <section className="tool-content__section" aria-labelledby="privacy">
        <h2 id="privacy" className="tool-content__heading">
          Privacy, Security, and Offline Generation
        </h2>
        <p>
          Personal phone numbers should not travel to a remote encoder.
          This generator builds the image on your device.
        </p>
        <p>
          Anyone who scans can save the contact. Skip home addresses you
          would not print on a card. Use a work number and a public site.
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
        <p>After you export a business card code, these often sit nearby:</p>
        <ul className="tool-content__list">
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Tag a booking
            URL if you encode that separately.
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
        <p>Same no-signup layout from contact fields to a print-ready card.</p>
      </section>
    </article>
  );
}
