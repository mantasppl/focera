import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Live word & character counts",
    description:
      "Words, characters with and without spaces, sentences, paragraphs, and lines update as you type or paste — no submit button.",
  },
  {
    title: "Reading & speaking time",
    description:
      "Estimate how long the text takes to read (~200 wpm) or speak aloud (~130 wpm) for posts, scripts, and presentations.",
  },
  {
    title: "One-click copy & clear",
    description:
      "Copy your draft to the clipboard or clear the editor when you are done — useful for essays, bios, and SEO meta limits.",
  },
  {
    title: "Works for any draft",
    description:
      "Count headlines, blog posts, captions, essays, and scripts. Spellcheck stays on so you can edit while you measure.",
  },
  {
    title: "Private by design",
    description:
      "Every count runs locally in your browser. Your text is never uploaded to Focera.",
  },
  {
    title: "Free, unlimited use",
    description:
      "No account, watermark, or daily quota. Paste as much text as you need and keep working.",
  },
];

export default function WordCounterLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="word-counter-features"
        title="Everything you need in a free online word counter"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="what-is-word-counter"
      >
        <h2 id="what-is-word-counter" className="tool-content__heading">
          What Is a Word Counter?
        </h2>
        <p>
          A <strong>word counter</strong> tallies how many words, characters,
          sentences, and paragraphs are in a piece of text. Writers, students,
          and marketers use it to hit assignment limits, social-bio caps, SEO
          title lengths, and presentation timing without guessing.
        </p>
        <p>
          Beyond a raw word total, a good counter also shows characters with and
          without spaces, line breaks, and estimated reading or speaking time so
          you can shape drafts for blogs, scripts, emails, and captions.
        </p>
        <p>
          Focera&apos;s free word counter runs entirely in your browser. Paste
          or type your text, watch the stats update live, copy when ready, and
          clear when you are done — with nothing sent to a server.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="why-Focera-word-counter"
      >
        <h2 id="why-Focera-word-counter" className="tool-content__heading">
          Why Use Focera&apos;s Free Online Word Counter?
        </h2>
        <p>
          Many word-count pages bury basics behind ads, force a reload for every
          paste, or send your draft to a remote API. This tool keeps the
          essentials on one screen: live totals, reading and speaking estimates,
          and copy — with no account and no daily quota.
        </p>
        <p>
          Jump to the{" "}
          <a href="#word-counter-tool">word counter tool</a> at the top of this
          page, or browse the{" "}
          <Link href="/tools">full Focera catalog</Link> for related helpers
          like the{" "}
          <Link href="/text-case-converter">text case converter</Link> and{" "}
          <Link href="/lorem-ipsum-generator">Lorem Ipsum generator</Link>.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="how-to-count-words"
      >
        <h2 id="how-to-count-words" className="tool-content__heading">
          How to Count Words in Seconds
        </h2>
        <p>Use the workspace at the top of the page. Stats update in place:</p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste or type your text</strong> in the editor.
          </li>
          <li>
            <strong>Review live counts</strong> — words, characters, sentences,
            paragraphs, lines, plus reading and speaking time.
          </li>
          <li>
            <strong>Copy</strong> the text when you need it elsewhere, or{" "}
            <strong>Clear</strong> to start a new draft.
          </li>
        </ol>
        <p>
          Everything stays on your device. Leave the page when you are done —
          nothing is stored on Focera.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="word-count-tips"
      >
        <h2 id="word-count-tips" className="tool-content__heading">
          Tips for Accurate Counts
        </h2>
        <p>
          Words are split on whitespace, so hyphenated compounds and
          contractions usually count as one word. Blank lines create new
          paragraphs. Reading time assumes about 200 words per minute; speaking
          time assumes about 130 — adjust your delivery if you speak faster or
          slower.
        </p>
        <p>
          For character limits (Twitter/X bios, meta descriptions, SMS), use
          Characters or Characters (no spaces) depending on whether spaces count
          toward the cap.
        </p>
      </section>
    </article>
  );
}
