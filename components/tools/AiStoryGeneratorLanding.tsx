import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const features = [
  {
    title: "Idea to story in seconds",
    description:
      "Describe a premise, character, or twist in plain language and get a complete short story you can copy or download.",
  },
  {
    title: "Genre, length, and tone",
    description:
      "Steer the writing toward adventure, fantasy, mystery, sci-fi, romance, and more — then pick length and mood.",
  },
  {
    title: "Free, no account",
    description:
      "Generate stories without signup, subscriptions, or credit packs. Open the page and start writing prompts.",
  },
  {
    title: "Fresh variations",
    description:
      "Like the premise but want another take? Hit New variation to regenerate while keeping your idea and settings.",
  },
];

export default function AiStoryGeneratorLanding() {
  return (
    <>
      <FeatureGrid
        id="ai-story-features"
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
            A free AI story generator should feel immediate: type an idea, pick
            a genre, and read the result. Focera keeps the workflow on one page
            so you can iterate on premises without juggling writing apps or API
            keys.
          </p>
          <ol className="tool-content__steps">
            <li>
              <strong>Write a clear story idea.</strong> Include a character,
              setting, or conflict. Example chips below the prompt field show
              the level of detail that works well.
            </li>
            <li>
              <strong>Choose genre, length, and tone.</strong> Flash pieces are
              great for social drafts; short and medium lengths suit blogs,
              classroom prompts, and creative warm-ups.
            </li>
            <li>
              <strong>Generate, copy, or download.</strong> Preview the story,
              try a new variation if you want another take, then copy the text
              or save a TXT file.
            </li>
          </ol>
          <p>
            Jump back to the{" "}
            <a href="#ai-story-generator-tool">AI story generator</a> anytime to
            craft another premise.
          </p>
        </section>

        <section
          className="tool-content__section"
          aria-labelledby="use-cases"
        >
          <h2 id="use-cases" className="tool-content__heading">
            Popular Use Cases
          </h2>
          <p>
            Writers and teams use AI story tools for brainstorming, classroom
            exercises, creative warm-ups, and first-draft sparks — then revise
            the output into their own voice.
          </p>
          <ul>
            <li>Creative writing prompts and classroom story starters</li>
            <li>Blog fiction drafts and newsletter interludes</li>
            <li>Game, film, and campaign mood pieces for early reviews</li>
            <li>Social short fiction and writing-challenge entries</li>
          </ul>
          <p>
            After you draft, pair the story with Focera&apos;s{" "}
            <Link href="/ai-image-generator">AI image generator</Link> when you
            want a matching cover or scene visual.
          </p>
        </section>

        <section
          className="tool-content__section"
          aria-labelledby="prompt-tips"
        >
          <h2 id="prompt-tips" className="tool-content__heading">
            Prompt Tips for Better Stories
          </h2>
          <p>
            Strong premises are concrete. Lead with who the story is about,
            where they are, and what goes wrong — or what they want. A focused
            sentence usually beats a long keyword list.
          </p>
          <ul>
            <li>
              Lead with character and conflict: “a courier who must deliver a
              letter that rewrites itself”.
            </li>
            <li>
              Add place and stakes: “in a flooded coastal city before dawn” or
              “before the last train leaves”.
            </li>
            <li>
              Use genre and tone chips instead of packing “epic dark fantasy” into
              every prompt when you want a consistent feel.
            </li>
            <li>
              If a result is close, keep the prompt and use New variation rather
              than rewriting from scratch.
            </li>
          </ul>
        </section>

        <section
          className="tool-content__section"
          aria-labelledby="privacy-note"
        >
          <h2 id="privacy-note" className="tool-content__heading">
            Privacy and Generation
          </h2>
          <p>
            Unlike browser-only converters on Focera, AI story generation needs a
            model hosted by a generation provider. Your prompt is sent to create
            the story and is not stored by Focera as a personal library. Avoid
            putting secrets, private personal data, or confidential client
            details into prompts.
          </p>
        </section>
      </article>
    </>
  );
}
