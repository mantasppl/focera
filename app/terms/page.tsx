import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: `Terms governing use of ${SITE_NAME} free online tools and AI utilities at ${SITE_URL}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main legal-page">
        <p className="page-hero__brand">{SITE_NAME}</p>
        <h1 className="page-hero__title">Terms of Service</h1>
        <p className="page-hero__lede">
          Last updated: July 24, 2026. By using {SITE_NAME} ({SITE_URL}), you
          agree to these terms.
        </p>

        <article className="legal-prose">
          <section>
            <h2>1. Service description</h2>
            <p>
              {SITE_NAME} provides free online tools and AI utilities for
              personal and commercial use, including generators, converters,
              calculators, and developer helpers. Features may change, and
              “coming soon” tools may be incomplete.
            </p>
          </section>

          <section>
            <h2>2. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Abuse, overload, or attempt to disrupt the service</li>
              <li>Use tools for unlawful, harmful, or fraudulent activity</li>
              <li>Reverse engineer or scrape the site in a way that harms availability</li>
              <li>Misrepresent outputs as coming from another brand without attribution where required by law</li>
            </ul>
          </section>

          <section>
            <h2>3. Your content</h2>
            <p>
              You retain rights to content you create with {SITE_NAME} tools
              (for example QR codes, invoices, exported files). You are
              responsible for ensuring you have the rights to process any data
              or images you upload or paste.
            </p>
          </section>

          <section>
            <h2>4. No warranties</h2>
            <p>
              Tools are provided “as is” without warranties of any kind. We do
              not guarantee uninterrupted availability, perfect accuracy of
              calculations or AI results, or fitness for a particular purpose.
              Always verify critical outputs (financial figures, security
              decisions, production code) independently.
            </p>
          </section>

          <section>
            <h2>5. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, {SITE_NAME} and its
              operators are not liable for indirect, incidental, special, or
              consequential damages arising from your use of the site or tools.
            </p>
          </section>

          <section>
            <h2>6. Intellectual property</h2>
            <p>
              The {SITE_NAME} name, logo, site design, and original content are
              protected. You may not copy the site design or brand assets for
              competing products without permission.
            </p>
          </section>

          <section>
            <h2>7. Privacy</h2>
            <p>
              Our{" "}
              <a href="/privacy">Privacy Policy</a> describes how information
              is handled. Local processing does not eliminate your
              responsibility to handle sensitive data carefully on your device.
            </p>
          </section>

          <section>
            <h2>8. Changes and termination</h2>
            <p>
              We may update these terms or discontinue tools at any time.
              Continued use after changes constitutes acceptance of the updated
              terms.
            </p>
          </section>

          <section>
            <h2>9. Contact</h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a href="mailto:support@focera.co">support@focera.co</a> or via
              the contact form on {SITE_URL}/contact.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
