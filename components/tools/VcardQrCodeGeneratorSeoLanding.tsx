import Link from "next/link";

export default function VcardQrCodeGeneratorSeoLanding() {
  return (
    <article className="tool-content">
      <section className="tool-content__section" aria-labelledby="what-is-qr">
        <h2 id="what-is-qr" className="tool-content__heading">
          What Is a QR Code and Why Does It Matter?
        </h2>
        <p>
          A QR code is a grid a camera reads as a string. For a contact
          that string is a vCard — name, organization, phone, email, and
          website — so a scan can offer to save you without typing.
        </p>
        <p>
          A <strong>vCard QR code generator</strong> fills those fields,
          previews the grid, and lets you add colors or a logo before you
          print a card or badge. The file stores the details you typed,
          not a live profile on a server.
        </p>
        <p>
          Export PNG, SVG, or PDF. Test a save-contact prompt on a phone
          before a bulk card run.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-free-generator"
      >
        <h2 id="why-free-generator" className="tool-content__heading">
          Why Generate a vCard QR Code Online?
        </h2>
        <p>
          Paper cards still get exchanged. A scannable contact block
          cuts typos. This page builds the mark in the browser — no
          account, no watermark, no upload of the phone number.
        </p>
        <p>
          Contact fields stay on this device during encoding. If the card
          also needs a campaign landing page, tag that URL in the{" "}
          <Link href="/utm-builder">free UTM builder</Link> and encode it
          as a separate URL code, or put the site on the vCard website
          field.
        </p>
        <p>
          Jump to the{" "}
          <a href="#vcard-qr-code-generator-tool">
            vCard QR code generator tool
          </a>{" "}
          when you are ready for the next card.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-generate"
      >
        <h2 id="how-to-generate" className="tool-content__heading">
          How to Generate a vCard QR Code in Three Simple Steps
        </h2>
        <p>Contact fields first, then style, then a save test.</p>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter your content.</strong> Choose vCard. Fill first
            name, last name, organization, phone, email, and website.
          </li>
          <li>
            <strong>Customize and preview.</strong> Set colors, modules,
            frame, size, and an optional logo. Watch the live preview.
          </li>
          <li>
            <strong>Download or copy.</strong> PNG or SVG for cards, PDF
            for print, ZIP for a batch of staff codes.
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
        <p>vCard codes fit jobs where a scan should save a contact:</p>
        <ul className="tool-content__list">
          <li>
            <strong>Business cards</strong> — Name and phone without
            retyping after a meeting.
          </li>
          <li>
            <strong>Badges</strong> — Event credentials that save an
            organizer or speaker.
          </li>
          <li>
            <strong>Email signatures</strong> — A small PNG next to the
            title line.
          </li>
          <li>
            <strong>Reception desks</strong> — A stand with the office
            contact block.
          </li>
          <li>
            <strong>Teams</strong> — One code per person for a conference
            pack.
          </li>
          <li>
            <strong>Resumes</strong> — A portfolio site plus phone on one
            mark.
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
          <li>Leave a quiet margin on the card edge.</li>
          <li>Keep logos small so finder squares stay clear.</li>
          <li>Test a save-contact prompt on iOS and Android.</li>
        </ul>
        <p>
          Re-scan a printed card, not only the on-screen preview.
        </p>
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
        <p>After you export a vCard code, these often sit nearby:</p>
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
