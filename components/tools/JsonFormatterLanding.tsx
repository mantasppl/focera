import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Pretty-print JSON",
    description:
      "Format messy or minified JSON with consistent 2-space indentation for readable debugging and reviews.",
  },
  {
    title: "Validate instantly",
    description:
      "Catch syntax errors before they hit your API. See line and column when a parse fails.",
  },
  {
    title: "Minify for production",
    description:
      "Collapse whitespace into a compact single-line payload for requests, configs, and storage.",
  },
  {
    title: "Copy & download",
    description:
      "Copy formatted JSON to the clipboard or download a .json file — no account required.",
  },
  {
    title: "Error highlighting",
    description:
      "Invalid lines are marked in the gutter so you can jump straight to the problem.",
  },
  {
    title: "Dark editor mode",
    description:
      "Switch between light and dark editor themes. Your preference is remembered locally.",
  },
];

export default function JsonFormatterLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="json-formatter-features"
        title="Everything you need in a free JSON formatter"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="what-is-json-formatter"
      >
        <h2 id="what-is-json-formatter" className="tool-content__heading">
          What Is a JSON Formatter?
        </h2>
        <p>
          A JSON formatter takes raw JavaScript Object Notation — often copied from
          an API response, log file, or config — and turns it into clean, indented
          text that humans can scan. The same tool can validate syntax, minify
          payloads for production, and surface parse errors with precise locations
          so you fix issues faster.
        </p>
        <p>
          JSON is the lingua franca of modern APIs, webhooks, and configuration
          files. When a response arrives as one dense line, or when a hand-edited
          file has a missing comma, a{" "}
          <strong>free online JSON formatter</strong> is the quickest way to regain
          readability without installing an IDE plugin or sending data to a remote
          formatter service.
        </p>
        <p>
          Focera&apos;s JSON beautifier and validator runs entirely in your
          browser. Paste, format, minify, copy, or download — your payloads stay on
          your device.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-Focera-json"
      >
        <h2 id="why-Focera-json" className="tool-content__heading">
          Why Use Focera&apos;s Free Online JSON Formatter?
        </h2>
        <p>
          Many online formatters upload your content to a server for processing.
          That is unnecessary for standard JSON.parse and JSON.stringify work, and
          it is a poor fit for tokens, customer data, or internal configs. This
          tool formats and validates locally so sensitive examples never leave your
          machine.
        </p>
        <p>
          You get the essentials developers reach for every day: pretty-print with
          2-space indentation, minify for compact requests, validation with line
          and column reporting, error highlighting in the gutter, clipboard copy,
          and .json download. A dark editor mode keeps late-night debugging
          comfortable without changing the rest of the site.
        </p>
        <p>
          No account, no daily quota, and no watermark. Scroll to the{" "}
          <a href="#json-formatter-tool">JSON formatter tool</a> at the top of this
          page to start, or browse the full{" "}
          <Link href="/tools">Focera catalog</Link> for related developer helpers.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-format-json"
      >
        <h2 id="how-to-format-json" className="tool-content__heading">
          How to Format and Validate JSON in Seconds
        </h2>
        <p>
          Use the workspace at the top of the page. Everything updates in place so
          you can iterate quickly:
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste your JSON.</strong> Drop an API response, config snippet,
            or minified payload into the editor. Line numbers appear automatically.
          </li>
          <li>
            <strong>Format or minify.</strong> Click Format for readable indentation,
            or Minify to collapse whitespace into a single line.
          </li>
          <li>
            <strong>Validate when unsure.</strong> Validate checks syntax without
            changing spacing. If something is wrong, the status bar shows the line
            and column and the gutter highlights the problem line.
          </li>
          <li>
            <strong>Copy or download.</strong> Copy the result to your clipboard, or
            download a .json file for sharing and archiving.
          </li>
        </ol>
        <p>
          Prefer a darker canvas for code? Toggle Dark / Light in the toolbar. The
          choice is stored in local storage on your device only.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="json-tips"
      >
        <h2 id="json-tips" className="tool-content__heading">
          Tips for Clean, Valid JSON
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Use double quotes for keys and strings.</strong> Single quotes
            are valid in JavaScript objects but not in strict JSON.
          </li>
          <li>
            <strong>Avoid trailing commas.</strong> A comma after the last property
            or array item is a common paste error from JS/TS source.
          </li>
          <li>
            <strong>Watch for comments.</strong> Standard JSON does not allow{" "}
            <code>{"//"}</code> or <code>{"/* */"}</code> comments — strip them
            before validating.
          </li>
          <li>
            <strong>Escape special characters.</strong> Newlines and quotes inside
            strings must be escaped (<code>\\n</code>, <code>\\&quot;</code>).
          </li>
          <li>
            <strong>Prefer minify for transport.</strong> Pretty-print for humans;
            minify when size or single-line logs matter.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="json-use-cases"
      >
        <h2 id="json-use-cases" className="tool-content__heading">
          Popular Use Cases
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>API debugging</strong> — Beautify responses from curl, Postman,
            or browser DevTools to inspect nested fields.
          </li>
          <li>
            <strong>Config review</strong> — Format package manifests, theme files,
            and infrastructure snippets before committing.
          </li>
          <li>
            <strong>Support tickets</strong> — Validate customer-provided JSON
            payloads and point to the exact failing line.
          </li>
          <li>
            <strong>Education</strong> — Learn JSON syntax with immediate feedback
            from the validator and error highlighter.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="json-privacy"
      >
        <h2 id="json-privacy" className="tool-content__heading">
          Privacy and Local Processing
        </h2>
        <p>
          Formatting and validation use your browser&apos;s built-in JSON parser.
          Content is not uploaded to Focera for processing. Theme preference is
          the only related value stored locally, and it never includes your JSON.
        </p>
        <p>
          Still treat secrets carefully: clear the editor on shared machines, and
          avoid pasting production credentials into any web page you do not fully
          trust. Local processing reduces risk; good hygiene finishes the job.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-json"
      >
        <h2 id="related-json" className="tool-content__heading">
          Related Free Tools from Focera
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/markdown-editor">Markdown Editor</Link> — Write Markdown
            with a live preview and export to HTML or PDF.
          </li>
          <li>
            <Link href="/utm-builder">UTM Builder</Link> — Build tracked campaign
            URLs for marketing and analytics workflows.
          </li>
          <li>
            <Link href="/password-generator">Password Generator</Link> — Create
            strong random passwords locally in your browser.
          </li>
          <li>
            <Link href="/">Focera home</Link> — Browse every free generator,
            calculator, and developer helper in one place.
          </li>
        </ul>
      </section>
    </article>
  );
}
