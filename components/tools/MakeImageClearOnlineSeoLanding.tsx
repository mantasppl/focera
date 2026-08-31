import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Make a soft image clearer",
    description:
      "Restore edge detail on blurry or hazy photos so the picture reads more clearly at the same pixel size.",
  },
  {
    title: "Automatic best result",
    description:
      "Making an image clear always uses the full-strength AI restore — upload and wait for the best local pass.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and clearer result with a slider, then download as JPG, PNG, or WebP.",
  },
];

export default function MakeImageClearOnlineSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="make-image-clear-online-features"
        title="Everything you need to make an image clear online"
        features={FEATURES}
      />

      <section
        className="tool-content__section"
        aria-labelledby="how-it-works"
      >
        <h2 id="how-it-works" className="tool-content__heading">
          How It Works
        </h2>
        <p>
          Making an image clear online should stay fast and private. Focera
          keeps upload, compare, and download on one page with no
          account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. Clarifying starts automatically.
          </li>
          <li>
            <strong>Let AI clear the photo.</strong> The first visit downloads a 5 MB model. After that, clarity recovery runs automatically at full strength.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download and choose JPG, PNG, or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#make-image-clear-online-tool">make image clear tool</a>{" "}
          anytime to process another file.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="use-cases"
      >
        <h2 id="use-cases" className="tool-content__heading">
          Popular Use Cases
        </h2>
        <ul className="tool-content__list">
          <li>
            <strong>Hazy phone photos</strong> — Clear up shots that look
            washed or slightly out of focus.
          </li>
          <li>
            <strong>Document photos</strong> — Make text and stamps easier
            to read after a quick camera snap.
          </li>
          <li>
            <strong>Marketplace listings</strong> — Present a clearer
            picture of the item you are selling.
          </li>
          <li>
            <strong>Shared albums</strong> — Improve pictures that arrived
            a little soft from a group chat.
          </li>
        </ul>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-tools"
      >
        <h2 id="related-tools" className="tool-content__heading">
          Related Free Tools
        </h2>
        <p>
          Focera groups fast, privacy-friendly utilities in one hub. After you
          make an image clear online, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution when you need a larger, sharper export.
          </li>
          <li>
            <Link href="/resize-image">Resize Image Dimensions</Link> — Set
            exact width and height in pixels for a specific size.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects after sharpening.
          </li>
          <li>
            <Link href="/remove-objects">Remove Objects</Link> — Brush out
            distractions from photos you own.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting a PNG.
          </li>
          <li>
            <Link href="/image-converter">Image Converter</Link> — Convert
            between PNG, JPG, and WebP when your destination needs a specific
            format.
          </li>
          <li>
            <Link href="/tools">All tools</Link> — Browse every free utility
            in the Focera catalog.
          </li>
        </ul>
      </section>
    </article>
  );
}
