import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Transcribe any public YouTube link",
    description:
      "Paste a watch, youtu.be, Shorts, or Live URL. Captions are used when available; otherwise speech is transcribed from audio.",
  },
  {
    title: "Plain text or timestamps",
    description:
      "Export a clean readable transcript or keep [mm:ss] timestamps for notes, quotes, and editing workflows.",
  },
  {
    title: "Copy, TXT, or SRT",
    description:
      "Copy the transcript instantly, download a .txt file, or grab an .srt subtitle file for editors and players.",
  },
  {
    title: "Free and fast",
    description:
      "No account, install, or credit card. Prefer captions for speed, with speech transcription as a fallback for caption-free clips.",
  },
];

export default function YoutubeToTextLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="youtube-to-text-features"
        title="Everything you need to transcribe a YouTube video"
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
          Turning a YouTube video into text should be quick. Focera first checks
          for captions YouTube already has — manual subtitles when available,
          otherwise auto-generated captions. If there is no CC track, it
          transcribes speech from the audio for videos up to about 10 minutes.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste the YouTube URL.</strong> Use a watch link, youtu.be
            short link, Shorts URL, Live URL, or the 11-character video ID.
          </li>
          <li>
            <strong>Choose plain text or timestamps.</strong> Plain text builds
            readable paragraphs; timestamps keep a line per cue or speech
            segment.
          </li>
          <li>
            <strong>Transcribe, edit, and export.</strong> Review the
            transcript, fix wording if needed, then copy, download TXT, or
            download SRT.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#youtube-to-text-tool">YouTube to text tool</a> anytime to
          convert another video.
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
            <strong>Research and notes</strong> — Capture quotes and summaries
            from talks, interviews, and lectures without scrubbing the timeline.
          </li>
          <li>
            <strong>Content repurposing</strong> — Turn video scripts into blog
            drafts, newsletters, show notes, or social posts.
          </li>
          <li>
            <strong>Accessibility drafts</strong> — Start from captions or
            speech transcription when building cleaner subtitles.
          </li>
          <li>
            <strong>Study and review</strong> — Keep a searchable transcript
            beside long tutorials or course videos.
          </li>
        </ul>
        <p>
          Speech transcription works best on clear audio under 10 minutes. Very
          long videos still work when YouTube already provides captions.
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
          Focera groups fast, privacy-friendly utilities in one hub. After you
          extract a transcript, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/youtube-summarize">YouTube Summarizer</Link> — Get a
            brief overview, detailed summary, or key points from the same link.
          </li>
          <li>
            <Link href="/video-to-text">Video to Text</Link> — Upload an MP4 or
            other local clip to transcribe speech without a YouTube link.
          </li>
          <li>
            <Link href="/audio-to-text">Audio to Text</Link> — Upload an MP3
            or other recording to transcribe speech you already have locally.
          </li>
          <li>
            <Link href="/video-autocaption">Video Autocaption</Link> — Upload
            your own clip to generate timed captions and burn them into video.
          </li>
          <li>
            <Link href="/text-case-converter">Text Case Converter</Link> —
            Change capitalization of the extracted transcript.
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
