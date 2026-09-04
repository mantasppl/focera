import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const features = [
  {
    title: "14 improvement modes",
    description:
      "Polish grammar, paraphrase, formalize, simplify, shorten, expand, humanize, persuade, and more — inspired by the best rewriting tools in one place.",
  },
  {
    title: "Light to strong rewrites",
    description:
      "Pick gentle edits when you only need cleanup, or a bold rewrite when the draft needs a bigger lift — without losing your meaning.",
  },
  {
    title: "Fast side-by-side workflow",
    description:
      "Paste on the left, get improved copy on the right. Copy, download TXT, or send the result back as input for another pass.",
  },
  {
    title: "Free, no account",
    description:
      "Improve drafts without signup, credit packs, or browser extensions. Open the page and start editing.",
  },
];

export default function ContentImproverLanding() {
  return (
    <>
      <FeatureGrid
        id="content-improver-features"
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
            A free AI content improver should feel instant: paste a draft, choose
            a mode, and read a clearer version. Focera keeps grammar polish,
            paraphrasing, tone shifts, and length control on one page so you do
            not bounce between Grammarly-style fixes, QuillBot-style rewrites,
            and Wordtune-style tone tools.
          </p>
          <ol className="tool-content__steps">
            <li>
              <strong>Paste or start writing.</strong> Use Paste, or tap Email,
              Caption, Blog, or Product to drop in a short draft you can
              improve right away.
            </li>
            <li>
              <strong>Choose a mode and strength.</strong> Start with Polish for
              correctness, Paraphrase for fresh wording, Shorten for concision,
              or Formal / Casual when audience tone matters.
            </li>
            <li>
              <strong>Improve, compare, iterate.</strong> Copy the result,
              download a TXT file, or tap Use as input to refine again with a
              different mode.
            </li>
          </ol>
          <p>
            Jump back to the{" "}
            <a href="#content-improver-tool">AI content improver</a> anytime to
            run another pass.
          </p>
        </section>

        <section
          className="tool-content__section"
          aria-labelledby="modes-compared"
        >
          <h2 id="modes-compared" className="tool-content__heading">
            Modes Inspired by Top Improvers
          </h2>
          <p>
            Popular writing tools specialize: Grammarly for correctness and
            clarity, QuillBot for multi-mode paraphrasing, Wordtune for
            sentence-level tone and length, Hemingway for tightening, and Jasper
            for persuasive marketing. This tool packs the most-used jobs into
            one free workflow.
          </p>
          <ul>
            <li>
              <strong>Polish & Fluency</strong> — grammar, spelling, and smooth
              flow without reinventing the draft
            </li>
            <li>
              <strong>Paraphrase, Creative, Humanize</strong> — fresh wording
              that still keeps your meaning
            </li>
            <li>
              <strong>Formal, Casual, Academic, Confident</strong> — tone
              shifts for school, work, and social writing
            </li>
            <li>
              <strong>Shorten, Expand, Simplify, SEO, Persuasive</strong> —
              length, plain language, scannable web copy, and marketing punch
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
            <li>Clean up emails and Slack messages before you send</li>
            <li>Paraphrase study notes or blog drafts into clearer prose</li>
            <li>Shift product copy between casual and formal brand voices</li>
            <li>Shorten long paragraphs for social posts and ads</li>
            <li>Humanize stiff AI drafts so they sound more natural</li>
          </ul>
          <p>
            After you improve a draft, check length with the{" "}
            <Link href="/word-counter">word counter</Link>, draft a full essay
            with the <Link href="/essay-writer">AI essay writer</Link>, or keep
            editing in the <Link href="/markdown-editor">Markdown editor</Link>.
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
            Unlike browser-only converters on Focera, content improvement needs a
            model hosted by a generation provider. Your text is sent to create
            the rewrite and is not stored by Focera as a personal library. Avoid
            pasting secrets, private personal data, or confidential client
            details.
          </p>
        </section>
      </article>
    </>
  );
}
