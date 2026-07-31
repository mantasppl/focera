import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Turn video into GIF",
    description:
      "Convert MP4, WebM, and MOV clips into animated GIFs with size, frame rate, and color quality controls.",
  },
  {
    title: "Tune size and smoothness",
    description:
      "Pick Small, Medium, or Large output, 8–15 fps, and 64–256 colors so you can balance quality vs file size.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your videos never upload to Focera servers — private by design.",
  },
  {
    title: "Preview before sharing",
    description:
      "Watch the animated GIF in-page, check frame count and file size, then download again anytime.",
  },
];

export default function VideoToGifLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="video-to-gif-features"
        title="Everything you need in a free video to GIF converter"
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
          Making a GIF should be fast and private. Focera keeps the whole flow
          on one page — upload a short clip, choose size and frame rate,
          convert, and download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your video.</strong> Drag and drop an MP4, WebM, or
            MOV file up to 100 MB and 30 seconds, or click the zone to browse
            from your device.
          </li>
          <li>
            <strong>Pick size, fps, and colors.</strong> Smaller size and lower
            fps make lighter GIFs; higher color quality keeps more detail.
          </li>
          <li>
            <strong>Convert and download.</strong> Processing runs in your
            browser. Preview the animation, then download the .gif anytime.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#video-to-gif-tool">video to GIF converter</a> anytime to
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
            <strong>Chat and email</strong> — Share short reactions and demos
            as GIFs that play inline in messengers and docs.
          </li>
          <li>
            <strong>Social posts</strong> — Turn product clips, memes, and
            tutorials into looping GIFs for feeds and comments.
          </li>
          <li>
            <strong>Docs and slides</strong> — Drop a silent looping GIF into
            presentations, READMEs, and help articles.
          </li>
          <li>
            <strong>UI demos</strong> — Export feature walkthroughs from screen
            recordings without shipping a full video file.
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
          make a GIF, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/compress-video">Compress Video</Link> — Shrink a clip
            before converting if you need a lighter source file.
          </li>
          <li>
            <Link href="/extract-audio">Extract Audio</Link> — Pull the
            soundtrack as MP3 while you export a silent GIF.
          </li>
          <li>
            <Link href="/tiktok-video-downloader">TikTok Video Downloader</Link>{" "}
            — Save a public TikTok, then turn a short moment into a GIF.
          </li>
          <li>
            <Link href="/instagram-video-downloader">
              Instagram Video Downloader
            </Link>{" "}
            — Download Reels or posts, then convert a clip locally.
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
