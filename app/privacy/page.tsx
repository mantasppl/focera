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
          Last updated: August 25, 2026. This policy explains how {SITE_NAME}{" "}
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
              <strong>Usage analytics.</strong> In production we use Google
              Analytics 4 and Microsoft Clarity to understand how the site is
              used. GA4 may collect aggregated metrics such as page views,
              approximate location (country/region), device type, and referral
              source. IP addresses may be anonymized where configured. Clarity
              may collect similar usage data plus interaction details (clicks,
              scrolls, and mouse movement) and session recordings that help us
              see how pages are used. Recordings can include on-screen content
              from the pages you visit; we do not use them to sell personal
              data.
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
              (for example editor theme) and analytics cookies from Google
              Analytics and Microsoft Clarity. You can clear site data in your
              browser settings at any time.
            </p>
          </section>

          <section>
            <h2>4. Third-party services</h2>
            <p>
              We may use hosting, CDN, and analytics providers. Those providers
              process data under their own terms. Google&apos;s privacy policy
              applies to GA4 data. Microsoft&apos;s privacy statement applies to
              Clarity data. See{" "}
              <a
                href="https://policies.google.com/privacy"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://www.microsoft.com/privacy/privacystatement"
                rel="noopener noreferrer"
                target="_blank"
              >
                Microsoft Privacy Statement
              </a>
              .
            </p>
          </section>

          <section>
            <h2>5. Data retention</h2>
            <p>
              Local drafts remain on your device until you clear them. Server
              logs and analytics data (including Clarity recordings) are
              retained only as long as needed for security, debugging, and
              product improvement.
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
              analytics cookies via browser or OS controls. You can also opt
              out of Clarity at{" "}
              <a
                href="https://aka.ms/clarityoptout"
                rel="noopener noreferrer"
                target="_blank"
              >
                aka.ms/clarityoptout
              </a>
              . For privacy questions, email{" "}
              <a href="mailto:support@focera.co">support@focera.co</a> or use
              the contact form on {SITE_URL}/contact.
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
