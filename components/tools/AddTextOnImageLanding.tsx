import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Live text preview",
    description:
      "Type captions, labels, or stamps and see them update on your photo instantly — then download a PNG when it looks right.",
  },
  {
    title: "175+ fonts",
    description:
      "Search a huge library of system and Google fonts — sans, serif, mono, display, and handwriting styles for any look.",
  },
  {
    title: "Full color control",
    description:
      "Pick from a complete palette or choose any custom color with the color wheel and hex input.",
  },
  {
    title: "Readable on any photo",
    description:
      "Turn on a soft outline so light text stays clear over busy backgrounds, product shots, and social graphics.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your images never upload to Focera servers — private by design.",
  },
];

export default function AddTextOnImageLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="add-text-on-image-features"
        title="Everything you need in a free add text on image tool"
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
          Adding text to a photo should be fast and private. Focera keeps the
          whole flow on one page — upload, type your message, tune placement,
          and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your image.</strong> Drag and drop a JPG, PNG, or
            WebP file up to 10 MB, or click the zone to browse from your device.
          </li>
          <li>
            <strong>Enter text and options.</strong> Type your message, then
            drag, resize, and rotate it on the preview. Search 175+ fonts, pick any
            color from the palette, and tune opacity and outline.
          </li>
          <li>
            <strong>Download the PNG.</strong> Preview updates live. When you
            are happy, export a full-resolution PNG with the text baked in.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#add-text-on-image-tool">add text on image tool</a> anytime
          to process another file.
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
            <strong>Social captions</strong> — Add titles, quotes, or callouts
            before posting to Instagram, LinkedIn, or Stories.
          </li>
          <li>
            <strong>Product labels</strong> — Stamp prices, SKUs, or “NEW” on
            catalog photos without opening a design app.
          </li>
          <li>
            <strong>Watermark-style marks</strong> — Place a light name or URL
            with lower opacity and optional diagonal rotation.
          </li>
          <li>
            <strong>Memes and announcements</strong> — Overlay short headlines
            on photos for events, sales, or team updates.
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
          add text to an image, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/crop-image">Crop Image</Link> — Reframe the photo
            before or after placing text.
          </li>
          <li>
            <Link href="/resize-image">Resize Image</Link> — Match exact pixel
            dimensions for social or web.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            file size after exporting a PNG with text.
          </li>
          <li>
            <Link href="/add-text-to-pdf">Add Text to PDF</Link> — Stamp text
            on documents instead of photos.
          </li>
          <li>
            <Link href="/remove-watermark">Remove Watermark</Link> — Clean up
            overlays you no longer need.
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
