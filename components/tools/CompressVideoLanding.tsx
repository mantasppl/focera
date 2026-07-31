import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Shrink video file size",
    description:
      "Compress MP4, WebM, and MOV clips for email, uploads, and social posts with Extreme, Strong, Balanced, or Light presets.",
  },
  {
    title: "Clear size comparison",
    description:
      "See original vs compressed size and savings percent right after processing so you can pick the right level.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your videos never upload to Focera servers — private by design.",
  },
  {
    title: "Preview before sharing",
    description:
      "Watch the compressed result in-page, then download a lighter WebM (or MP4 when your browser supports it).",
  },
];

export default function CompressVideoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="compress-video-features"
        title="Everything you need in a free video compressor"
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
          Reducing video size should be fast and private. Focera keeps the whole
          flow on one page — upload, choose a compression level, compress, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your video.</strong> Drag and drop an MP4, WebM, or
            MOV file up to 100 MB and 10 minutes, or click the zone to browse
            from your device.
          </li>
          <li>
            <strong>Pick a compression level.</strong> Extreme and Strong save
            the most space by lowering resolution and bitrate; Balanced is a
            solid default; Light keeps more detail.
          </li>
          <li>
            <strong>Compress and download.</strong> Processing runs in your
            browser. Compare sizes, preview the result, then download again
            anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#compress-video-tool">video compressor</a> anytime to
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
            <strong>Email and messaging</strong> — Shrink clips so attachments
            send faster and stay under provider caps.
          </li>
          <li>
            <strong>Form and CMS uploads</strong> — Meet file-size limits for
            websites, support tickets, and course portals.
          </li>
          <li>
            <strong>Social and ads</strong> — Keep videos watchable while
            reducing weight for faster uploads and page loads.
          </li>
          <li>
            <strong>Client delivery</strong> — Export lighter proofs and
            web-ready cuts after editing.
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
          compress a video, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/video-autocaption">Video Autocaption</Link> — Add
            timed captions and burn them into a clip after you shrink it.
          </li>
          <li>
            <Link href="/tiktok-video-downloader">TikTok Video Downloader</Link>{" "}
            — Save a public TikTok, then compress it for sharing elsewhere.
          </li>
          <li>
            <Link href="/instagram-video-downloader">
              Instagram Video Downloader
            </Link>{" "}
            — Download Reels or posts, then reduce file size locally.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            photos with the same Extreme / Strong / Balanced / Light presets.
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
