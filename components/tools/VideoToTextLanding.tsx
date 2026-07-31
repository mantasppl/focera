import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Transcribe video speech to text",
    description:
      "Upload MP4, WebM, or MOV clips and turn spoken words into editable text you can copy or download.",
  },
  {
    title: "Audio stays light",
    description:
      "Only a compressed audio extract leaves your device for transcription — the full video file never needs to be uploaded.",
  },
  {
    title: "Plain text, timestamps, or SRT",
    description:
      "Export a clean readable transcript, keep [mm:ss] markers, or grab an .srt subtitle file for editors and players.",
  },
  {
    title: "Free and fast",
    description:
      "No account, install, or credit card. Speech recognition runs through Focera’s transcription API — no model download on your device.",
  },
];

export default function VideoToTextLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="video-to-text-features"
        title="Everything you need in a free video to text converter"
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
          Converting video to text should be quick. Focera keeps the whole
          transcription flow on one page — upload a clip, choose a language,
          extract speech, edit, and export without an account or desktop
          installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your video.</strong> Drag and drop an MP4, WebM, or
            MOV file up to 100 MB and 10 minutes, or click the zone to browse
            from your device.
          </li>
          <li>
            <strong>Choose language and output.</strong> Use Auto detect or
            English for faster results, then pick plain text or timestamped
            lines.
          </li>
          <li>
            <strong>Transcribe, edit, and export.</strong> Review the result,
            fix any wording, then copy, download TXT, or download SRT.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#video-to-text-tool">video to text tool</a> anytime to
          convert another clip.
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
            <strong>Meeting and interview clips</strong> — Turn recorded video
            into searchable notes without retyping.
          </li>
          <li>
            <strong>Lectures and talks</strong> — Capture quotes, outlines, and
            action items from spoken video.
          </li>
          <li>
            <strong>Content creators</strong> — Draft captions, show notes, or
            blog posts from your own footage.
          </li>
          <li>
            <strong>Accessibility</strong> — Convert speech into text you can
            read, edit, or share.
          </li>
        </ul>
        <p>
          Clear speech with less background noise usually produces the most
          accurate transcripts.
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
          Focera groups fast, everyday utilities in one hub. After you
          transcribe a video, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/youtube-to-text">YouTube to Text</Link> — Extract
            captions from a YouTube link without uploading a file.
          </li>
          <li>
            <Link href="/audio-to-text">Audio to Text</Link> — Transcribe MP3,
            WAV, or other audio recordings you already have.
          </li>
          <li>
            <Link href="/video-autocaption">Video Autocaption</Link> — Transcribe
            a clip and burn styled captions into the export.
          </li>
          <li>
            <Link href="/extract-audio">Extract Audio</Link> — Pull an MP3 from
            a video when you only need the soundtrack.
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
