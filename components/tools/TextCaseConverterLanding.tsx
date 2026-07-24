import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Eight case styles",
    description:
      "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case — one click each.",
  },
  {
    title: "Live conversion",
    description:
      "Results update as you type or switch styles. No submit button, no page reload, no waiting on a server.",
  },
  {
    title: "Character & word counts",
    description:
      "See length at a glance while you edit — useful for headlines, bios, and UI copy limits.",
  },
  {
    title: "One-click copy",
    description:
      "Copy the converted string to your clipboard for code, docs, CMS fields, or design mockups.",
  },
  {
    title: "Smart word splitting",
    description:
      "camelCase, snake_case, and spaced phrases are detected so programming cases stay predictable.",
  },
  {
    title: "Private by design",
    description:
      "Every conversion runs locally in your browser. Your text is never uploaded to Focera.",
  },
];

export default function TextCaseConverterLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="text-case-converter-features"
        title="Everything you need in a free text case converter"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="what-is-text-case-converter"
      >
        <h2
          id="what-is-text-case-converter"
          className="tool-content__heading"
        >
          What Is a Text Case Converter?
        </h2>
        <p>
          A <strong>text case converter</strong> changes how letters are
          capitalized — or how words are joined — without rewriting the content
          by hand. Paste a headline, variable name, or paragraph, pick a style,
          and get UPPERCASE, Title Case, camelCase, snake_case, and more in one
          step.
        </p>
        <p>
          Writers use case tools for consistent titles and sentences. Developers
          use them to rename identifiers between camelCase, PascalCase,
          snake_case, and kebab-case when moving between languages, APIs, and
          CSS. Marketers tidy campaign names and slug-ready phrases without
          opening a spreadsheet.
        </p>
        <p>
          Focera&apos;s free case converter runs entirely in your browser. Type
          or paste text, choose a style, copy the result, and keep working —
          with character and word counts visible as you go.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-Focera-text-case"
      >
        <h2 id="why-Focera-text-case" className="tool-content__heading">
          Why Use Focera&apos;s Free Online Case Converter?
        </h2>
        <p>
          Many case tools bury basics behind ads, force a reload for every
          style, or send your draft to a remote API. This page keeps the
          essentials on one screen: eight styles, live output, counts, and
          copy — with no account and no daily quota.
        </p>
        <p>
          Programming cases split mixed input intelligently, so{" "}
          <code>user_id</code>, <code>userId</code>, and &ldquo;user id&rdquo;
          can all become the same target format. Title and sentence styles keep
          readable prose without flattening every separator.
        </p>
        <p>
          Jump to the{" "}
          <a href="#text-case-converter-tool">text case converter tool</a> at
          the top of this page, or browse the{" "}
          <Link href="/tools">full Focera catalog</Link> for related helpers
          like the <Link href="/lorem-ipsum-generator">Lorem Ipsum generator</Link>{" "}
          and <Link href="/unit-converter">unit converter</Link>.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-convert-text-case"
      >
        <h2 id="how-to-convert-text-case" className="tool-content__heading">
          How to Convert Text Case in Seconds
        </h2>
        <p>
          Use the workspace at the top of the page. Output updates in place:
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste or type your text</strong> in the Input field.
          </li>
          <li>
            <strong>Pick a case style</strong> — UPPERCASE, lowercase, Title
            Case, Sentence case, camelCase, PascalCase, snake_case, or
            kebab-case.
          </li>
          <li>
            <strong>Review the live output</strong> and the character / word
            counts under the input.
          </li>
          <li>
            <strong>Copy</strong> the result, or use &ldquo;Use as
            input&rdquo; to chain another conversion.
          </li>
        </ol>
        <p>
          Everything stays on your device. Clear the fields when you are done,
          or leave the page — nothing is stored on Focera.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="text-case-styles-explained"
      >
        <h2
          id="text-case-styles-explained"
          className="tool-content__heading"
        >
          Case Styles Explained
        </h2>
        <p>
          <strong>UPPERCASE</strong> and <strong>lowercase</strong> change
          letter case only and keep spacing and punctuation.{" "}
          <strong>Title Case</strong> capitalizes each word;{" "}
          <strong>Sentence case</strong> capitalizes the start of sentences.
        </p>
        <p>
          <strong>camelCase</strong> and <strong>PascalCase</strong> remove
          separators and join words for identifiers.{" "}
          <strong>snake_case</strong> and <strong>kebab-case</strong> join
          lowercase words with underscores or hyphens — common in databases,
          URLs, and CSS class names.
        </p>
      </section>
    </article>
  );
}
