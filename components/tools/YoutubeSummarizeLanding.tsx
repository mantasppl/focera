import Link from "next/link";
import FeatureGrid from "@/components/tools/FeatureGrid";

const FEATURES = [
  {
    title: "Summarize any public YouTube link",
    description:
      "Paste a watch, youtu.be, Shorts, or Live URL. Captions power the summary when available; otherwise speech is transcribed first.",
  },
  {
    title: "Brief, detailed, or key points",
    description:
      "Pick a short overview, a multi-paragraph write-up, or a bullet list of takeaways — then edit the result before you copy it.",
  },
  {
    title: "Copy or download TXT",
    description:
      "Copy the summary instantly or download a .txt file for notes, briefs, and content planning.",
  },
  {
    title: "Free and fast",
    description:
      "No account, install, or credit card. Built for research, study, and quick catch-ups on long videos.",
  },
];

export default function YoutubeSummarizeLanding() {
  return (
    <article className="tool-content">
      <FeatureGrid
        id="youtube-summarize-features"
        title="Everything you need to summarize a YouTube video"
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
          Catching up on a long video should not mean watching every minute.
          Focera reads the video&apos;s captions — or transcribes speech when
          captions are missing — then writes a clear summary in the style you
          choose.
        </p>
        <ol className="tool-content__steps">
          <li>
            <strong>Paste the YouTube URL.</strong> Use a watch link, youtu.be
            short link, Shorts URL, Live URL, or the 11-character video ID.
          </li>
          <li>
            <strong>Choose a summary style.</strong> Brief for a quick skim,
            Detailed for fuller context, or Key points for a bullet list.
          </li>
          <li>
            <strong>Summarize, edit, and export.</strong> Review the draft, tweak
            wording if needed, then copy or download TXT.
          </li>
        </ol>
        <p>
          Jump back to the{" "}
          <a href="#youtube-summarize-tool">YouTube summarize tool</a> anytime
          to summarize another video.
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
            <strong>Research and briefs</strong> — Turn talks, interviews, and
            lectures into short notes without scrubbing the timeline.
          </li>
          <li>
            <strong>Study and review</strong> — Capture the main ideas from
            tutorials and course videos before a deeper rewatch.
          </li>
          <li>
            <strong>Content planning</strong> — Skim competitor or reference
            videos and pull takeaways into outlines or show notes.
          </li>
          <li>
            <strong>Meeting catch-up</strong> — Get the gist of long recorded
            talks when you only need the highlights.
          </li>
        </ul>
        <p>
          Very long videos work best when YouTube already provides captions.
          Speech transcription is used as a fallback for shorter caption-free
          clips.
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
          summarize a video, these tools often fit the same workflow:
        </p>
        <ul className="tool-content__list">
          <li>
            <Link href="/youtube-to-text">YouTube to Text</Link> — Extract the
            full transcript when you need every word, not just a summary.
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
            <Link href="/word-counter">Word Counter</Link> — Count words and
            reading time on the summary you just generated.
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
