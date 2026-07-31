import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Transcribe speech to text",
    description:
      "Upload MP3, WAV, M4A, WebM, or OGG recordings and turn spoken words into editable text you can copy or download.",
  },
  {
    title: "Plain text or timestamps",
    description:
      "Export a clean readable transcript or keep [mm:ss] markers for notes, quotes, and editing workflows.",
  },
  {
    title: "Copy, TXT, or SRT",
    description:
      "Copy the transcript instantly, download a .txt file, or grab an .srt subtitle file for editors and players.",
  },
  {
    title: "Free and fast",
    description:
      "No account, install, or credit card. Speech recognition runs through Focera’s transcription API — no model download on your device.",
  },
];

export default function AudioToTextLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="audio-to-text-features"
        title="Everything you need in a free audio to text converter"
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
          Converting audio to text should be quick. Focera keeps the whole
          transcription flow on one page — upload a recording, choose a
          language, transcribe, edit, and export without an account or desktop
          installer.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your audio.</strong> Drag and drop an MP3, WAV, M4A,
            WebM, OGG, AAC, or FLAC file up to 24 MB and 10 minutes, or click
            the zone to browse from your device.
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
          <a href="#audio-to-text-tool">audio to text tool</a> anytime to
          convert another recording.
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
            <strong>Meetings and interviews</strong> — Turn voice memos and
            call recordings into searchable notes without retyping.
          </li>
          <li>
            <strong>Lectures and podcasts</strong> — Capture quotes, outlines,
            and action items from longer spoken content.
          </li>
          <li>
            <strong>Content creators</strong> — Draft captions, show notes, or
            blog posts from voice recordings.
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
          transcribe audio, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/video-to-text">Video to Text</Link> — Transcribe speech
            from an MP4, WebM, or MOV upload.
          </li>
          <li>
            <Link href="/youtube-to-text">YouTube to Text</Link> — Extract
            captions from a YouTube link without uploading a file.
          </li>
          <li>
            <Link href="/extract-audio">Extract Audio</Link> — Pull audio from a
            video first, then transcribe the MP3 here.
          </li>
          <li>
            <Link href="/video-autocaption">Video Autocaption</Link> — Transcribe
            a video clip and burn styled captions into the export.
          </li>
          <li>
            <Link href="/text-case-converter">Text Case Converter</Link> —
            Change capitalization of the transcript.
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
