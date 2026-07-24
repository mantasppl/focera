import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Live preview",
    description:
      "Write Markdown on the left and see a sanitized HTML preview update as you type — side by side on desktop.",
  },
  {
    title: "Syntax highlighting",
    description:
      "Fenced code blocks are highlighted with highlight.js so technical docs and snippets stay readable.",
  },
  {
    title: "Export Markdown",
    description:
      "Download your source as a .md file for GitHub, Notion imports, or your notes app.",
  },
  {
    title: "Export HTML & PDF",
    description:
      "Save a self-contained .html document or a print-ready PDF generated entirely in your browser.",
  },
  {
    title: "Copy HTML",
    description:
      "Copy the rendered HTML to paste into CMS fields, email templates, or static pages.",
  },
  {
    title: "Dark editor mode",
    description:
      "Toggle light and dark editor themes. Your preference and draft stay in local storage only.",
  },
];

export default function MarkdownEditorLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="markdown-editor-features"
        title="Everything you need in a free Markdown editor"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="what-is-markdown-editor"
      >
        <h2 id="what-is-markdown-editor" className="tool-content__heading">
          What Is an Online Markdown Editor?
        </h2>
        <p>
          A Markdown editor lets you write plain-text documents using lightweight
          markup — headings, lists, links, tables, and code fences — then preview
          how they will look when rendered as HTML. It is the standard format for
          README files, technical blogs, changelogs, and many note-taking apps.
        </p>
        <p>
          An{" "}
          <strong>online Markdown editor with live preview</strong> removes the
          guesswork: you see formatted output while you write, without installing
          a desktop app or sending drafts to a remote server.
        </p>
        <p>
          Focera&apos;s Markdown editor runs entirely in your browser. Drafts,
          exports, and theme preferences stay on your device.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-Focera-markdown"
      >
        <h2 id="why-Focera-markdown" className="tool-content__heading">
          Why Use Focera&apos;s Free Markdown Editor?
        </h2>
        <p>
          Many browser Markdown tools upload your content for rendering. That is
          unnecessary for standard Markdown-to-HTML conversion, and it is a poor
          fit for private notes, API docs with tokens, or unpublished drafts. This
          editor parses and sanitizes locally so sensitive writing never leaves
          your machine.
        </p>
        <p>
          You get the essentials writers and developers use daily: live preview,
          GFM-friendly tables and lists, syntax-highlighted code blocks, Markdown
          / HTML / PDF export, HTML clipboard copy, word and character counts, and
          a dark editor mode for long sessions.
        </p>
        <p>
          No account, no watermark, and no daily quota. Jump to the{" "}
          <a href="#markdown-editor-tool">Markdown editor tool</a> at the top of
          this page, or browse the full{" "}
          <Link href="/tools">Focera catalog</Link> for related developer
          helpers.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-use-markdown-editor"
      >
        <h2 id="how-to-use-markdown-editor" className="tool-content__heading">
          How to Write and Export Markdown in Seconds
        </h2>
        <p>
          Use the workspace at the top of the page. Everything updates in place:
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Write or paste Markdown.</strong> Use the editor pane on the
            left. Line numbers and a live word count keep you oriented.
          </li>
          <li>
            <strong>Preview as you go.</strong> The right pane shows sanitized
            HTML with highlighted code blocks as soon as you type.
          </li>
          <li>
            <strong>Export what you need.</strong> Download{" "}
            <code>.md</code>, <code>.html</code>, or <code>.pdf</code>, or copy
            rendered HTML for pasting elsewhere.
          </li>
          <li>
            <strong>Optional dark mode.</strong> Toggle Dark / Light in the
            toolbar. The choice is stored locally on your device.
          </li>
        </ol>
        <p>
          Need a starting point? Click Sample to load a short document that
          demonstrates headings, tables, quotes, and a highlighted TypeScript
          snippet.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="markdown-tips"
      >
        <h2 id="markdown-tips" className="tool-content__heading">
          Tips for Clean, Portable Markdown
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Prefer ATX headings.</strong> Use{" "}
            <code>#</code> through <code>######</code> for structure that
            transfers cleanly across GitHub, docs sites, and CMS tools.
          </li>
          <li>
            <strong>Fence code with a language tag.</strong>{" "}
            <code>```ts</code> or <code>```python</code> enables syntax
            highlighting in the preview.
          </li>
          <li>
            <strong>Leave a blank line before lists.</strong> Most parsers
            render lists more reliably when separated from the previous
            paragraph.
          </li>
          <li>
            <strong>Keep links absolute for HTML export.</strong> Relative paths
            may break when the HTML file is opened outside its original folder.
          </li>
          <li>
            <strong>Export Markdown for editing later.</strong> Keep the{" "}
            <code>.md</code> source as the source of truth; use HTML or PDF for
            sharing.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="markdown-use-cases"
      >
        <h2 id="markdown-use-cases" className="tool-content__heading">
          Popular Use Cases
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>README drafting</strong> — Compose GitHub or GitLab project
            docs with a live preview before committing.
          </li>
          <li>
            <strong>Technical blog posts</strong> — Write posts offline-friendly
            and export HTML for your CMS or static site.
          </li>
          <li>
            <strong>Meeting notes & changelogs</strong> — Capture structured
            notes with headings and lists, then share as PDF.
          </li>
          <li>
            <strong>Teaching Markdown</strong> — Show students how syntax maps to
            rendered output in real time.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="markdown-privacy"
      >
        <h2 id="markdown-privacy" className="tool-content__heading">
          Privacy and Local Processing
        </h2>
        <p>
          Parsing, sanitization, syntax highlighting, and PDF/HTML generation run
          in your browser. Content is not uploaded to Focera for processing.
          Theme preference and an optional draft are stored in local storage on
          your device only.
        </p>
        <p>
          Still treat secrets carefully: clear the editor on shared machines, and
          avoid pasting production credentials into any web page you do not fully
          trust. Local processing reduces risk; good hygiene finishes the job.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-markdown"
      >
        <h2 id="related-markdown" className="tool-content__heading">
          Related Free Tools from Focera
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/json-formatter">JSON Formatter</Link> — Format, validate,
            and minify JSON with error highlighting.
          </li>
          <li>
            <Link href="/password-generator">Password Generator</Link> — Create
            strong random passwords locally in your browser.
          </li>
          <li>
            <Link href="/qr-generator">QR Code Generator</Link> — Generate
            scannable QR codes for links and text.
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
