import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Paste a link, download the MP4",
    description:
      "Drop in a public Twitter/X post URL and save the video without installing an app or signing in.",
  },
  {
    title: "x.com and twitter.com links",
    description:
      "Works with modern x.com status URLs and classic twitter.com / mobile.twitter.com post links.",
  },
  {
    title: "Preview before you save",
    description:
      "See the username, caption, and cover frame in-page, then download the highest-quality MP4 when ready.",
  },
  {
    title: "Free and no signup",
    description:
      "No account, browser extension, or credit card. Use it whenever you need a clean Twitter/X video file.",
  },
];

export default function TwitterVideoDownloaderLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="twitter-video-features"
        title="Everything you need in a free Twitter/X video downloader"
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
          Saving a Twitter/X video should take seconds. Focera reads the public
          post you paste, finds the MP4 X already hosts, then lets you preview
          and download it on one page.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste the post URL.</strong> Use an x.com or twitter.com
            status link from a public account.
          </li>
          <li>
            <strong>Fetch the video.</strong> Focera resolves the media and
            shows a preview with username and caption when available.
          </li>
          <li>
            <strong>Download the MP4.</strong> Save the highest-quality file to
            your device — no watermark overlay from Focera, and nothing to
            install.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#twitter-video-tool">Twitter/X video downloader</a> anytime
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
            <strong>Save your own posts</strong> — Keep an offline copy of
            videos you published before editing or archiving.
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
            <strong>Quick offline viewing</strong> — Watch a public clip later
            without opening the X app.
          </li>
        </ul>
        <p>
          Private, suspended, and deleted posts cannot be downloaded. Only
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
          After you download a Twitter/X video, these Focera tools often fit the
          same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/tiktok-video-downloader">TikTok Video Downloader</Link>{" "}
            — Save public TikTok videos the same way.
          </li>
          <li>
            <Link href="/instagram-video-downloader">
              Instagram Video Downloader
            </Link>{" "}
            — Save public Instagram Reels and post videos.
          </li>
          <li>
            <Link href="/compress-video">Compress Video</Link> — Shrink the
            downloaded MP4 before email, upload, or sharing.
          </li>
          <li>
            <Link href="/video-autocaption">Video Autocaption</Link> — Upload
            the MP4 to generate timed captions and burn them into the video.
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
