import Link from "next/link";

export default function UTMBuilderLanding() {
  return (
    <article className="tool-content">
      <section className="tool-content__section" aria-labelledby="what-is-utm">
        <h2 id="what-is-utm" className="tool-content__heading">
          What Are UTM Parameters and Why Do They Matter?
        </h2>
        <p>
          UTM parameters are short tags appended to a URL so analytics platforms
          can attribute traffic to a specific campaign. When someone clicks a
          tagged link, tools like Google Analytics can report which source,
          medium, and campaign drove the visit — instead of dumping everything
          into generic referral noise.
        </p>
        <p>
          Marketers, founders, and content teams rely on a{" "}
          <strong>free UTM builder</strong> when launching emails, social posts,
          paid ads, partner placements, and QR destinations. Consistent naming
          keeps dashboards readable and makes A/B tests comparable across
          channels.
        </p>
        <p>
          Focera&apos;s builder focuses on the three parameters you need most:
          source, medium, and campaign. Paste a base URL, fill the fields you
          care about, and copy a clean tracking link in seconds.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-focera-utm"
      >
        <h2 id="why-focera-utm" className="tool-content__heading">
          Why Use Focera&apos;s Free Online UTM Builder?
        </h2>
        <p>
          Spreadsheet formulas and hand-edited query strings are error-prone.
          Missing a <code>?</code> or duplicating parameters can break landing
          pages or double-count campaigns. An online builder validates the base
          URL and encodes values safely.
        </p>
        <p>
          Everything runs in your browser. Draft campaign URLs are not uploaded
          to Focera. Pair this tool with our{" "}
          <Link href="/qr-generator">free QR code generator</Link> when you need
          a printable entry point to a tagged destination, or browse the{" "}
          <Link href="/tools">Focera catalog</Link> for related marketing and
          analytics helpers.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-utm"
      >
        <h2 id="how-to-utm" className="tool-content__heading">
          How to Build a UTM Link in Three Steps
        </h2>
        <ol className="tool-content__steps">
          <li>
            <strong>Enter the destination URL.</strong> Include the protocol
            (https://) and any existing path or query string you need to keep.
          </li>
          <li>
            <strong>Add source, medium, and campaign.</strong> Examples:
            newsletter / email / spring-sale, or instagram / social /
            product-launch.
          </li>
          <li>
            <strong>Copy the result.</strong> Paste the tagged URL into ads,
            emails, bios, or a QR generator. Empty fields are skipped so you
            never ship blank parameters.
          </li>
        </ol>
        <p>
          Scroll to the{" "}
          <a href="#utm-builder-tool">UTM builder tool</a> above to create your
          first campaign link.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="utm-best-practices"
      >
        <h2 id="utm-best-practices" className="tool-content__heading">
          UTM Naming Best Practices
        </h2>
        <p>
          Use lowercase, hyphens instead of spaces, and a shared vocabulary
          across your team. Prefer stable campaign names over one-off slogans
          that change every week. Document your conventions so reports stay
          comparable month after month.
        </p>
        <p>
          Avoid stuffing personally identifiable information into UTM values.
          Campaign tags should describe channels and initiatives — not
          individual users.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-utm"
      >
        <h2 id="related-utm" className="tool-content__heading">
          Related Free Tools from Focera
        </h2>
        <ul>
          <li>
            <Link href="/qr-generator">QR Code Generator</Link> — Encode your
            tagged URL for print and packaging.
          </li>
          <li>
            <Link href="/profit-calculator">Profit Calculator</Link> — Estimate
            margin before you scale a paid campaign.
          </li>
          <li>
            <Link href="/">Focera home</Link> — Browse every free generator,
            converter, and utility.
          </li>
        </ul>
      </section>
    </article>
  );
}
