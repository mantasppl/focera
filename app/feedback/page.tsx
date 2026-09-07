import type { Metadata } from "next";
import FeedbackForm from "@/components/FeedbackForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CONTACT_EMAIL } from "@/lib/contact";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Report feedback",
  description: `Report a bug, suggest an improvement, or request a new feature for ${SITE_NAME}.`,
  path: "/feedback",
});

export default function FeedbackPage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        <section className="page-hero">
          <p className="page-hero__brand">{SITE_NAME}</p>
          <h1 className="page-hero__title">Report feedback</h1>
          <p className="page-hero__lede">
            Found a bug, spotted a rough edge, or have an idea for a new tool?
            Tell us — we use this inbox to fix issues and decide what to build
            next.
          </p>
        </section>

        <section
          className="page-section contact-section"
          aria-labelledby="feedback-heading"
          id="feedback"
        >
          <div className="contact-section__grid">
            <div className="contact-section__info">
              <h2 id="feedback-heading" className="section-heading">
                What you can send
              </h2>
              <p className="contact-section__lede">
                Bug reports, usability improvements, missing features, and new
                tool ideas are all welcome. A short description is enough —
                screenshots or steps to reproduce help when you have them.
              </p>
              <p className="contact-section__lede">
                Prefer email? Write directly to our support inbox.
              </p>
              <a
                className="contact-section__email"
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Focera feedback")}`}
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="contact-section__form-wrap">
              <h2 className="section-heading">Send a report</h2>
              <p className="contact-section__lede">
                Email is optional. Leave it blank if you prefer to stay
                anonymous — we still read every message at {CONTACT_EMAIL}.
              </p>
              <FeedbackForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
