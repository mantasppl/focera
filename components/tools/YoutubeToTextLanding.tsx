import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Paste a link, get the transcript",
    description:
      "Convert YouTube videos to text using available captions — watch links, youtu.be, Shorts, and Live URLs all work.",
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
      "No account, install, or credit card. Pull captions when YouTube provides them — including many auto-generated tracks.",
  },
];

export default function YoutubeToTextLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="youtube-to-text-features"
        title="Everything you need in a free YouTube to text converter"
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
          Turning a YouTube video into text should be quick. Focera reads the
          captions YouTube already has for the video — manual subtitles when
          available, otherwise auto-generated captions — then lets you edit and
          export on one page.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste the YouTube URL.</strong> Use a watch link, youtu.be
            short link, Shorts URL, Live URL, or the 11-character video ID.
          </li>
          <li>
            <strong>Choose plain text or timestamps.</strong> Plain text builds
            readable paragraphs; timestamps keep a line per caption cue.
          </li>
          <li>
            <strong>Extract, edit, and export.</strong> Review the transcript,
            fix wording if needed, then copy, download TXT, or download SRT.
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
            <strong>Accessibility drafts</strong> — Start from existing captions
            when building cleaner subtitles or written alternatives.
          </li>
          <li>
            <strong>Study and review</strong> — Keep a searchable transcript
            beside long tutorials or course videos.
          </li>
        </ul>
        <p>
          Videos without any captions (manual or auto-generated) cannot be
          converted. If extraction fails, try another video that shows a CC
          button on YouTube.
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
            <Link href="/video-autocaption">Video Autocaption</Link> — Upload
            your own clip to generate timed captions and burn them into video.
          </li>
          <li>
            <Link href="/text-case-converter">Text Case Converter</Link> —
            Change capitalization of the extracted transcript.
          </li>
          <li>
            <Link href="/markdown-editor">Markdown Editor</Link> — Turn notes
            from the transcript into formatted docs with live preview.
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
