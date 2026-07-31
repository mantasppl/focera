import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Cut to the exact moment",
    description:
      "Set start and end times on MP4, WebM, and MOV clips with a timeline, number inputs, or the playhead.",
  },
  {
    title: "Preview before you download",
    description:
      "Play just the selected range, then export a shorter clip you can share or upload anywhere.",
  },
  {
    title: "100% browser-based",
    description:
      "Everything runs locally on your device. Your videos never upload to Focera servers — private by design.",
  },
  {
    title: "No install required",
    description:
      "Trim and download in your browser — no desktop editor, account, or watermark.",
  },
];

export default function TrimVideoLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="trim-video-features"
        title="Everything you need in a free video trimmer"
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
          Cutting a clip should be fast and private. Focera keeps the whole flow
          on one page — upload, mark start and end, trim, and download without
          an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your video.</strong> Drag and drop an MP4, WebM, or
            MOV file up to 100 MB and 10 minutes, or click the zone to browse
            from your device.
          </li>
          <li>
            <strong>Choose start and end.</strong> Drag the timeline handles,
            type times in seconds, or scrub the preview and tap Set start /
            Set end here.
          </li>
          <li>
            <strong>Trim and download.</strong> Preview the selection, then
            export. Processing runs in your browser — download again anytime.
          </li>
        </ol>
        <p>
          Jump back to the <a href="#trim-video-tool">video trimmer</a> anytime
          to cut another file.
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
            <strong>Social clips</strong> — Cut intros and outros before posting
            to TikTok, Reels, or Shorts.
          </li>
          <li>
            <strong>Highlights</strong> — Pull a short moment from a longer
            recording for messages or slides.
          </li>
          <li>
            <strong>Upload limits</strong> — Shorten a file so it fits form,
            email, or CMS caps.
          </li>
          <li>
            <strong>Quick edits</strong> — Remove dead air or false starts
            without opening a full editor.
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
          trim a video, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/compress-video">Compress Video</Link> — Shrink the cut
            clip for faster uploads.
          </li>
          <li>
            <Link href="/video-to-gif">Video to GIF</Link> — Turn a short trim
            into an animated GIF.
          </li>
          <li>
            <Link href="/extract-audio">Extract Audio</Link> — Pull the
            soundtrack as an MP3 from the trimmed segment or original.
          </li>
          <li>
            <Link href="/video-autocaption">Video Autocaption</Link> — Add timed
            captions and burn them into a clip.
          </li>
          <li>
            <Link href="/tiktok-video-downloader">TikTok Video Downloader</Link>{" "}
            — Save a public TikTok, then trim it for sharing elsewhere.
          </li>
          <li>
            <Link href="/instagram-video-downloader">
              Instagram Video Downloader
            </Link>{" "}
            — Download Reels or posts, then cut to the part you need.
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
