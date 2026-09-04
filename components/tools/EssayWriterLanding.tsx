import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const features = [
  {
    title: "School essay types in one place",
    description:
      "Argumentative, persuasive, expository, narrative, compare/contrast, cause/effect, research, and admission drafts — without bouncing between separate writers.",
  },
  {
    title: "Level, length, and outline",
    description:
      "Match middle school through graduate voice, aim for ~350, ~650, or ~1000 words, and optionally generate an outline above the essay.",
  },
  {
    title: "Honest citations",
    description:
      "MLA, APA, or Chicago formatting when you need it — with a hard rule against invented authors, papers, and page numbers that other generators often fabricate.",
  },
  {
    title: "Free, no account",
    description:
      "Write, copy, and download a TXT draft without signup, credit packs, or a browser extension.",
  },
];

export default function EssayWriterLanding() {
  return (
    <>
      <FeatureGrid
        id="essay-writer-features"
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
            A free AI essay writer should feel like a drafting desk, not a
            paywall: enter a prompt, set the assignment constraints, and read a
            complete draft. Focera keeps essay type, academic level, length,
            citations, and voice on one page so you do not juggle a topic-only
            generator, a separate outline tool, and a citation formatter.
          </p>
          <ol className="tool-content__steps">
            <li>
              <strong>Paste a topic or assignment.</strong> Use Paste, or tap
              Climate, Social media, College, or History to drop in a starter
              prompt you can rewrite.
            </li>
            <li>
              <strong>Set type, level, and length.</strong> Add optional notes
              for a thesis or points to cover. Choose citations and Natural
              voice when you want less formulaic prose.
            </li>
            <li>
              <strong>Write, copy, or download.</strong> Use New variation for
              another take, then polish the draft in the{" "}
              <Link href="/content-improver">AI content improver</Link>.
            </li>
          </ol>
          <p>
            Jump back to the{" "}
            <a href="#essay-writer-tool">AI essay writer</a> anytime to generate
            another draft.
          </p>
        </section>

        <section
          className="tool-content__section"
          aria-labelledby="modes-compared"
        >
          <h2 id="modes-compared" className="tool-content__heading">
            Built to Beat Typical Essay Generators
          </h2>
          <p>
            Popular essay writers specialize and then charge: topic-only boxes
            with ads, academic-level sliders behind credits, outline-plus-essay
            behind a subscription, and citation styles that invent papers. This
            tool packs the useful controls into one free workflow and refuses
            fake sources.
          </p>
          <ul>
            <li>
              <strong>Types that match real assignments</strong> — argumentative
              through admission, not a single “essay” dump
            </li>
            <li>
              <strong>Extra notes</strong> — thesis, required points, or
              constraints most free writers never ask for
            </li>
            <li>
              <strong>Outline + essay</strong> — plan and draft together instead
              of paying for a second step
            </li>
            <li>
              <strong>Natural voice</strong> — fewer stock transitions and less
              generic AI rhythm
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
            <li>First drafts for classroom argument and expository prompts</li>
            <li>Compare/contrast and cause/effect outlines before you revise</li>
            <li>Admission-essay story frames you then rewrite in your own voice</li>
            <li>Research-style surveys of a topic before you add real sources</li>
          </ul>
          <p>
            Treat the output as a draft. Check facts, add sources you have
            actually read, and count length with the{" "}
            <Link href="/word-counter">word counter</Link> or keep editing in
            the <Link href="/markdown-editor">Markdown editor</Link>.
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
            Unlike browser-only converters on Focera, essay writing needs a
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
