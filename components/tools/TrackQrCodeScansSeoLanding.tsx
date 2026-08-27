import Link from "next/link";

export default function TrackQrCodeScansSeoLanding() {
  return (
    <article className="tool-content">
      <section className="tool-content__section" aria-labelledby="what-is-qr">
        <h2 id="what-is-qr" className="tool-content__heading">
          What Is a QR Code and Why Does It Matter?
        </h2>
        <p>
          A QR code is a pointer. When someone scans it, their phone
          opens the string you encoded — usually a URL. The image itself
          does not phone home with a scan count.
        </p>
        <p>
          To <strong>track QR code scans</strong>, encode a URL you already
          measure: add campaign tags, host the landing page, and read
          visits there. This generator builds the mark in the browser. It
          does not run a scan dashboard.
        </p>
        <p>
          Export PNG, SVG, or PDF. Confirm the tagged link opens before
          a print run.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-free-generator"
      >
        <h2 id="why-free-generator" className="tool-content__heading">
          Why Track QR Code Scans This Way?
        </h2>
        <p>
          Print still needs a file. Measurement belongs on the page you
          own. Tag the destination, generate the code here for free, and
          keep using the reports you already trust on that site.
        </p>
        <p>
          Build the query string in the{" "}
          <Link href="/utm-builder">free UTM builder</Link>, then encode
          the finished URL so each flyer, carton, or slide can be told
          apart in those reports.
        </p>
        <p>
          Jump to the{" "}
          <a href="#track-qr-code-scans-tool">track QR code scans tool</a>{" "}
          when you are ready for the next tagged mark.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-generate"
      >
        <h2 id="how-to-generate" className="tool-content__heading">
          How to Track QR Code Scans in Three Simple Steps
        </h2>
        <p>Tag first, encode second, measure on the live page.</p>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter your content.</strong> Paste a full https:// URL
            with campaign tags, or fill Wi‑Fi, vCard, and other fields
            when you do not need visit counts.
          </li>
          <li>
            <strong>Customize and preview.</strong> Colors, modules, frames,
            size, and an optional logo update live.
          </li>
          <li>
            <strong>Download or copy.</strong> PNG or SVG for layouts, PDF
            for print, ZIP for a batch of tagged codes.
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
        <p>Tagged URLs fit jobs where you need to know which print worked:</p>
        <ul className="tool-content__list">
          <li>
            <strong>Flyers vs posters</strong> — Different tags, one
            landing page.
          </li>
          <li>
            <strong>Packaging</strong> — A SKU or campaign tag on the
            carton URL.
          </li>
          <li>
            <strong>Venues</strong> — Table tents vs window clings.
          </li>
          <li>
            <strong>Events</strong> — Badge vs program vs email follow-up.
          </li>
          <li>
            <strong>Retail</strong> — Shelf talkers versus receipt slips.
          </li>
          <li>
            <strong>Untracked jobs</strong> — Wi‑Fi and vCards when a
            count is not the goal.
          </li>
        </ul>
        <p>
          The downloaded file is static. Change tags only by encoding a
          new URL, or by updating a redirect you host.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="design-tips">
        <h2 id="design-tips" className="tool-content__heading">
          Design Tips for Scannable, Professional QR Codes
        </h2>
        <p>Long tagged URLs make denser grids:</p>
        <ul className="tool-content__list">
          <li>Keep modules darker than the field.</li>
          <li>Leave a quiet margin around the mark.</li>
          <li>Prefer a short path plus tags on small stickers.</li>
          <li>Scan the tagged URL, not only the preview.</li>
          <li>Test two phones before a bulk run.</li>
        </ul>
        <p>Re-scan after logos and color changes.</p>
      </section>

      <section className="tool-content__section" aria-labelledby="privacy">
        <h2 id="privacy" className="tool-content__heading">
          Privacy, Security, and Offline Generation
        </h2>
        <p>
          Campaign URLs stay on this device during encoding. This page
          does not receive scan events.
        </p>
        <p>
          Anyone who scans reaches the live page. Skip secrets in query
          strings. Use HTTPS and confirm the destination after launch.
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
        <p>After you encode a tagged URL, these often sit nearby:</p>
        <ul className="tool-content__list">
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Build the tags
            before you generate the mark.
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
        <p>Same no-signup layout from campaign tags to a print-ready file.</p>
      </section>
    </article>
  );
}
