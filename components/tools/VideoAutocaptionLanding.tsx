import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Speech extracted automatically",
    description:
      "Upload a clip and spoken audio is transcribed automatically — no typing a script first.",
  },
  {
    title: "Timed to when it was said",
    description:
      "Each caption lands at the exact moment in the video. Play the preview to check sync, then tweak wording if needed.",
  },
  {
    title: "Font, size, and location",
    description:
      "Style on-screen text with sans, serif, mono, display, or impact fonts, scale Small–XL, and place on a nine-point grid.",
  },
  {
    title: "No model download on your device",
    description:
      "Transcription runs on Focera’s speech API. Your browser only extracts audio and styles captions — no 75 MB model download.",
  },
];

export default function VideoAutocaptionLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="video-autocaption-features"
        title="Everything you need in a free video autocaption tool"
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
          Captions should match the spoken words — not a manual script you
          retype. Focera extracts speech from your video, times each line, and
          lets you edit before export.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Upload your video.</strong> Drag and drop an MP4, WebM, or
            MOV file up to 100 MB (max 10 minutes). Pick Auto detect or English
            for faster recognition.
          </li>
          <li>
            <strong>Wait for autocaption.</strong> The tool extracts the audio
            track in your browser, then transcribes speech on Focera’s servers.
            Captions appear at the timestamps they were spoken.
          </li>
          <li>
            <strong>Edit and style.</strong> Fix any wording, choose font style,
            size, and location, and preview captions on the timeline.
          </li>
          <li>
            <strong>Download.</strong> Export a burned-in WebM, or save SRT /
            VTT subtitle files for editors and players.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#video-autocaption-tool">video autocaption tool</a> anytime
          to caption another clip.
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
            <strong>Social shorts</strong> — Burn readable captions for Reels,
            TikTok, and Shorts from the spoken audio.
          </li>
          <li>
            <strong>Tutorials and demos</strong> — Keep viewers following with
            sound off using timed on-screen text.
          </li>
          <li>
            <strong>Accessibility drafts</strong> — Generate SRT or VTT files as
            a starting point for captions and subtitles.
          </li>
          <li>
            <strong>Interview clips</strong> — Pull dialogue into editable cues,
            then style for publish.
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
          caption a video, these tools often fit nearby workflows:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/video-to-text">Video to Text</Link> — Get a plain
            transcript, TXT, or SRT without burning captions into the video.
          </li>
          <li>
            <Link href="/compress-video">Compress Video</Link> — Shrink the
            captioned export before email or upload.
          </li>
          <li>
            <Link href="/image-to-text">Image to Text</Link> — Extract text
            from screenshots or slides with OCR.
          </li>
          <li>
            <Link href="/text-case-converter">Text Case Converter</Link> —
            Normalize casing after you edit transcribed lines.
          </li>
          <li>
            <Link href="/ai-story-generator">AI Story Generator</Link> — Draft
            short scripts for voiceover projects.
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
