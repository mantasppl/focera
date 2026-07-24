import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles data. Most tools process content locally in your browser; learn what we collect and why.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main legal-page">
        <p className="page-hero__brand">{SITE_NAME}</p>
        <h1 className="page-hero__title">Privacy Policy</h1>
        <p className="page-hero__lede">
          Last updated: July 24, 2026. This policy explains how {SITE_NAME}{" "}
          ({SITE_URL}) handles information when you use our free online tools.
        </p>

        <article className="legal-prose">
          <section>
            <h2>1. Summary</h2>
            <p>
              {SITE_NAME} is built around privacy-first, browser-based utilities.
              Ready tools such as QR generation, password generation, JSON
              formatting, Markdown editing, minification, invoices, converters,
              and AI background removal process your inputs locally on your
              device whenever possible. We do not sell personal data.
            </p>
          </section>

          <section>
            <h2>2. Information we process</h2>
            <p>
              <strong>Tool inputs.</strong> Content you paste or upload (text,
              images, URLs, invoice drafts, etc.) is generally processed in your
              browser and is not uploaded to {SITE_NAME} servers for those local
              tools. Some drafts may be stored in your browser&apos;s local
              storage so you can refresh without losing work.
            </p>
            <p>
              <strong>Usage analytics (optional).</strong> If Google Analytics 4
              is enabled in production, we may collect aggregated usage metrics
              such as page views, approximate location (country/region), device
              type, and referral source. IP addresses may be anonymized where
              configured.
            </p>
            <p>
              <strong>Technical logs.</strong> Hosting providers may automatically
              log standard request metadata (IP address, user agent, timestamps)
              for security and reliability.
            </p>
          </section>

          <section>
            <h2>3. Cookies and local storage</h2>
            <p>
              We may use essential cookies or local storage for preferences
              (for example editor theme) and, when enabled, analytics cookies
              from Google Analytics. You can clear site data in your browser
              settings at any time.
            </p>
          </section>

          <section>
            <h2>4. Third-party services</h2>
            <p>
              We may use hosting, CDN, and analytics providers. Those providers
              process data under their own terms. When GA4 is active, Google&apos;s
              privacy policy also applies to analytics data.
            </p>
          </section>

          <section>
            <h2>5. Data retention</h2>
            <p>
              Local drafts remain on your device until you clear them. Server
              logs and analytics (if enabled) are retained only as long as
              needed for security, debugging, and product improvement.
            </p>
          </section>

          <section>
            <h2>6. Children</h2>
            <p>
              {SITE_NAME} is not directed at children under 13. We do not
              knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2>7. Your choices</h2>
            <p>
              You can stop using the site, clear browser storage, and block
              analytics cookies via browser or OS controls. For privacy
              questions, contact us through the channels listed on {SITE_URL}.
            </p>
          </section>

          <section>
            <h2>8. Changes</h2>
            <p>
              We may update this policy as tools or infrastructure change. The
              “Last updated” date at the top will reflect the latest revision.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
