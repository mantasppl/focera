import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Shrink image file size",
    description:
      "Compress JPG, PNG, and WebP photos for email, web uploads, and social posts with Extreme, Strong, Balanced, or Light presets.",
  },
  {
    title: "Clear size comparison",
    description:
      "See original vs compressed size and savings percent right after processing so you can pick the right level.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
  {
    title: "Before & after preview",
    description:
      "Compare quality with a slider, then download JPEG or WebP ready for the web, forms, and messaging apps.",
  },
];

export default function ImageCompressorLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="image-compressor-features"
        title="Everything you need in a free image compressor"
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
          Reducing image size should be fast and private. Focera keeps the whole
          flow on one page — upload, choose a compression level, compress, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Pick a level and format.</strong> Extreme and Strong save
            the most space; Balanced is a solid default; Light keeps more
            detail. Choose Auto, JPEG, or WebP output.
          </li>
          <li>
            <strong>Compress and download.</strong> Processing runs in your
            browser. Compare sizes and quality, then download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#image-compressor-tool">image compressor</a> anytime to
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
            <strong>Web and CMS uploads</strong> — Meet file-size limits for
            WordPress, Shopify, and form uploads without opening desktop apps.
          </li>
          <li>
            <strong>Email and messaging</strong> — Shrink photos so attachments
            send faster and stay under provider caps.
          </li>
          <li>
            <strong>Social and ads</strong> — Keep visuals sharp while reducing
            weight for faster page and feed loads.
          </li>
          <li>
            <strong>Portfolio and client delivery</strong> — Export lighter
            proofs and web-ready assets after editing.
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
          compress an image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/upscale-image">Upscale Image</Link> — Increase
            resolution when you need a larger export before compressing again.
          </li>
          <li>
            <Link href="/background-remover">AI Background Remover</Link> —
            Cut out subjects, then compress the transparent or flat result.
          </li>
          <li>
            <Link href="/change-background">Change Background</Link> —
            Swap in a solid color, custom photo, or blur, then compress the
            export.
          </li>
          <li>
            <Link href="/remove-watermark">Remove Watermark</Link> — Clean up
            overlays on photos you own before optimizing size.
          </li>
          <li>
            <Link href="/image-converter">Image Converter</Link> — Convert
            between PNG, JPG, and WebP when a destination needs a specific
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
