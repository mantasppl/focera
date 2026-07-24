import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "HTML minify",
    description:
      "Remove comments and collapse safe whitespace while preserving spacing inside pre, code, script, and style blocks.",
  },
  {
    title: "CSS minify",
    description:
      "Compress stylesheets with CSSO — shorter selectors, values, and rules without breaking modern CSS syntax.",
  },
  {
    title: "JavaScript minify",
    description:
      "Minify JS with Terser: compress, mangle, and strip comments for production-ready bundles and snippets.",
  },
  {
    title: "Copy & download",
    description:
      "Copy minified output to the clipboard or download .html, .css, or .js files — no account required.",
  },
  {
    title: "Size savings",
    description:
      "See original size, minified size, and percent saved so you know how much payload you trimmed.",
  },
  {
    title: "Private & local",
    description:
      "Everything runs in your browser. Source code is never uploaded to Focera for processing.",
  },
];

export default function HtmlCssJsMinifierLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="html-css-js-minifier-features"
        title="Everything you need in a free HTML, CSS & JS minifier"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="what-is-code-minifier"
      >
        <h2 id="what-is-code-minifier" className="tool-content__heading">
          What Is an HTML, CSS &amp; JS Minifier?
        </h2>
        <p>
          A code minifier reduces file size by removing comments, unnecessary
          whitespace, and — for JavaScript — renaming local identifiers where it
          is safe. Smaller HTML, CSS, and JS means faster page loads, lower
          bandwidth, and snappier first paint for visitors on slow networks.
        </p>
        <p>
          Developers reach for a{" "}
          <strong>free online HTML CSS JS minifier</strong> when shipping a
          landing page snippet, cleaning a stylesheet before deploy, or
          compressing a script that is not going through a full build pipeline.
          Focera keeps that workflow in one place: pick a language, paste, minify,
          then copy or download.
        </p>
        <p>
          Unlike formatters that expand code for readability, minifiers optimize
          for machines. Use pretty-print tools while editing; minify when size
          and delivery matter.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-Focera-minifier"
      >
        <h2 id="why-Focera-minifier" className="tool-content__heading">
          Why Use Focera&apos;s Free Online Minifier?
        </h2>
        <p>
          Many online compressors upload your source to a server. That is a poor
          fit for proprietary markup, client CSS, or scripts that contain tokens
          and business logic. This tool minifies locally in the browser so your
          code stays on your device.
        </p>
        <p>
          You get dedicated modes for HTML, CSS, and JavaScript, clear size
          stats after each run, clipboard copy, and file download with the right
          extension. No account, no daily quota, and no watermark on the output.
        </p>
        <p>
          Scroll to the{" "}
          <a href="#html-css-js-minifier-tool">minifier tool</a> at the top of
          this page to start, or browse the full{" "}
          <Link href="/tools">Focera catalog</Link> for related developer
          helpers.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-minify"
      >
        <h2 id="how-to-minify" className="tool-content__heading">
          How to Minify HTML, CSS, or JavaScript in Seconds
        </h2>
        <p>
          Use the workspace at the top of the page. Everything updates in place
          so you can iterate quickly:
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Choose a mode.</strong> Select HTML, CSS, or JS depending on
            what you are compressing.
          </li>
          <li>
            <strong>Paste your source.</strong> Drop a page fragment, stylesheet,
            or script into the input editor.
          </li>
          <li>
            <strong>Click Minify.</strong> Review the compact output and the
            original / minified / saved stats.
          </li>
          <li>
            <strong>Copy or download.</strong> Copy to the clipboard, or download
            a <code>.html</code>, <code>.css</code>, or <code>.js</code> file.
          </li>
        </ol>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="minify-tips"
      >
        <h2 id="minify-tips" className="tool-content__heading">
          Tips for Safe, Effective Minification
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Keep a readable source of truth.</strong> Minify for
            delivery; keep indented originals in version control.
          </li>
          <li>
            <strong>Test after JS minify.</strong> Terser is production-grade,
            but always smoke-test critical flows after mangling.
          </li>
          <li>
            <strong>Watch HTML whitespace.</strong> Significant spacing in{" "}
            <code>pre</code>, <code>code</code>, and similar tags is preserved;
            most other inter-tag whitespace is collapsed.
          </li>
          <li>
            <strong>Combine with gzip/brotli.</strong> Minification plus HTTP
            compression yields the best transfer sizes.
          </li>
          <li>
            <strong>Prefer build pipelines for apps.</strong> Use this tool for
            snippets and quick checks; use Vite, webpack, or similar for full
            projects.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="minify-use-cases"
      >
        <h2 id="minify-use-cases" className="tool-content__heading">
          Popular Use Cases
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Static landing pages</strong> — Shrink inline CSS and HTML
            before publishing a campaign page.
          </li>
          <li>
            <strong>Email &amp; embed snippets</strong> — Compress markup and
            styles destined for constrained environments.
          </li>
          <li>
            <strong>Quick script shipping</strong> — Minify a small JS helper
            without spinning up a bundler.
          </li>
          <li>
            <strong>Performance audits</strong> — Compare before/after byte
            counts when estimating payload savings.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="minify-privacy"
      >
        <h2 id="minify-privacy" className="tool-content__heading">
          Privacy and Local Processing
        </h2>
        <p>
          HTML minification uses a local parser. CSS compression uses CSSO and
          JavaScript minification uses Terser — both loaded and executed in your
          browser. Source is not uploaded to Focera for processing.
        </p>
        <p>
          Still treat secrets carefully: clear the editor on shared machines, and
          avoid pasting production credentials into any web page you do not fully
          trust. Local processing reduces risk; good hygiene finishes the job.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-minifier"
      >
        <h2 id="related-minifier" className="tool-content__heading">
          Related Free Tools from Focera
        </h2>
        <ul className="tool-content__list">
          <li>
            <Link href="/json-formatter">JSON Formatter</Link> — Format,
            validate, and minify JSON with error highlighting.
          </li>
          <li>
            <Link href="/markdown-editor">Markdown Editor</Link> — Write Markdown
            with a live preview and export to HTML or PDF.
          </li>
          <li>
            <Link href="/text-case-converter">Text Case Converter</Link> —
            Convert strings between common naming cases.
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
