"use client";

import Mp4ToMp3 from "@/components/tools/Mp4ToMp3";

export default function ExtractAudio() {
  return (
    <Mp4ToMp3
      copy={{
        convertLabel: "Extract audio",
        convertingLabel: "Extracting…",
        successTitle: "Audio ready",
        emptyPlaceholder:
          "Upload a video to extract and download the audio as MP3",
        previewHint: "Choose a quality and click Extract audio.",
        hintIdle:
          "Extract audio runs in your browser · files never upload to Focera",
        hintReady: "Download again anytime · processed locally",
        loadingSubtext:
          "Extraction runs locally in your browser. Keep this tab open.",
      }}
    />
  );
}
