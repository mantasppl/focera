import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CONTACT_EMAIL } from "@/lib/contact";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Get in touch with ${SITE_NAME}. Send a message or email ${CONTACT_EMAIL}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="page-shell">
      <Header />
      <main className="page-main">
        <section className="page-hero">
          <p className="page-hero__brand">{SITE_NAME}</p>
          <h1 className="page-hero__title">Contact</h1>
          <p className="page-hero__lede">
            Questions, feedback, or partnership ideas — send a message and we
            will reply by email.
          </p>
        </section>

        <section
          className="page-section contact-section"
          aria-labelledby="contact-heading"
          id="contact"
        >
          <div className="contact-section__grid">
            <div className="contact-section__info">
              <h2 id="contact-heading" className="section-heading">
                Reach us
              </h2>
              <p className="contact-section__lede">
                Prefer email? Write directly to our support inbox.
              </p>
              <a
                className="contact-section__email"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="contact-section__form-wrap">
              <h2 className="section-heading">Send a message</h2>
              <p className="contact-section__lede">
                Share your email and message — we&apos;ll route it to{" "}
                {CONTACT_EMAIL}.
              </p>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
