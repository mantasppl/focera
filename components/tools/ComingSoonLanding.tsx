import Link from "next/link";

type ComingSoonLandingProps = {
  name: string;
  summary: string;
  howTo: string[];
};

export default function ComingSoonLanding({
  name,
  summary,
  howTo,
}: ComingSoonLandingProps) {
  return (
    <article className="tool-content">
      <section className="tool-content__section">
        <h2 className="tool-content__heading">About this {name}</h2>
        <p>{summary}</p>
        <p>
          This Focera page is live for SEO and navigation while the interactive
          experience is finished. The layout, FAQ, and privacy-first approach
          already match the rest of the catalog.
        </p>
      </section>

      <section className="tool-content__section">
        <h2 className="tool-content__heading">How it will work</h2>
        <ol className="tool-content__steps">
          {howTo.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="tool-content__section">
        <h2 className="tool-content__heading">Explore ready tools now</h2>
        <p>
          While you wait, try a ready utility such as the{" "}
          <Link href="/background-remover">AI background remover</Link>,{" "}
          <Link href="/qr-generator">QR code generator</Link>, or{" "}
          <Link href="/json-formatter">JSON formatter</Link>. Browse the{" "}
          <Link href="/tools">full Focera catalog</Link> anytime.
        </p>
      </section>
    </article>
  );
}
