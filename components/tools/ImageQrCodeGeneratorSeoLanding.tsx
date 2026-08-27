import Link from "next/link";

export default function ImageQrCodeGeneratorSeoLanding() {
  return (
    <article className="tool-content">
      <section className="tool-content__section" aria-labelledby="what-is-qr">
        <h2 id="what-is-qr" className="tool-content__heading">
          What Is a QR Code and Why Does It Matter?
        </h2>
        <p>
          A QR code is a grid a camera reads as a string — a URL, Wi‑Fi
          login, vCard, or event. The download is often an image: PNG for
          slides and social, SVG for print layouts, with an optional logo
          in the center.
        </p>
        <p>
          An <strong>image QR code generator</strong> builds that file in
          the browser. It does not pack a photograph into the payload. If
          the scan should open a picture, encode a URL to an image you
          host.
        </p>
        <p>
          You can also export PDF. Test the PNG on a phone after you add
          a logo — overlays fail more codes than color.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-free-generator"
      >
        <h2 id="why-free-generator" className="tool-content__heading">
          Why Generate a QR Code Image Online?
        </h2>
        <p>
          Layouts need a file, not a screenshot. This page downloads PNG
          or SVG, supports a transparent field, and can place a logo —
          no account, no watermark.
        </p>
        <p>
          Payloads and logo files stay on this device during encoding. If
          the destination needs tracking, finish the link in the{" "}
          <Link href="/utm-builder">free UTM builder</Link>, then generate
          the image from that URL.
        </p>
        <p>
          Jump to the{" "}
          <a href="#image-qr-code-generator-tool">
            image QR code generator tool
          </a>{" "}
          when you are ready for the next file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-generate"
      >
        <h2 id="how-to-generate" className="tool-content__heading">
          How to Generate a QR Code Image in Three Simple Steps
        </h2>
        <p>Payload first, then look, then an image download.</p>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter your content.</strong> Paste a https:// URL or
            fill Wi‑Fi, vCard, email, SMS, event, geo, or app fields.
          </li>
          <li>
            <strong>Customize and preview.</strong> Set colors, modules,
            frame, size, and an optional logo. Watch the live preview.
          </li>
          <li>
            <strong>Download or copy.</strong> PNG for most layouts, SVG
            for vectors, PDF for print, ZIP for a batch of images.
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
        <p>QR images fit jobs where you drop a file into artwork:</p>
        <ul className="tool-content__list">
          <li>
            <strong>Slides and social</strong> — A PNG on a closing
            frame or story.
          </li>
          <li>
            <strong>Print layouts</strong> — SVG in a poster or carton
            file.
          </li>
          <li>
            <strong>Packaging</strong> — A logo-centered mark on a
            product panel.
          </li>
          <li>
            <strong>Email</strong> — A compact PNG in a signature.
          </li>
          <li>
            <strong>Photo posters</strong> — Transparent PNG over a
            light area of the image.
          </li>
          <li>
            <strong>Batch kits</strong> — A ZIP of PNG codes for a
            campaign set.
          </li>
        </ul>
        <p>
          Style does not make the payload editable. To change what the
          scan opens, encode a URL you control.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="design-tips">
        <h2 id="design-tips" className="tool-content__heading">
          Design Tips for Scannable, Professional QR Codes
        </h2>
        <p>Image exports fail when contrast or logos go too far:</p>
        <ul className="tool-content__list">
          <li>Keep modules darker than the field in the PNG.</li>
          <li>Keep the logo small. Finder squares must stay clear.</li>
          <li>Leave a quiet margin — do not crop to the modules.</li>
          <li>Use SVG when you need to scale without blur.</li>
          <li>Scan the exported image, not only the on-screen preview.</li>
        </ul>
        <p>
          Test two phones, including low light, before bulk print.
        </p>
      </section>

      <section className="tool-content__section" aria-labelledby="privacy">
        <h2 id="privacy" className="tool-content__heading">
          Privacy, Security, and Offline Generation
        </h2>
        <p>
          Logo artwork and draft URLs should not travel to a remote
          encoder. This generator builds the image on your device.
        </p>
        <p>
          The file is still a public pointer. Skip passwords and personal
          data. Use HTTPS and confirm the live page after launch.
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
        <p>After you export a QR image, these often sit nearby:</p>
        <ul className="tool-content__list">
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Tag URLs before
            you download the PNG.
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
        <p>Same no-signup layout from a PNG download to campaign tags.</p>
      </section>
    </article>
  );
}
