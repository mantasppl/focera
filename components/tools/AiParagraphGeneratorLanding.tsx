import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const features = [
  {
    title: "Tone and purpose that match the job",
    description:
      "Neutral, formal, casual, persuasive, friendly, or professional — plus general, blog, product, email, and school purposes so the paragraph fits where it will live.",
  },
  {
    title: "Length and count controls",
    description:
      "Aim for short, medium, or long paragraphs, then generate one, two, three, or five at once instead of begging a chatbot for “just one more paragraph.”",
  },
  {
    title: "Keywords without stuffing",
    description:
      "Optional keywords and talking points are woven in naturally so the draft stays readable instead of keyword-padded.",
  },
  {
    title: "Free, no account",
    description:
      "Generate, copy, and download a TXT draft without signup, credits, or a browser extension.",
  },
];

export default function AiParagraphGeneratorLanding() {
  return (
    <>
      <FeatureGrid
        id="ai-paragraph-generator-features"
        title="Features"
        features={features}
      />

      <article className="tool-content">
        <section
          className="tool-content__section"
          aria-labelledby="how-it-works"
        >
          <h2 id="how-it-works" className="tool-content__heading">
            How It Works
          </h2>
          <p>
            A free AI paragraph generator should feel like a drafting pad, not a
            paywall: describe the idea, set tone and length, and get complete
            paragraphs you can paste into a blog, email, product page, or
            homework draft. Focera keeps the useful controls on one page so you
            do not bounce between a topic box, a tone slider, and a separate
            rewrite tool.
          </p>
          <ol className="tool-content__steps">
            <li>
              <strong>Enter a topic or brief.</strong> Use Paste, or tap Remote
              work, Habits, Product, or Climate to drop in a starter you can
              rewrite.
            </li>
            <li>
              <strong>Set tone, purpose, length, and count.</strong> Add
              optional keywords to include, then generate one paragraph or a
              short block of several.
            </li>
            <li>
              <strong>Copy or download.</strong> Use New variation for another
              take, then polish the draft in the{" "}
              <Link href="/content-improver">AI content improver</Link>.
            </li>
          </ol>
          <p>
            Jump back to the{" "}
            <a href="#ai-paragraph-generator-tool">AI paragraph generator</a>{" "}
            anytime to draft another section.
          </p>
        </section>

        <section
          className="tool-content__section"
          aria-labelledby="modes-compared"
        >
          <h2 id="modes-compared" className="tool-content__heading">
            Built for Real Writing Jobs
          </h2>
          <p>
            Many “paragraph writers” dump a wall of generic text with no length
            control, or lock tone and multi-paragraph output behind credits.
            This tool packs the controls people actually need into one free
            workflow.
          </p>
          <ul>
            <li>
              <strong>Purpose presets</strong> — blog, product, email, and
              school voices instead of one vague “write a paragraph” mode
            </li>
            <li>
              <strong>Exact paragraph counts</strong> — one focused block or up
              to five connected paragraphs
            </li>
            <li>
              <strong>Keyword guidance</strong> — include required phrases
              without forcing awkward stuffing
            </li>
            <li>
              <strong>Variation on demand</strong> — regenerate with a new seed
              when the first draft is close but not right
            </li>
          </ul>
        </section>

        <section
          className="tool-content__section"
          aria-labelledby="use-cases"
        >
          <h2 id="use-cases" className="tool-content__heading">
            Popular Use Cases
          </h2>
          <ul>
            <li>Blog or newsletter body paragraphs from a short outline</li>
            <li>Product feature blurbs that stay benefit-focused</li>
            <li>Email body copy that gets to the point</li>
            <li>School paragraphs you revise into your own voice</li>
          </ul>
          <p>
            Treat the output as a draft. Check facts, then count length with the{" "}
            <Link href="/word-counter">word counter</Link>, expand into a longer
            piece with the <Link href="/essay-writer">AI essay writer</Link>, or
            keep editing in the{" "}
            <Link href="/markdown-editor">Markdown editor</Link>.
          </p>
        </section>

        <section
          className="tool-content__section"
          aria-labelledby="privacy-note"
        >
          <h2 id="privacy-note" className="tool-content__heading">
            Privacy and Generation
          </h2>
          <p>
            Unlike browser-only converters on Focera, paragraph writing needs a
            model hosted by a generation provider. Your prompt is sent to create
            the draft and is not stored by Focera as a personal library. Avoid
            pasting secrets, private personal data, or confidential client
            details.
          </p>
        </section>
      </article>
    </>
  );
}
