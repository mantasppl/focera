import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Deblur in the browser",
    description:
      "Run an online deblur pass that restores edge detail on soft photos and exports a PNG at the original resolution.",
  },
  {
    title: "Automatic best result",
    description:
      "Deblur always applies a full-strength AI restore in your browser — no Light, Medium, or Strong setting.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and deblurred result with a slider, then download as JPG, PNG, or WebP.",
  },
];

export default function DeblurImageOnlineSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="deblur-image-online-features"
        title="Everything you need to deblur an image online"
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
          Deblurring an image online should stay fast and private. Focera
          keeps upload, compare, and download on one page with no
          account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. Deblur starts automatically.
          </li>
          <li>
            <strong>Let AI deblur the image.</strong> The first visit downloads a 5 MB model. After that, deblur runs automatically at full strength.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download and choose JPG, PNG, or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#deblur-image-online-tool">deblur image online tool</a>{" "}
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
            <strong>Soft camera shots</strong> — Deblur photos when
            autofocus landed a little off the subject.
          </li>
          <li>
            <strong>Compressed downloads</strong> — Restore edges after a
            site or app saved a mushy copy.
          </li>
          <li>
            <strong>Client drafts</strong> — Give a slightly blurry
            deliverable a clearer pass before review.
          </li>
          <li>
            <strong>Archive JPEGs</strong> — Recover detail that faded
            after repeated saves.
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
          deblur an image online, these tools often fit the same workflow:
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
            <Link href="/png-to-jpg">PNG to JPG Converter</Link> — Convert
            PNG images to JPEG when your destination needs a smaller photo
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
