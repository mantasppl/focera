import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Sharpen a blurry image",
    description:
      "Restore edge contrast on soft photos so subjects, type, and details read more clearly at the original size.",
  },
  {
    title: "Three strength levels",
    description:
      "Pick Light for gentle haze, Medium for everyday blur, or Strong when edges need a heavier recovery pass.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and sharpened result with a slider, then download a PNG ready for sharing or editing.",
  },
];

export default function SharpenBlurryImageSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="sharpen-blurry-image-features"
        title="Everything you need to sharpen a blurry image"
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
          Sharpening a blurry image should stay fast and private. Focera keeps
          upload, strength, compare, and download on one page with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. Sharpening starts automatically.
          </li>
          <li>
            <strong>Pick a sharpen strength.</strong> Medium is the default.
            Switch to Light or Strong anytime — the preview updates on its own.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download PNG when you are ready.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#sharpen-blurry-image-tool">sharpen blurry image tool</a>{" "}
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
            <strong>Soft portraits</strong> — Lift facial detail when the
            lens slightly missed focus.
          </li>
          <li>
            <strong>Product close-ups</strong> — Make labels and textures
            look tighter on listing photos.
          </li>
          <li>
            <strong>Print-ready exports</strong> — Give a slightly mushy
            file more edge before you send it to print.
          </li>
          <li>
            <strong>Resized graphics</strong> — Recover line work that
            softened after a downscale.
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
          sharpen a blurry image, these tools often fit the same workflow:
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
