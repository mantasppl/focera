import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Dedicated unblur workspace",
    description:
      "A focused image unblur tool: drop a file, recover edges, and export a PNG at the same resolution you started with.",
  },
  {
    title: "Automatic best result",
    description:
      "Drop a file and the image unblur tool applies the strongest on-device restore it can — no strength chips.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare the original and unblurred result with a slider, then download as JPG, PNG, or WebP.",
  },
];

export default function ImageUnblurToolSeoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="image-unblur-tool-features"
        title="Everything you need in a free image unblur tool"
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
          An image unblur tool should stay simple. Focera keeps upload,
          compare, and download on one page with no account.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB. Unblurring starts automatically.
          </li>
          <li>
            <strong>Let the unblur pass finish.</strong> The first visit downloads a 5 MB model. Later files unblur automatically at full strength.
          </li>
          <li>
            <strong>Compare, then download.</strong> Use the before/after slider,
            then click Download and choose JPG, PNG, or WebP.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#image-unblur-tool-tool">image unblur tool</a> anytime to
          process another file.
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
            <strong>Everyday phone shots</strong> — Clean up photos that look
            a little soft after autofocus or low light.
          </li>
          <li>
            <strong>Scans and captures</strong> — Tighten text and line work
            that turned mushy after resize or compression.
          </li>
          <li>
            <strong>Storefront images</strong> — Give listing photos a crisper
            edge before they go live.
          </li>
          <li>
            <strong>Re-exported JPEGs</strong> — Refresh files that lost
            detail after several saves.
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
          finish with the image unblur tool, these often fit the same workflow:
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
