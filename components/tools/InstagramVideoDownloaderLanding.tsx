import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Paste a link, download the MP4",
    description:
      "Drop in a public Instagram post, Reel, or TV URL and save the video file without installing an app.",
  },
  {
    title: "Reels, posts, and carousels",
    description:
      "Single Reels download in one click. Multi-video carousels let you pick which clip to save.",
  },
  {
    title: "Preview before you save",
    description:
      "Watch a quick in-page preview, check the caption, then download the MP4 when you are ready.",
  },
  {
    title: "Free and no signup",
    description:
      "No account, browser extension, or credit card. Use it whenever you need a clean Instagram video file.",
  },
];

export default function InstagramVideoDownloaderLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="instagram-video-features"
        title="Everything you need in a free Instagram video downloader"
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
          Saving an Instagram video should take seconds. Focera reads the public
          post you paste, finds the highest-quality MP4 Instagram already hosts,
          then lets you preview and download it on one page.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste the Instagram URL.</strong> Use a post, Reel, TV link,
            or shortcode from a public account.
          </li>
          <li>
            <strong>Fetch the video.</strong> Focera resolves the media and
            shows a preview with username and caption when available.
          </li>
          <li>
            <strong>Download the MP4.</strong> Save the file to your device, or
            pick a clip first if the post is a multi-video carousel.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#instagram-video-tool">Instagram video downloader</a> anytime
          to grab another clip.
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
            <strong>Save your own posts</strong> — Keep an offline copy of Reels
            you published before editing or archiving.
          </li>
          <li>
            <strong>Reference and research</strong> — Download public clips for
            notes, mood boards, or fair-use commentary workflows.
          </li>
          <li>
            <strong>Repurpose with captions</strong> — Pull a video here, then
            add burned-in captions with Focera’s autocaption tool.
          </li>
          <li>
            <strong>Quick offline viewing</strong> — Watch a public Reel later
            without opening the Instagram app.
          </li>
        </ul>
        <p>
          Private, age-restricted, and deleted posts cannot be downloaded. Only
          download content you have the right to use.
        </p>
      </section>

      <section
        className="tool-content__section"
        aria-labelledby="related-tools"
      >
        <h2 id="related-tools" className="tool-content__heading">
          Related Free Tools
        </h2>
        <p>
          After you download an Instagram video, these Focera tools often fit
          the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/compress-video">Compress Video</Link> — Shrink the
            downloaded MP4 before email, upload, or sharing.
          </li>
          <li>
            <Link href="/video-autocaption">Video Autocaption</Link> — Upload
            the MP4 to generate timed captions and burn them into the video.
          </li>
          <li>
            <Link href="/youtube-to-text">YouTube to Text</Link> — Extract
            transcripts from YouTube videos when you need text instead of a file.
          </li>
          <li>
            <Link href="/image-compressor">Image Compressor</Link> — Shrink
            cover frames or stills exported from your downloads.
          </li>
          <li>
            <Link href="/tools">All tools</Link> — Browse every free utility in
            the Focera catalog.
          </li>
        </ul>
      </section>
    </article>
  );
}
