import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Extract audio as MP3",
    description:
      "Convert MP4, WebM, and MOV videos into downloadable MP3 files — keep the soundtrack without the video track.",
  },
  {
    title: "Choose MP3 quality",
    description:
      "Pick 128, 192, or 320 kbps so you can balance file size and sound quality for podcasts, music, or voice notes.",
  },
  {
    title: "100% browser-based",
    description:
      "Conversion runs locally on your device. Your videos never upload to Focera servers — private by design.",
  },
  {
    title: "Preview before saving",
    description:
      "Listen to the MP3 in-page, compare sizes, then download again anytime.",
  },
];

export default function Mp4ToMp3Landing() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="mp4-to-mp3-features"
        title="Everything you need in a free MP4 to MP3 converter"
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
          Pulling audio out of a video should be quick and private. Focera keeps
          the whole flow on one page — upload, choose quality, convert, and
          download without an account or desktop installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your video.</strong> Drag and drop an MP4, WebM, or
            MOV file up to 100 MB and 10 minutes, or click the zone to browse
            from your device.
          </li>
          <li>
            <strong>Pick MP3 quality.</strong> 128 kbps saves space, 192 kbps
            is a solid default, and 320 kbps keeps the most detail.
          </li>
          <li>
            <strong>Convert and download.</strong> Processing runs in your
            browser. Preview the audio, then save the .mp3 file.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#mp4-to-mp3-tool">MP4 to MP3 converter</a> anytime to
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
            <strong>Music and podcasts</strong> — Save a song or talk track from
            a video for offline listening.
          </li>
          <li>
            <strong>Voice notes and lectures</strong> — Keep the audio from
            recorded meetings or classes without the large video file.
          </li>
          <li>
            <strong>Social clips</strong> — Turn a Reel, Short, or TikTok into
            an MP3 after downloading the video.
          </li>
          <li>
            <strong>Editing workflows</strong> — Export a soundtrack for use in
            DAWs, slideshows, or transcription tools.
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
          convert a video to MP3, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/extract-audio">Extract Audio</Link> — Pull the
            soundtrack from any video as MP3.
          </li>
          <li>
            <Link href="/audio-to-text">Audio to Text</Link> — Transcribe the
            MP3 into editable text, TXT, or SRT.
          </li>
          <li>
            <Link href="/compress-video">Compress Video</Link> — Shrink the
            original clip if you still need a lighter video file.
          </li>
          <li>
            <Link href="/tiktok-video-downloader">TikTok Video Downloader</Link>{" "}
            — Save a public TikTok, then convert it to MP3.
          </li>
          <li>
            <Link href="/instagram-video-downloader">
              Instagram Video Downloader
            </Link>{" "}
            — Download Reels or posts, then extract the audio locally.
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
