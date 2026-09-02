import Link from "next/link";

export default function QrCodeGeneratorWithoutLoginSeoLanding() {
  return (
    <article className="tool-content">
      <section className="tool-content__section" aria-labelledby="what-is-qr">
        <h2 id="what-is-qr" className="tool-content__heading">
          What Is a QR Code and Why Does It Matter?
        </h2>
        <p>
          A QR code is a grid a camera reads as a URL, Wi‑Fi login,
          vCard, or event. You should not need a password to get the
          file onto a flyer.
        </p>
        <p>
          A <strong>QR code generator without login</strong> has no
          returning-user wall. Open the page, encode the payload, and
          download PNG, SVG, or PDF. There is nothing to sign into.
        </p>
        <p>
          Encoding stays in the browser. The mark is static unless you
          encode a URL you host and update later.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-free-generator"
      >
        <h2 id="why-free-generator" className="tool-content__heading">
          Why Generate a QR Code Without Logging In?
        </h2>
        <p>
          Shared office PCs and one-off print jobs should not require a
          saved session. This page never asks for a password. Draft URLs
          are not uploaded to encode the pattern.
        </p>
        <p>
          Tag campaign links in the{" "}
          <Link href="/utm-builder">free UTM builder</Link> if you need
          reports, then paste the finished URL here.
        </p>
        <p>
          Jump to the{" "}
          <a href="#qr-code-generator-without-login-tool">
            QR code generator without login tool
          </a>{" "}
          when you are ready for the next file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-generate"
      >
        <h2 id="how-to-generate" className="tool-content__heading">
          How to Generate a QR Code Without a Login in Three Steps
        </h2>
        <p>No password. Payload, style, download.</p>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter your content.</strong> Paste a https:// URL or
            fill Wi‑Fi, vCard, email, SMS, event, geo, or app fields.
          </li>
          <li>
            <strong>Customize and preview.</strong> Set colors, modules,
            frame, size, and an optional logo.
          </li>
          <li>
            <strong>Download or copy.</strong> PNG or SVG for layouts, PDF
            for print, ZIP for a batch — no login prompt.
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
        <p>No-login generation fits jobs where accounts slow people down:</p>
        <ul className="tool-content__list">
          <li>
            <strong>Front desk</strong> — A Wi‑Fi tent on a shared PC.
          </li>
          <li>
            <strong>Print shops</strong> — A last-minute flyer file.
          </li>
          <li>
            <strong>Events</strong> — Staff making codes without a vendor
            login.
          </li>
          <li>
            <strong>Classrooms</strong> — A form URL on a borrowed laptop.
          </li>
          <li>
            <strong>Pop-ups</strong> — A checkout URL at a stall.
          </li>
          <li>
            <strong>Cards</strong> — A vCard before a meeting.
          </li>
        </ul>
        <p>
          Encode a URL you control if the destination might move later.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="design-tips">
        <h2 id="design-tips" className="tool-content__heading">
          Design Tips for Scannable, Professional QR Codes
        </h2>
        <p>Skipping login does not skip contrast:</p>
        <ul className="tool-content__list">
          <li>Dark modules on a light field.</li>
          <li>Leave a quiet margin around finder patterns.</li>
          <li>Size for scan distance.</li>
          <li>Keep logos small.</li>
          <li>Test two phones before a bulk run.</li>
        </ul>
        <p>Re-scan the exported file, not only the preview.</p>
      </section>

      <section className="tool-content__section" aria-labelledby="privacy">
        <h2 id="privacy" className="tool-content__heading">
          Privacy, Security, and Offline Generation
        </h2>
        <p>
          No login means no password stored here. Encoding still runs on
          this device.
        </p>
        <p>
          Anyone who scans reaches the live destination. Skip secrets.
          Use HTTPS and confirm the page after launch.
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
        <p>After a no-login download, these often sit nearby:</p>
        <ul className="tool-content__list">
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Tag URLs before
            you encode them.
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
        <p>Same no-password layout from a tagged URL to a print file.</p>
      </section>
    </article>
  );
}
