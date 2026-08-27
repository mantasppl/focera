import Link from "next/link";

export default function WifiQrCodeGeneratorSeoLanding() {
  return (
    <article className="tool-content">
      <section className="tool-content__section" aria-labelledby="what-is-qr">
        <h2 id="what-is-qr" className="tool-content__heading">
          What Is a QR Code and Why Does It Matter?
        </h2>
        <p>
          A QR code is a grid a camera reads as a string. For guest
          access that string is a Wi‑Fi login — network name, encryption,
          and password — so a phone can join without typing the SSID.
        </p>
        <p>
          A <strong>WiFi QR code generator</strong> fills those fields,
          builds the pattern in the browser, and lets you style colors or
          a logo before you print a table tent or wall sign.
        </p>
        <p>
          Anyone who scans can use the password you encoded. Treat the
          sign as public. Export PNG, SVG, or PDF and test with a phone
          that is not already on the network.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-free-generator"
      >
        <h2 id="why-free-generator" className="tool-content__heading">
          Why Generate a WiFi QR Code Online?
        </h2>
        <p>
          Front-desk staff should not read passwords aloud. A scannable
          sign is faster, and this page builds it locally — no account,
          no watermark, no upload of the passphrase.
        </p>
        <p>
          SSID and password stay on this device during encoding. If you
          also need a landing page for house rules, tag that URL in the{" "}
          <Link href="/utm-builder">free UTM builder</Link> and encode it
          as a separate URL code.
        </p>
        <p>
          Jump to the{" "}
          <a href="#wifi-qr-code-generator-tool">
            WiFi QR code generator tool
          </a>{" "}
          when you are ready for the next sign.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-generate"
      >
        <h2 id="how-to-generate" className="tool-content__heading">
          How to Generate a WiFi QR Code in Three Simple Steps
        </h2>
        <p>Network details first, then style, then a real join test.</p>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter your content.</strong> Choose Wi‑Fi. Fill SSID,
            encryption (WPA, WEP, or open), password if needed, and
            hidden network if it applies.
          </li>
          <li>
            <strong>Customize and preview.</strong> Set colors, modules,
            frame, size, and an optional logo. Watch the live preview.
          </li>
          <li>
            <strong>Download or copy.</strong> PNG or SVG for signs, PDF
            for print, ZIP for a batch of venue codes.
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
        <p>WiFi codes fit jobs where a guest should join in one scan:</p>
        <ul className="tool-content__list">
          <li>
            <strong>Cafés and restaurants</strong> — Table tents instead
            of a password on a chalkboard.
          </li>
          <li>
            <strong>Hotels and events</strong> — Lobby and meeting-room
            signs.
          </li>
          <li>
            <strong>Offices</strong> — Visitor networks on a reception
            desk.
          </li>
          <li>
            <strong>Homes</strong> — A fridge magnet for guests.
          </li>
          <li>
            <strong>Pop-ups</strong> — Temporary SSIDs for a weekend
            stall.
          </li>
          <li>
            <strong>Classrooms</strong> — A lab network without reading
            the passphrase aloud.
          </li>
        </ul>
        <p>
          Changing the password later means a new code. The downloaded
          file is static.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="design-tips">
        <h2 id="design-tips" className="tool-content__heading">
          Design Tips for Scannable, Professional QR Codes
        </h2>
        <p>Hallway lighting and small type kill WiFi signs:</p>
        <ul className="tool-content__list">
          <li>Print larger than a business-card mark for wall scans.</li>
          <li>Dark modules on a light field — skip yellow-on-white.</li>
          <li>Leave a quiet margin; do not crowd the SSID caption.</li>
          <li>Keep logos small so finder squares stay clear.</li>
          <li>Test a join from a phone that is not already connected.</li>
        </ul>
        <p>
          Re-scan the printed sign, not only the on-screen preview.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="privacy">
        <h2 id="privacy" className="tool-content__heading">
          Privacy, Security, and Offline Generation
        </h2>
        <p>
          Network passwords should not travel to a remote encoder. This
          generator builds the image on your device.
        </p>
        <p>
          A posted WiFi QR is a public login. Use a guest network, not
          the office LAN. Rotate the password when the sign comes down.
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
        <p>After you export a WiFi code, these often sit nearby:</p>
        <ul className="tool-content__list">
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Tag a house-rules
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
        <p>Same no-signup layout from SSID fields to a print-ready sign.</p>
      </section>
    </article>
  );
}
