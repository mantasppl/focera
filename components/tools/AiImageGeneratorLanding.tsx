import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const features = [
  {
    title: "Text to image in seconds",
    description:
      "Describe a scene, product, or mood in plain language and get a downloadable AI image without installing software.",
  },
  {
    title: "Styles and sizes built in",
    description:
      "Switch between square, landscape, and portrait sizes, or nudge the look toward photo, illustration, anime, or 3D.",
  },
  {
    title: "Free, no account",
    description:
      "Generate and download without signup, subscriptions, or credit packs. Open the page and start prompting.",
  },
  {
    title: "Variations on demand",
    description:
      "Like the idea but want a new take? Hit New variation to regenerate with a fresh seed while keeping your prompt.",
  },
];

export default function AiImageGeneratorLanding() {
  return (
    <>
      <FeatureGrid
        id="ai-image-features"
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
            A free AI image generator should feel immediate: type what you want,
            pick a size, and download the result. Focera keeps the workflow on
            one page so you can iterate on prompts without jumping between apps
            or managing API keys.
          </p>
          <ol className="tool-content__steps">
            <li>
              <strong>Write a clear prompt.</strong> Include the subject,
              setting, lighting, and mood. Example chips below the prompt field
              show the level of detail that works well.
            </li>
            <li>
              <strong>Choose size and style.</strong> Square fits avatars and
              thumbnails; landscape suits banners; portrait works for stories
              and phone mockups. Styles gently steer the model without rewriting
              your idea.
            </li>
            <li>
              <strong>Generate and download.</strong> Preview the result, try a
              new variation if you want another take, then download the image
              for your project.
            </li>
          </ol>
          <p>
            Jump back to the{" "}
            <a href="#ai-image-generator-tool">AI image generator</a> anytime to
            craft another prompt.
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
            Teams and creators use text-to-image tools for early visual
            exploration — mood boards, social drafts, concept art, and placeholder
            product shots — before investing in a photoshoot or designer round.
          </p>
          <ul>
            <li>
              Marketing mockups and ad creative directions before final design
            </li>
            <li>
              Blog and newsletter hero concepts when stock photos feel generic
            </li>
            <li>
              Game, film, and product mood boards for stakeholder reviews
            </li>
            <li>
              Social post visuals and thumbnail experiments in minutes
            </li>
          </ul>
          <p>
            After you download, pair generations with Focera&apos;s{" "}
            <Link href="/background-remover">AI background remover</Link> when
            you need a transparent cutout for a listing or presentation.
          </p>
        </section>

        <section
          className="tool-content__section"
          aria-labelledby="prompt-tips"
        >
          <h2 id="prompt-tips" className="tool-content__heading">
            Prompt Tips for Better Results
          </h2>
          <p>
            Strong prompts are concrete. Mention the subject first, then
            environment, then lighting and style cues. Avoid stuffing every
            keyword you can think of — a focused sentence usually beats a long
            comma list.
          </p>
          <ul>
            <li>
              Lead with the main subject: “a ceramic mug”, “a coastal cabin”,
              “a runner on a rainy street”.
            </li>
            <li>
              Add place and light: “on marble, soft window light” or “foggy
              forest at sunrise”.
            </li>
            <li>
              Use the style chips instead of repeating “photorealistic” in every
              prompt when you want a consistent look.
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
            Unlike browser-only converters on Focera, AI image generation needs a
            model hosted by a generation provider. Your prompt is sent to create
            the image and is not stored by Focera as a personal gallery. Avoid
            putting secrets, private personal data, or confidential client
            details into prompts.
          </p>
        </section>
      </article>
    </>
  );
}
