import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Paste a link, download the MP4",
    description:
      "Drop in a public TikTok video URL or short link and save the file without installing an app.",
  },
  {
    title: "Full URLs and short links",
    description:
      "Works with www.tiktok.com/@user/video links plus vm.tiktok.com and vt.tiktok.com share URLs.",
  },
  {
    title: "Preview before you save",
    description:
      "See the creator, caption, and cover frame in-page, then download the MP4 when you are ready.",
  },
  {
    title: "Free and no signup",
    description:
      "No account, browser extension, or credit card. Use it whenever you need a clean TikTok video file.",
  },
];

export default function TikTokVideoDownloaderLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="tiktok-video-features"
        title="Everything you need in a free TikTok video downloader"
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
          Saving a TikTok video should take seconds. Focera reads the public
          post you paste, finds the MP4 TikTok already hosts, then lets you
          preview and download it on one page.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste the TikTok URL.</strong> Use a full video link or a
            vm/vt short share link from a public account.
          </li>
          <li>
            <strong>Fetch the video.</strong> Focera resolves the media and
            shows a preview with username and caption when available.
          </li>
          <li>
            <strong>Download the MP4.</strong> Save the file to your device —
            no watermark overlay from Focera, and nothing to install.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#tiktok-video-tool">TikTok video downloader</a> anytime to
          grab another clip.
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
            TikToks you published before editing or archiving.
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
            <strong>Quick offline viewing</strong> — Watch a public TikTok later
            without opening the app.
          </li>
        </ul>
        <p>
          Private, region-blocked, and deleted videos cannot be downloaded. Only
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
          After you download a TikTok video, these Focera tools often fit the
          same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/instagram-video-downloader">
              Instagram Video Downloader
            </Link>{" "}
            — Save public Instagram Reels and post videos the same way.
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
            <Link href="/youtube-to-text">YouTube to Text</Link> — Extract
            transcripts from YouTube videos when you need text instead of a file.
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
