import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Turn GIF into video",
    description:
      "Convert animated GIFs into MP4 or WebM video with size and quality controls — lighter files that play everywhere.",
  },
  {
    title: "Keep the animation timing",
    description:
      "Frame delays from your GIF are preserved so the video loops and paces like the original animation.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your GIFs never upload to Focera servers — private by design.",
  },
  {
    title: "Preview before sharing",
    description:
      "Watch the converted clip in-page, check frame count and file size, then download again anytime.",
  },
];

export default function GifToMp4Landing() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="gif-to-mp4-features"
        title="Everything you need in a free GIF to MP4 converter"
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
          Converting a GIF to video should be fast and private. Focera keeps the
          whole flow on one page — upload an animated GIF, choose size and
          quality, convert, and download without an account or desktop
          installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your GIF.</strong> Drag and drop an animated GIF up
            to 25 MB and 60 seconds, or click the zone to browse from your
            device.
          </li>
          <li>
            <strong>Pick size and quality.</strong> Smaller size and lower
            quality make lighter videos; higher quality keeps more detail.
          </li>
          <li>
            <strong>Convert and download.</strong> Processing runs in your
            browser. Preview the clip, then download the video anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#gif-to-mp4-tool">GIF to MP4 converter</a> anytime to
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
            <strong>Smaller shares</strong> — Video is often much smaller than
            a long GIF, so uploads and messages stay snappy.
          </li>
          <li>
            <strong>Social and ads</strong> — Many platforms prefer MP4 over
            GIF for feed posts, stories, and creative assets.
          </li>
          <li>
            <strong>Presentations</strong> — Drop a looping video into slides
            and sites that handle video better than animated GIFs.
          </li>
          <li>
            <strong>Editing workflows</strong> — Convert a meme or UI capture
            to video before trimming, compressing, or captioning.
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
          convert a GIF, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/video-to-gif">Video to GIF</Link> — Go the other
            direction and turn a short clip into an animated GIF.
          </li>
          <li>
            <Link href="/compress-video">Compress Video</Link> — Shrink the
            exported clip further for email or chat.
          </li>
          <li>
            <Link href="/gif-to-pdf">GIF to PDF</Link> — Put a still frame from
            a GIF onto a PDF page.
          </li>
          <li>
            <Link href="/trim-video">Trim Video</Link> — Cut the converted
            clip to the exact moment you need.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            still images with Extreme / Strong / Balanced / Light presets.
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
