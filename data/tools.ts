export type ToolCategory = "pdf" | "image" | "video" | "ai" | "file";

export type ToolStatus = "ready" | "soon";

export type ToolFaq = {
  question: string;
  answer: string;
};

export type Tool = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  categories: ToolCategory[];
  status: ToolStatus;
  href: string;
  keywords: string[];
  faq: ToolFaq[];
};

export const categoryOrder: ToolCategory[] = [
  "pdf",
  "image",
  "video",
  "ai",
  "file",
];

export const categoryLabels: Record<ToolCategory, string> = {
  pdf: "PDF Tools",
  image: "Image Tools",
  video: "Video Tools",
  ai: "AI Tools",
  file: "File Tools",
};

export const categoryDescriptions: Record<ToolCategory, string> = {
  pdf: "PDF tools like Merge PDF, Compress PDF, PDF to Word, and much more.",
  image:
    "Image tools like Background Remover, Image Compressor, Resize Image, Upscale Image, and much more.",
  video:
    "Video tools like Compress Video, Video to GIF, Trim Video, and much more.",
  ai: "AI tools like AI Image Generator, Background Remover, YouTube Summarizer, and much more.",
  file: "File tools like QR Generator, Password Generator, JSON Formatter, and much more.",
};

/** Curated homepage picks — popular ready tools across categories. */
export const topToolSlugs: string[] = [
  "merge-pdf",
  "compress-pdf",
  "background-remover",
  "ai-image-generator",
  "pdf-to-word",
  "image-compressor",
  "compress-video",
  "qr-generator",
  "password-generator",
];

export const tools: Tool[] = [
  {
    slug: "video-to-gif",
    name: "Video to GIF Converter",
    shortName: "Video to GIF",
    description:
      "Convert video to GIF online — turn MP4, WebM, and MOV into animated GIFs with size, fps, and color controls. Free, private, and local in your browser.",
    categories: ["video", "file"],
    status: "ready",
    href: "/video-to-gif",
    keywords: [
      "video to gif",
      "convert video to gif",
      "mp4 to gif",
      "video to gif converter",
      "make gif from video",
      "webm to gif",
      "mov to gif",
      "animated gif maker",
      "free video to gif",
      "gif converter online",
      "turn video into gif",
    ],
    faq: [
      {
        question: "Is this video to GIF converter free?",
        answer:
          "Yes. Upload a short video, convert to GIF, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my videos uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How does video to GIF conversion work?",
        answer:
          "Your browser samples frames from the video at the fps you choose, scales them to the selected size, reduces colors, and encodes an animated GIF locally.",
      },
      {
        question: "Which formats and limits are supported?",
        answer:
          "Upload MP4, WebM, or MOV files up to 100 MB. For GIF conversion, clips must be 30 seconds or shorter. Output is a standard .gif file.",
      },
      {
        question: "Which settings should I pick?",
        answer:
          "Medium size, 10 fps, and Medium colors is a solid default. Use Small or 8 fps for lighter files, or Large / 15 fps / High colors for smoother, sharper GIFs.",
      },
      {
        question: "Does the GIF include audio?",
        answer:
          "No. GIF is a silent image format. Use Extract Audio or MP4 to MP3 if you need the soundtrack separately.",
      },
    ],
  },
  {
    slug: "gif-to-mp4",
    name: "GIF to MP4 Converter",
    shortName: "GIF to MP4",
    description:
      "Convert animated GIF to MP4 online — turn GIF into video with size and quality controls. Free, private, and local in your browser.",
    categories: ["video", "image"],
    status: "ready",
    href: "/gif-to-mp4",
    keywords: [
      "gif to mp4",
      "convert gif to mp4",
      "animated gif to video",
      "gif to video converter",
      "gif to mp4 online",
      "free gif to mp4",
      "turn gif into mp4",
      "gif to webm",
      "convert gif to video",
      "animated gif converter",
    ],
    faq: [
      {
        question: "Is this GIF to MP4 converter free?",
        answer:
          "Yes. Upload a GIF, convert to video, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my GIFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How does GIF to MP4 conversion work?",
        answer:
          "Your browser decodes each GIF frame, draws them onto a canvas with the original timing, and encodes a video locally with MediaRecorder.",
      },
      {
        question: "Which formats and limits are supported?",
        answer:
          "Upload GIF files up to 25 MB, 500 frames, and 60 seconds. Output is MP4 when your browser supports it; otherwise WebM.",
      },
      {
        question: "Which settings should I pick?",
        answer:
          "Medium size and Medium quality is a solid default. Use Small or Low for lighter files, or Large / High for sharper video.",
      },
      {
        question: "Does the video include audio?",
        answer:
          "No. GIFs are silent, so the exported video has no soundtrack.",
      },
    ],
  },
  {
    slug: "compress-video",
    name: "Compress Video Tool",
    shortName: "Compress Video",
    description:
      "Compress video file size online — shrink MP4, WebM, and MOV with Extreme, Strong, Balanced, or Light presets. Free, private, and local in your browser.",
    categories: ["video"],
    status: "ready",
    href: "/compress-video",
    keywords: [
      "compress video",
      "video compressor",
      "compress video size",
      "reduce video size",
      "shrink video",
      "optimize video",
      "compress mp4",
      "compress webm",
      "make video smaller",
      "free video compressor",
      "compress video online",
    ],
    faq: [
      {
        question: "Is this video compressor free?",
        answer:
          "Yes. Upload, compress, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my videos uploaded to a server?",
        answer:
          "No. Compression runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How does compression work?",
        answer:
          "Your video is optionally scaled down for the chosen level, then re-encoded at a lower bitrate. Stronger levels use lower resolution and bitrate for more savings.",
      },
      {
        question: "Which formats are supported?",
        answer:
          "Upload MP4, WebM, or MOV files up to 100 MB and 10 minutes long. Output is usually WebM; some browsers may export MP4.",
      },
      {
        question: "Will quality look the same?",
        answer:
          "Light keeps more detail; Extreme saves the most space. Preview the result, then try another level if needed.",
      },
      {
        question: "Does audio stay in the file?",
        answer:
          "Yes when the browser can mix the audio track into the export. If audio cannot be captured, you still get a compressed video-only file.",
      },
    ],
  },
  {
    slug: "trim-video",
    name: "Trim Video Tool",
    shortName: "Trim Video",
    description:
      "Trim video online — set a start and end time on MP4, WebM, or MOV, then download the cut clip. Free, private, and local in your browser.",
    categories: ["video"],
    status: "ready",
    href: "/trim-video",
    keywords: [
      "trim video",
      "cut video",
      "video trimmer",
      "trim video online",
      "cut video online",
      "clip video",
      "edit video length",
      "crop video time",
      "shorten video",
      "cut mp4",
      "trim mp4",
      "free video trimmer",
    ],
    faq: [
      {
        question: "Is this video trimmer free?",
        answer:
          "Yes. Upload, set start and end times, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my videos uploaded to a server?",
        answer:
          "No. Trimming runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How does trimming work?",
        answer:
          "You choose a start and end time on the timeline. Focera then re-encodes only that segment so you can download a shorter clip.",
      },
      {
        question: "Which formats are supported?",
        answer:
          "Upload MP4, WebM, or MOV files up to 100 MB and 10 minutes long. Output is usually WebM; some browsers may export MP4.",
      },
      {
        question: "How precise are the cuts?",
        answer:
          "You can set start and end to the tenth of a second. Exact frame accuracy depends on the source video and your browser’s encoder.",
      },
      {
        question: "Does audio stay in the file?",
        answer:
          "Yes when the browser can mix the audio track into the export. If audio cannot be captured, you still get a trimmed video-only file.",
      },
    ],
  },
  {
    slug: "extract-audio",
    name: "Extract Audio from Video Tool",
    shortName: "Extract Audio",
    description:
      "Extract audio from your video online — pull soundtrack from MP4, WebM, and MOV as high-quality MP3. Free, private, and local in your browser.",
    categories: ["video", "file"],
    status: "ready",
    href: "/extract-audio",
    keywords: [
      "extract audio from video",
      "extract audio from your video",
      "video to audio",
      "pull audio from video",
      "save audio from video",
      "video soundtrack extractor",
      "get audio from mp4",
      "download audio from video",
      "extract mp3 from video",
      "free extract audio",
      "rip audio from video online",
    ],
    faq: [
      {
        question: "Is this extract audio from video tool free?",
        answer:
          "Yes. Upload a video, extract the audio as MP3, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my videos uploaded to a server?",
        answer:
          "No. Extraction runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How does audio extraction work?",
        answer:
          "Your browser reads the audio track from the video, then encodes it as an MP3 at the bitrate you choose (128, 192, or 320 kbps).",
      },
      {
        question: "Which formats are supported?",
        answer:
          "Upload MP4, WebM, or MOV files up to 100 MB and 10 minutes long. Output is a standard .mp3 file.",
      },
      {
        question: "Which quality should I pick?",
        answer:
          "192 kbps is a solid default. Use 128 kbps for smaller files or 320 kbps when you want the highest quality.",
      },
      {
        question: "What if my video has no sound?",
        answer:
          "The tool needs an audio track. Silent or video-only files cannot produce an MP3.",
      },
    ],
  },
  {
    slug: "mp4-to-mp3",
    name: "MP4 to MP3 Converter",
    shortName: "MP4 to MP3",
    description:
      "Convert MP4 to MP3 online — turn MP4, WebM, and MOV into high-quality MP3. Free, private, and local in your browser.",
    categories: ["video", "file"],
    status: "ready",
    href: "/mp4-to-mp3",
    keywords: [
      "mp4 to mp3",
      "convert mp4 to mp3",
      "mp4 to mp3 converter",
      "video to mp3",
      "mp4 audio extract",
      "download mp3 from video",
      "webm to mp3",
      "mov to mp3",
      "free mp4 to mp3",
      "convert video to mp3 online",
    ],
    faq: [
      {
        question: "Is this MP4 to MP3 converter free?",
        answer:
          "Yes. Upload a video, convert to MP3, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my videos uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How does MP4 to MP3 conversion work?",
        answer:
          "Your browser extracts the audio track from the video, then encodes it as an MP3 at the bitrate you choose (128, 192, or 320 kbps).",
      },
      {
        question: "Which formats are supported?",
        answer:
          "Upload MP4, WebM, or MOV files up to 100 MB and 10 minutes long. Output is a standard .mp3 file.",
      },
      {
        question: "Which quality should I pick?",
        answer:
          "192 kbps is a solid default. Use 128 kbps for smaller files or 320 kbps when you want the highest quality.",
      },
      {
        question: "What if my video has no sound?",
        answer:
          "The converter needs an audio track. Silent or video-only files cannot be turned into an MP3.",
      },
    ],
  },
  {
    slug: "video-autocaption",
    name: "Video Autocaption Tool",
    shortName: "Video Captions",
    description:
      "Auto-caption video from speech online — spoken words are transcribed with exact timing, then you edit, style font/size/location, and download. Free, no model download on your device.",
    categories: ["video"],
    status: "ready",
    href: "/video-autocaption",
    keywords: [
      "video autocaption",
      "auto caption video",
      "speech to caption",
      "transcribe video captions",
      "add captions to video",
      "video caption generator",
      "burn captions into video",
      "srt generator",
      "vtt captions online",
      "free video captions",
      "whisper captions online",
      "on screen text video",
    ],
    faq: [
      {
        question: "Is this video autocaption tool free?",
        answer:
          "Yes. Upload a clip, auto-transcribe speech, edit captions, style them, and download with no account, subscription, or daily limit.",
      },
      {
        question: "Do I need to download a speech model?",
        answer:
          "No. Transcription runs on Focera’s speech API. Your browser extracts the audio track and applies caption styling locally — there is no large model download for each visitor.",
      },
      {
        question: "Is my full video uploaded?",
        answer:
          "No. Only a compressed audio extract is sent for transcription. Caption styling and burned-in export stay in your browser. Audio is not kept as a permanent library on Focera.",
      },
      {
        question: "How does autocaption work?",
        answer:
          "The tool extracts audio from your video and transcribes speech with timed segments. Captions appear when each phrase was spoken. You can edit any line before export.",
      },
      {
        question: "Do I need to type the caption text?",
        answer:
          "No. Text is generated automatically from the video’s speech. Typing is only for optional edits if a word was misheard.",
      },
      {
        question: "Can I choose font style, size, and location?",
        answer:
          "Yes. Pick Sans, Serif, Mono, Display, or Impact; Small through XL size; and any of nine positions. The preview updates live.",
      },
      {
        question: "What can I download?",
        answer:
          "Download a WebM with burned-in captions, or export SRT and VTT subtitle files for use in editors and players.",
      },
      {
        question: "Which video formats are supported?",
        answer:
          "Upload MP4, WebM, or MOV files up to 100 MB and 10 minutes long. Clear speech works best.",
      },
    ],
  },
  {
    slug: "tiktok-video-downloader",
    name: "TikTok Video Downloader",
    shortName: "TikTok Video",
    description:
      "Download TikTok videos online — paste a public TikTok link or short URL, preview the clip, and save an MP4. Free, no account required.",
    categories: ["video"],
    status: "ready",
    href: "/tiktok-video-downloader",
    keywords: [
      "tiktok video downloader",
      "download tiktok video",
      "tiktok downloader",
      "download tiktok mp4",
      "save tiktok video",
      "tiktok video saver",
      "tiktok to mp4",
      "download tt video",
      "free tiktok downloader",
      "tiktok short link download",
    ],
    faq: [
      {
        question: "Is this TikTok video downloader free?",
        answer:
          "Yes. Paste a public TikTok link, preview the video, and download an MP4 with no account, subscription, or daily limit.",
      },
      {
        question: "Which TikTok links work?",
        answer:
          "Public www.tiktok.com/@user/video links work, plus vm.tiktok.com and vt.tiktok.com short share URLs. Private, region-blocked, and deleted videos cannot be fetched.",
      },
      {
        question: "Do I need a TikTok account?",
        answer:
          "No. Open the page, paste a public URL, and download. Nothing to install and no signup required.",
      },
      {
        question: "Can I download photo slideshows?",
        answer:
          "No. This tool downloads video posts only. Photo mode / image slideshow posts cannot be saved here.",
      },
      {
        question: "Can I download private TikTok videos?",
        answer:
          "No. Only public media is available. If a video is private or login-walled, the download will fail.",
      },
      {
        question: "Am I allowed to download any video?",
        answer:
          "Only download content you have the right to use — for example your own posts, or material you are permitted to save. Respect TikTok’s terms and the creator’s rights.",
      },
    ],
  },
  {
    slug: "instagram-video-downloader",
    name: "Instagram Video Downloader",
    shortName: "Instagram Video",
    description:
      "Download Instagram videos and Reels online — paste a public post or Reel link, preview the clip, and save an MP4. Free, no account required.",
    categories: ["video"],
    status: "ready",
    href: "/instagram-video-downloader",
    keywords: [
      "instagram video downloader",
      "download instagram video",
      "instagram reel downloader",
      "download instagram reels",
      "instagram mp4 download",
      "save instagram video",
      "instagram video saver",
      "download ig reel",
      "instagram post video download",
      "free instagram downloader",
    ],
    faq: [
      {
        question: "Is this Instagram video downloader free?",
        answer:
          "Yes. Paste a public Instagram link, preview the video, and download an MP4 with no account, subscription, or daily limit.",
      },
      {
        question: "Which Instagram links work?",
        answer:
          "Public posts, Reels, and TV links are supported, including username/reel URLs and shortcodes. Private, age-restricted, and deleted posts cannot be fetched.",
      },
      {
        question: "Can I download Instagram Reels?",
        answer:
          "Yes. Paste a Reel URL and Focera resolves the highest-quality MP4 Instagram hosts for that public Reel.",
      },
      {
        question: "What if the post has several videos?",
        answer:
          "For carousel posts with multiple clips, choose which video to download after fetching the post.",
      },
      {
        question: "Do I need an Instagram account?",
        answer:
          "No. Open the page, paste a public URL, and download. Nothing to install and no signup required.",
      },
      {
        question: "Is photo-only content supported?",
        answer:
          "No. This tool downloads videos only. Image posts and carousels without video clips cannot be saved here.",
      },
      {
        question: "Can I download private Instagram videos?",
        answer:
          "No. Only public media is available. If a post is private or login-walled, the download will fail.",
      },
      {
        question: "Am I allowed to download any video?",
        answer:
          "Only download content you have the right to use — for example your own posts, or material you are permitted to save. Respect Instagram’s terms and the creator’s rights.",
      },
    ],
  },
  {
    slug: "twitter-video-downloader",
    name: "Twitter/X Video Downloader",
    shortName: "Twitter Video",
    description:
      "Download Twitter/X videos online — paste a public x.com or twitter.com post link, preview the clip, and save an MP4. Free, no account required.",
    categories: ["video"],
    status: "ready",
    href: "/twitter-video-downloader",
    keywords: [
      "twitter video downloader",
      "x video downloader",
      "download twitter video",
      "download x video",
      "twitter mp4 download",
      "save twitter video",
      "twitter video saver",
      "download tweet video",
      "x.com video download",
      "free twitter downloader",
    ],
    faq: [
      {
        question: "Is this Twitter/X video downloader free?",
        answer:
          "Yes. Paste a public Twitter or X post link, preview the video, and download an MP4 with no account, subscription, or daily limit.",
      },
      {
        question: "Which Twitter/X links work?",
        answer:
          "Public x.com and twitter.com status URLs work, including mobile.twitter.com links. Private, suspended, and deleted posts cannot be fetched.",
      },
      {
        question: "Do I need a Twitter/X account?",
        answer:
          "No. Open the page, paste a public URL, and download. Nothing to install and no signup required.",
      },
      {
        question: "What if the post has several videos?",
        answer:
          "For posts with multiple clips, choose which video to download after fetching the post.",
      },
      {
        question: "Can I download Twitter GIFs?",
        answer:
          "Yes. Animated GIF posts on Twitter/X are stored as MP4 files and can be downloaded the same way as regular videos.",
      },
      {
        question: "Can I download private Twitter/X videos?",
        answer:
          "No. Only public media is available. If a post is private, protected, or login-walled, the download will fail.",
      },
      {
        question: "Am I allowed to download any video?",
        answer:
          "Only download content you have the right to use — for example your own posts, or material you are permitted to save. Respect X’s terms and the creator’s rights.",
      },
    ],
  },
  {
    slug: "facebook-video-downloader",
    name: "Facebook Video Downloader",
    shortName: "Facebook Video",
    description:
      "Download Facebook videos online — paste a public watch, Reel, or fb.watch link, preview the clip, and save an MP4. Free, no account required.",
    categories: ["video"],
    status: "ready",
    href: "/facebook-video-downloader",
    keywords: [
      "facebook video downloader",
      "download facebook video",
      "facebook reel downloader",
      "download facebook reels",
      "facebook mp4 download",
      "save facebook video",
      "facebook video saver",
      "fb watch download",
      "download fb video",
      "free facebook downloader",
    ],
    faq: [
      {
        question: "Is this Facebook video downloader free?",
        answer:
          "Yes. Paste a public Facebook link, preview the video, and download an MP4 with no account, subscription, or daily limit.",
      },
      {
        question: "Which Facebook links work?",
        answer:
          "Public facebook.com/watch, /reel, and /videos links work, plus many fb.watch short share URLs. Private, age-restricted, and deleted videos cannot be fetched.",
      },
      {
        question: "Can I download Facebook Reels?",
        answer:
          "Yes. Paste a Reel URL and Focera resolves the highest-quality progressive MP4 Facebook hosts for that public Reel.",
      },
      {
        question: "Do I need a Facebook account?",
        answer:
          "No. Open the page, paste a public URL, and download. Nothing to install and no signup required.",
      },
      {
        question: "Can I download private Facebook videos?",
        answer:
          "No. Only public media is available. If a post is private, friends-only, or login-walled, the download will fail.",
      },
      {
        question: "Am I allowed to download any video?",
        answer:
          "Only download content you have the right to use — for example your own posts, or material you are permitted to save. Respect Facebook’s terms and the creator’s rights.",
      },
    ],
  },
  {
    slug: "youtube-to-text",
    name: "YouTube Video Transcriber — YouTube to Text",
    shortName: "YouTube to Text",
    description:
      "Transcribe YouTube videos to text online — paste a link, pull captions when available, or speech-transcribe audio up to 10 minutes, then copy, download TXT, or export SRT. Free, no account required.",
    categories: ["video", "ai"],
    status: "ready",
    href: "/youtube-to-text",
    keywords: [
      "youtube to text",
      "youtube transcript",
      "youtube to text converter",
      "youtube captions to text",
      "extract youtube transcript",
      "youtube subtitle download",
      "youtube video to text",
      "transcribe youtube video",
      "youtube speech to text",
      "youtube srt download",
      "free youtube transcript",
      "youtube auto captions text",
      "whisper youtube transcript",
    ],
    faq: [
      {
        question: "Is this YouTube video transcriber free?",
        answer:
          "Yes. Paste a link, get the transcript, copy, and download with no account, subscription, or daily limit.",
      },
      {
        question: "How does YouTube transcription work?",
        answer:
          "Focera first reads captions YouTube already provides — uploaded subtitles when available, otherwise auto-generated captions. If there is no caption track, it downloads the audio and transcribes speech (videos up to about 10 minutes).",
      },
      {
        question: "Do I need the video to have captions?",
        answer:
          "No. Captions are preferred when present. Without captions, speech transcription runs from the video’s audio for clips up to 10 minutes.",
      },
      {
        question: "What can I download?",
        answer:
          "Copy the transcript, download a .txt file, or export an .srt subtitle file for editors and players.",
      },
      {
        question: "Which YouTube links are supported?",
        answer:
          "Watch URLs, youtu.be short links, Shorts, Live links, and 11-character video IDs are supported.",
      },
      {
        question: "Is the full video downloaded?",
        answer:
          "When captions exist, only caption data is fetched. When speech transcription is needed, a compressed audio track is downloaded temporarily for transcription and is not kept as a permanent library.",
      },
      {
        question: "Can I get timestamps?",
        answer:
          "Yes. Choose With timestamps to keep [mm:ss] markers on each line, or Plain text for readable paragraphs.",
      },
      {
        question: "Do I need an account?",
        answer:
          "No. Open the page, paste a YouTube URL, and transcribe. Nothing to install and no signup required.",
      },
    ],
  },
  {
    slug: "youtube-summarize",
    name: "YouTube Video Summarizer — Summarize YouTube",
    shortName: "YouTube Summarizer",
    description:
      "Summarize YouTube videos online — paste a link, pull captions or speech, then get a brief overview, detailed summary, or key points. Copy or download TXT. Free, no account required.",
    categories: ["video", "ai"],
    status: "ready",
    href: "/youtube-summarize",
    keywords: [
      "youtube summarizer",
      "summarize youtube video",
      "youtube summary",
      "youtube video summary",
      "ai youtube summarizer",
      "youtube key points",
      "summarize youtube transcript",
      "youtube tl;dr",
      "free youtube summarizer",
      "youtube video overview",
      "youtube lecture summary",
      "youtube notes generator",
    ],
    faq: [
      {
        question: "Is this YouTube video summarizer free?",
        answer:
          "Yes. Paste a link, get a summary, copy, and download with no account, subscription, or credit card.",
      },
      {
        question: "How does YouTube summarization work?",
        answer:
          "Focera first reads captions YouTube already provides. If there is no caption track, it transcribes speech from the audio (videos up to about 10 minutes), then writes a summary in the style you choose.",
      },
      {
        question: "What summary styles are available?",
        answer:
          "Brief (2–4 sentences), Detailed (multi-paragraph), or Key points (bullet list of takeaways).",
      },
      {
        question: "Do I need the video to have captions?",
        answer:
          "No. Captions are preferred when present. Without captions, speech transcription runs from the video’s audio for clips up to 10 minutes before summarizing.",
      },
      {
        question: "Which YouTube links are supported?",
        answer:
          "Watch URLs, youtu.be short links, Shorts, Live links, and 11-character video IDs are supported.",
      },
      {
        question: "What can I download?",
        answer:
          "Copy the summary or download a .txt file for notes and briefs.",
      },
      {
        question: "Are very long videos supported?",
        answer:
          "Yes when captions exist. Extremely long transcripts may be truncated so the summarizer can stay within length limits; the summary then covers the available portion.",
      },
      {
        question: "Do I need an account?",
        answer:
          "No. Open the page, paste a YouTube URL, and summarize. Nothing to install and no signup required.",
      },
    ],
  },
  {
    slug: "audio-to-text",
    name: "Audio to Text Converter — Speech Transcription",
    shortName: "Audio to Text",
    description:
      "Transcribe audio to text online — convert MP3, WAV, M4A, and more into editable transcripts. Copy, download TXT, or export SRT. Free, no account required.",
    categories: ["ai", "video"],
    status: "ready",
    href: "/audio-to-text",
    keywords: [
      "audio to text",
      "speech to text",
      "transcribe audio",
      "audio transcription",
      "voice to text",
      "mp3 to text",
      "wav to text",
      "speech recognition online",
      "free audio transcript",
      "stt online",
      "whisper transcription",
      "convert audio to text",
    ],
    faq: [
      {
        question: "Is this audio to text converter free?",
        answer:
          "Yes. Upload audio, transcribe speech, copy, and download with no account, subscription, or daily limit.",
      },
      {
        question: "How does audio to text work?",
        answer:
          "Your browser sends the audio file to Focera’s transcription API, which converts speech into timed text segments. You can edit the result, then copy or download it.",
      },
      {
        question: "Which audio formats are supported?",
        answer:
          "Upload MP3, WAV, M4A, WebM, OGG, AAC, or FLAC files up to 24 MB and about 10 minutes long.",
      },
      {
        question: "What can I download?",
        answer:
          "Copy the transcript, download a .txt file (plain or timestamped), or export an .srt subtitle file when timed segments are available.",
      },
      {
        question: "Do I need to download a speech model?",
        answer:
          "No. Transcription runs on Focera’s speech API. There is no large model download for each visitor.",
      },
      {
        question: "Is my audio kept permanently?",
        answer:
          "No. Audio is processed for transcription and is not stored as a permanent library on Focera.",
      },
      {
        question: "Can I get timestamps?",
        answer:
          "Yes. Choose With timestamps for [mm:ss] markers on each line, or Plain text for readable paragraphs.",
      },
      {
        question: "Do I need an account?",
        answer:
          "No. Open the page, upload a recording, and transcribe. Nothing to install and no signup required.",
      },
    ],
  },
  {
    slug: "video-to-text",
    name: "Video to Text Converter — Transcribe Video",
    shortName: "Video to Text",
    description:
      "Transcribe video to text online — upload MP4, WebM, or MOV, extract speech, and get an editable transcript. Copy, download TXT, or export SRT. Free, no account required.",
    categories: ["video", "ai"],
    status: "ready",
    href: "/video-to-text",
    keywords: [
      "video to text",
      "transcribe video",
      "video transcription",
      "video to text converter",
      "speech to text video",
      "mp4 to text",
      "extract text from video",
      "video transcript online",
      "video speech recognition",
      "free video transcript",
      "whisper video transcription",
      "convert video to text",
    ],
    faq: [
      {
        question: "Is this video to text converter free?",
        answer:
          "Yes. Upload a clip, transcribe speech, copy, and download with no account, subscription, or daily limit.",
      },
      {
        question: "How does video to text work?",
        answer:
          "Your browser extracts a compressed audio track from the video, then Focera’s transcription API converts speech into timed text. You can edit the result, then copy or download it.",
      },
      {
        question: "Which video formats are supported?",
        answer:
          "Upload MP4, WebM, or MOV files up to 100 MB and about 10 minutes long.",
      },
      {
        question: "Is my full video uploaded?",
        answer:
          "No. Only a compressed audio extract is sent for transcription. The video file stays in your browser. Audio is not kept as a permanent library on Focera.",
      },
      {
        question: "What can I download?",
        answer:
          "Copy the transcript, download a .txt file (plain or timestamped), or export an .srt subtitle file when timed segments are available.",
      },
      {
        question: "Do I need to download a speech model?",
        answer:
          "No. Transcription runs on Focera’s speech API. There is no large model download for each visitor.",
      },
      {
        question: "Can I get timestamps?",
        answer:
          "Yes. Choose With timestamps for [mm:ss] markers on each line, or Plain text for readable paragraphs.",
      },
      {
        question: "Do I need an account?",
        answer:
          "No. Open the page, upload a video, and transcribe. Nothing to install and no signup required.",
      },
    ],
  },
  {
    slug: "color-palette-generator",
    name: "Color Palette Generator",
    shortName: "Palettes",
    description:
      "Generate random color palettes, lock favorites, check WCAG contrast, and export CSS, Tailwind, HEX, or RGB — free and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/color-palette-generator",
    keywords: [
      "color palette generator",
      "free color palette generator",
      "random color palette",
      "hex color palette",
      "css color palette",
      "tailwind color palette",
      "color scheme generator",
      "contrast checker",
      "wcag contrast",
    ],
    faq: [
      {
        question: "Is this color palette generator free?",
        answer:
          "Yes. Generate, lock, copy, and export unlimited palettes with no account, subscription, or daily limit.",
      },
      {
        question: "Can I lock colors while regenerating others?",
        answer:
          "Yes. Lock any swatch to keep it. The next generate refreshes only unlocked colors so you can iterate around a brand accent.",
      },
      {
        question: "Which export formats are supported?",
        answer:
          "Export CSS custom properties, Tailwind theme color keys, a HEX list, or an RGB list — then copy the result in one click.",
      },
      {
        question: "How do I copy a single color?",
        answer:
          "Click the HEX value on any swatch to copy it to your clipboard. You can also adjust the color with the built-in color picker.",
      },
      {
        question: "What does the contrast checker do?",
        answer:
          "It measures the WCAG contrast ratio between any two palette colors and reports AA/AAA pass or fail for normal and large text.",
      },
      {
        question: "Are my palettes uploaded to a server?",
        answer:
          "No. Generation, locking, exports, and contrast checks run entirely in your browser. Nothing is sent to Focera for processing.",
      },
      {
        question: "How many colors are in each palette?",
        answer:
          "Each palette has five colors — a practical size for brand accents, surfaces, and supporting tones in UI and marketing work.",
      },
    ],
  },
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    shortName: "QR Generator",
    description:
      "Create branded QR codes for URLs, Wi‑Fi, vCards, events, geo, apps, and more. Customize colors, logo, styles, verify with camera, and download PNG, SVG, or PDF — free in your browser.",
    categories: ["file"],
    status: "ready",
    href: "/qr-generator",
    keywords: [
      "free qr code generator",
      "qr code generator",
      "qr code maker",
      "create qr code online",
      "wifi qr code",
      "vcard qr code",
      "qr code svg",
      "qr code pdf",
      "event qr code",
      "qr",
      "barcode",
    ],
    faq: [
      {
        question: "Is this free QR code generator really free?",
        answer:
          "Yes. You can generate, preview, and download QR codes without paying, creating an account, or hitting a daily limit.",
      },
      {
        question: "Is the QR code generated on my device?",
        answer:
          "Yes. Codes are created in your browser — nothing is uploaded to a server during generation.",
      },
      {
        question: "What format can I download?",
        answer:
          "Download PNG, SVG, or a print-ready PDF. Transparent backgrounds and batch ZIP exports are also available.",
      },
      {
        question: "What content types can I encode?",
        answer:
          "URL, text, Wi‑Fi, vCard, email, phone, SMS, calendar events, geo locations, and app store links — each with guided fields.",
      },
      {
        question: "Can I verify a QR code before printing?",
        answer:
          "Yes. Use Scan to verify with your camera, or decode an existing QR image to import its payload.",
      },
      {
        question: "Do I need to sign up to use the generator?",
        answer:
          "No account is required. Open the page, enter your content, and download your code immediately.",
      },
      {
        question: "What size should my QR code be for printing?",
        answer:
          "Size depends on scan distance. Business cards often work from 2–3 cm; posters need larger codes. Always test with a phone before bulk printing.",
      },
      {
        question: "Can I use generated QR codes for commercial projects?",
        answer:
          "Yes. Codes you create here are yours to use in marketing, packaging, events, and client work.",
      },
      {
        question: "How is a QR code different from a barcode?",
        answer:
          "Traditional barcodes store limited numeric data in one dimension. QR codes store much more information in two dimensions and are readable from any angle with a smartphone camera.",
      },
    ],
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    shortName: "Lorem Ipsum",
    description:
      "Generate classic Lorem Ipsum placeholder text by words, sentences, or paragraphs. Copy instantly or download a TXT file — free, private, and local.",
    categories: ["file"],
    status: "ready",
    href: "/lorem-ipsum-generator",
    keywords: [
      "lorem ipsum generator",
      "free lorem ipsum generator",
      "dummy text generator",
      "placeholder text generator",
      "lorem ipsum paragraphs",
      "lorem ipsum words",
      "lorem ipsum sentences",
      "filler text generator",
    ],
    faq: [
      {
        question: "What is Lorem Ipsum?",
        answer:
          "Lorem Ipsum is classic placeholder Latin-style text used in design mockups, wireframes, and typesetting so layout and typography can be judged without real copy distracting the eye.",
      },
      {
        question: "Can I generate words, sentences, or paragraphs?",
        answer:
          "Yes. Choose Words, Sentences, or Paragraphs, set the count, and generate. Each mode produces filler text sized for that unit.",
      },
      {
        question: "Can I copy or download the result?",
        answer:
          "Yes. Use Copy to place the text on your clipboard, or Download TXT to save a plain-text file for design tools, docs, or CMS drafts.",
      },
      {
        question: "Does the generator start with the classic Lorem Ipsum phrase?",
        answer:
          "Optionally. Keep “Start with Lorem ipsum” enabled to begin with the familiar opening line, or turn it off for fully randomized filler text.",
      },
      {
        question: "Is this Lorem Ipsum generator free?",
        answer:
          "Yes. Generate unlimited placeholder text with no account, watermarks, or daily limits.",
      },
      {
        question: "Is my text uploaded to a server?",
        answer:
          "No. Generation runs entirely in your browser. Nothing is sent to Focera servers when you create, copy, or download filler text.",
      },
      {
        question: "When should I use Lorem Ipsum instead of real copy?",
        answer:
          "Use it early in design and layout work when content is not ready yet. Replace it with real writing before launch so SEO, accessibility, and meaning are accurate.",
      },
    ],
  },
  {
    slug: "ai-story-generator",
    name: "AI Story Generator",
    shortName: "AI Stories",
    description:
      "Generate AI short stories from a prompt — pick genre, length, and tone, then copy or download the text. Free, no account required.",
    categories: ["ai"],
    status: "ready",
    href: "/ai-story-generator",
    keywords: [
      "ai story generator",
      "free ai story generator",
      "story generator",
      "ai writing tool",
      "generate a story",
      "short story generator",
      "fiction generator",
      "creative writing ai",
      "prompt to story",
      "free story writer",
    ],
    faq: [
      {
        question: "Is this AI story generator free?",
        answer:
          "Yes. Enter a premise, generate stories, and copy or download the text with no account, subscription, or credit card.",
      },
      {
        question: "How does AI story generation work?",
        answer:
          "You describe an idea in plain language, then choose genre, length, and tone. The tool sends your prompt to an AI writing model and returns a complete short story.",
      },
      {
        question: "Are my prompts stored by Focera?",
        answer:
          "Focera does not keep a library of your prompts or stories. Your idea is sent to the generation provider to create the text, then the result is shown in your browser to copy or download.",
      },
      {
        question: "Which genres and lengths are available?",
        answer:
          "Choose genres such as adventure, fantasy, mystery, sci-fi, romance, horror, comedy, and fable. Length options range from flash fiction to medium short stories, with tones from warm to dark or epic.",
      },
      {
        question: "Can I copy or download the story?",
        answer:
          "Yes. After generation, copy the text to your clipboard or download a plain TXT file for drafts, classrooms, and creative projects.",
      },
      {
        question: "Why did generation fail or take long?",
        answer:
          "The free model can be busy or rate-limited. Wait a few seconds and try again, or shorten the prompt and regenerate with a new variation.",
      },
      {
        question: "Do I need an account or API key?",
        answer:
          "No. Open the page, enter a story idea, and generate. Nothing to install and no signup required.",
      },
    ],
  },
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    shortName: "Invoices",
    description:
      "Create professional invoices with company and client details, unlimited line items, VAT, and instant PDF download.",
    categories: ["file"],
    status: "ready",
    href: "/invoice-generator",
    keywords: [
      "invoice generator",
      "free invoice",
      "invoice pdf",
      "invoice template",
      "billing",
      "vat invoice",
      "online invoice maker",
    ],
    faq: [
      {
        question: "Will invoices be saved online?",
        answer:
          "No. Drafts stay in your browser until you export or download them. Nothing is uploaded to Focera servers.",
      },
      {
        question: "Can I add unlimited products and services?",
        answer:
          "Yes. Add as many line items as you need. Each row includes description, quantity, and unit price with automatic amount calculation.",
      },
      {
        question: "Does the invoice generator support VAT?",
        answer:
          "Yes. Toggle VAT or sales tax on, set your percentage rate, and subtotal, tax, and total update automatically in the preview and PDF.",
      },
      {
        question: "How do I download my invoice as a PDF?",
        answer:
          "Fill in your invoice details and click Download PDF. The file is generated locally in your browser and saved to your device.",
      },
      {
        question: "Do I need an account to create invoices?",
        answer:
          "No account is required. Open the tool, build your invoice, and download — no sign-up or subscription.",
      },
      {
        question: "Which currencies are supported?",
        answer:
          "You can choose USD, EUR, GBP, CAD, or AUD. Amounts are formatted with the correct currency symbol in the preview and PDF.",
      },
    ],
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    shortName: "Units",
    description:
      "Convert length, weight, temperature, volume, area, speed, and data storage instantly in your browser.",
    categories: ["file"],
    status: "ready",
    href: "/unit-converter",
    keywords: [
      "unit converter",
      "free unit converter",
      "metric to imperial",
      "length converter",
      "weight converter",
      "temperature converter",
      "volume converter",
      "online unit conversion",
    ],
    faq: [
      {
        question: "Which units can I convert?",
        answer:
          "Length, weight, temperature, volume, area, speed, and data storage — including common metric and imperial units, plus Celsius, Fahrenheit, and Kelvin.",
      },
      {
        question: "Do conversions happen on a server?",
        answer:
          "No. All math runs locally in your browser. Values you enter are not uploaded to Focera for processing.",
      },
      {
        question: "How does temperature conversion work?",
        answer:
          "Temperature uses the standard formulas between Celsius, Fahrenheit, and Kelvin rather than a simple scale factor, so results stay accurate around freezing and absolute zero.",
      },
      {
        question: "Are data storage units 1000-based or 1024-based?",
        answer:
          "Kilobytes through petabytes use 1024-based multiples (binary-style), matching how most operating systems report file sizes.",
      },
      {
        question: "Can I swap from and to units?",
        answer:
          "Yes. Use the swap control to reverse the units and carry the current result into the From field.",
      },
      {
        question: "Is this unit converter free?",
        answer:
          "Yes. Convert unlimited values with no account, subscription, or daily limit.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes. The converter is responsive — category tabs scroll horizontally on small screens so you can switch types quickly on a phone.",
      },
    ],
  },
  {
    slug: "text-case-converter",
    name: "Text Case Converter",
    shortName: "Text Case",
    description:
      "Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case — instantly in your browser.",
    categories: ["file"],
    status: "ready",
    href: "/text-case-converter",
    keywords: [
      "text case converter",
      "uppercase converter",
      "lowercase converter",
      "title case converter",
      "sentence case converter",
      "camelCase converter",
      "PascalCase converter",
      "snake_case converter",
      "kebab-case converter",
      "convert text case online",
    ],
    faq: [
      {
        question: "Which case styles are supported?",
        answer:
          "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case.",
      },
      {
        question: "Does conversion happen on a server?",
        answer:
          "No. All case changes run locally in your browser. Text you enter is not uploaded to Focera for processing.",
      },
      {
        question: "How do camelCase and snake_case handle mixed input?",
        answer:
          "The converter splits words on spaces, punctuation, underscores, hyphens, and camelCase boundaries, then rebuilds the string in the selected style.",
      },
      {
        question: "Can I see character and word counts?",
        answer:
          "Yes. Character and word counts update live under the input field as you type or paste.",
      },
      {
        question: "How do I copy the result?",
        answer:
          "Use the Copy button next to the output. You can also use “Use as input” to chain another conversion.",
      },
      {
        question: "Is this text case converter free?",
        answer:
          "Yes. Convert unlimited text with no account, subscription, or daily limit.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes. The layout stacks on small screens so you can switch case styles and copy results comfortably on a phone.",
      },
    ],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    shortName: "Word Counter",
    description:
      "Count words, characters, sentences, and paragraphs online — plus reading and speaking time. Free, private, and live in your browser.",
    categories: ["file"],
    status: "ready",
    href: "/word-counter",
    keywords: [
      "word counter",
      "word count",
      "character counter",
      "character count",
      "sentence counter",
      "paragraph counter",
      "reading time calculator",
      "online word counter",
      "free word counter",
      "count words in text",
    ],
    faq: [
      {
        question: "What does this word counter measure?",
        answer:
          "Words, characters (with and without spaces), sentences, paragraphs, lines, plus estimated reading and speaking time.",
      },
      {
        question: "Does my text leave the browser?",
        answer:
          "No. All counting runs locally in your browser. Text you enter is never uploaded to Focera.",
      },
      {
        question: "How is reading time calculated?",
        answer:
          "Reading time assumes about 200 words per minute (typical silent reading). Speaking time assumes about 130 words per minute.",
      },
      {
        question: "How are words counted?",
        answer:
          "Words are split on whitespace after trimming. Empty input counts as zero words.",
      },
      {
        question: "Can I copy my text?",
        answer:
          "Yes. Use Copy text to place the current draft on your clipboard, or Clear to reset the editor.",
      },
      {
        question: "Is this word counter free?",
        answer:
          "Yes. Count unlimited text with no account, subscription, or daily limit.",
      },
      {
        question: "Does it work on mobile?",
        answer:
          "Yes. The layout stacks on small screens so you can paste text and read live counts comfortably on a phone.",
      },
    ],
  },
  {
    slug: "pdf-editor",
    name: "PDF Editor",
    shortName: "PDF Editor",
    description:
      "Edit PDFs online for free — reorder, rotate, delete, duplicate, and extract pages with a visual workspace. Private, no watermark, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/pdf-editor",
    keywords: [
      "pdf editor",
      "edit pdf",
      "free pdf editor",
      "pdf editor online",
      "reorder pdf pages",
      "rotate pdf pages",
      "delete pdf pages",
      "extract pdf pages",
      "online pdf editor",
    ],
    faq: [
      {
        question: "Is this PDF editor free?",
        answer:
          "Yes. Edit and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Editing runs entirely in your browser with pdf-lib and PDF.js. Your files stay on your device.",
      },
      {
        question: "What can I edit?",
        answer:
          "Reorder pages with drag and drop, rotate left or right, duplicate or delete pages, insert blank pages, extract a selection, and download the full edited PDF.",
      },
      {
        question: "Can I edit text or annotations inside pages?",
        answer:
          "This editor focuses on page-level tools — order, rotation, duplication, deletion, blank pages, and extraction. Text and vector content on each page is preserved when you export.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per edit session.",
      },
      {
        question: "Can I edit password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then open the unlocked copy in the editor.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and edit immediately.",
      },
    ],
  },
  {
    slug: "pdf-creator",
    name: "PDF Creator Tool",
    shortName: "PDF Creator",
    description:
      "Create a PDF online for free — write a title and body text, or make blank pages in A4 or Letter. Private, no watermark, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/pdf-creator",
    keywords: [
      "pdf creator",
      "create pdf",
      "make pdf online",
      "create pdf online",
      "blank pdf",
      "text to pdf",
      "free pdf creator",
      "pdf maker",
      "create pdf from text",
      "online pdf creator",
    ],
    faq: [
      {
        question: "Is this PDF creator free?",
        answer:
          "Yes. Create and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my documents uploaded to a server?",
        answer:
          "No. PDF creation runs entirely in your browser with jsPDF. Your text and files stay on your device.",
      },
      {
        question: "Can I create a blank PDF?",
        answer:
          "Yes. Leave the title and body empty, set blank pages to 1 or more, choose A4 or Letter, then click Create PDF.",
      },
      {
        question: "What page sizes are supported?",
        answer:
          "A4 and US Letter, in portrait or landscape. Text wraps automatically across pages as needed.",
      },
      {
        question: "Is there a length or page limit?",
        answer:
          "Title up to 200 characters, body up to 50,000 characters, and at most 50 pages total per download.",
      },
      {
        question: "Can I turn images into a PDF?",
        answer:
          "Use Image to PDF for images. This creator is for text documents and blank pages from scratch.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, write your content, and download immediately.",
      },
    ],
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF Tool",
    shortName: "Merge PDF",
    description:
      "Merge two or more PDFs into one file online — reorder pages, combine documents, and download instantly. Free, private, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/merge-pdf",
    keywords: [
      "merge pdf",
      "combine pdf",
      "pdf merger",
      "merge pdfs online",
      "join pdf files",
      "combine pdf files",
      "free pdf merger",
      "merge multiple pdfs",
    ],
    faq: [
      {
        question: "Is this PDF merger free?",
        answer:
          "Yes. Merge unlimited PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Merging runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
      {
        question: "Can I change the order of PDFs before merging?",
        answer:
          "Yes. After uploading, use the up and down controls to set the exact merge order, or remove files you do not want included.",
      },
      {
        question: "How many PDFs can I merge at once?",
        answer:
          "You can merge up to 20 PDF files in one go. Each file can be up to 25 MB, with a combined size limit of 100 MB.",
      },
      {
        question: "Does merging keep text and layout?",
        answer:
          "Yes. Pages are copied as real PDF pages — text, vector graphics, and layout are preserved. This is not a print-to-image merge.",
      },
      {
        question: "Can I merge password-protected PDFs?",
        answer:
          "Not directly. Unlock each file first with Unlock PDF, then upload the unlocked copies to merge.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDFs, and merge immediately.",
      },
    ],
  },
  {
    slug: "split-pdf",
    name: "Split PDF Tool",
    shortName: "Split PDF",
    description:
      "Split a PDF into separate files online — every page, custom ranges, or fixed-size chunks. Free, private, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/split-pdf",
    keywords: [
      "split pdf",
      "pdf splitter",
      "split pdf pages",
      "extract pdf pages",
      "separate pdf pages",
      "split pdf online",
      "free pdf splitter",
      "break pdf into pages",
    ],
    faq: [
      {
        question: "Is this PDF splitter free?",
        answer:
          "Yes. Split and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Splitting runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
      {
        question: "How can I split a PDF?",
        answer:
          "Choose every page for one PDF per page, enter page ranges like 1-3, 5, 8-10, or split into fixed chunks of N pages each.",
      },
      {
        question: "Do I get a ZIP or a single PDF?",
        answer:
          "One output range downloads as a PDF. Multiple outputs download together as a ZIP of PDF files.",
      },
      {
        question: "Does splitting keep text and layout?",
        answer:
          "Yes. Pages are copied as real PDF pages — text, vector graphics, and layout are preserved.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per split.",
      },
      {
        question: "Can I split password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to split.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and split immediately.",
      },
    ],
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF Tool",
    shortName: "Rotate PDF",
    description:
      "Rotate PDF pages online for free — turn pages left, right, or 180° and download. Private, no watermark, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/rotate-pdf",
    keywords: [
      "rotate pdf",
      "rotate pdf pages",
      "rotate pdf online",
      "turn pdf pages",
      "fix sideways pdf",
      "rotate pdf 90 degrees",
      "rotate pdf 180",
      "free rotate pdf",
      "pdf page rotator",
      "change pdf orientation",
    ],
    faq: [
      {
        question: "Is this PDF rotator free?",
        answer:
          "Yes. Rotate pages and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Page rotation runs entirely in your browser with pdf-lib and PDF.js. Your files stay on your device.",
      },
      {
        question: "How do I rotate PDF pages?",
        answer:
          "Upload your PDF, select the pages to rotate (click thumbnails or hold Shift for a range), choose ↺ Left, ↻ Right, or 180°, then Download PDF.",
      },
      {
        question: "Can I rotate multiple pages at once?",
        answer:
          "Yes. Select several pages, use Select all, then apply the same rotation to the whole selection.",
      },
      {
        question: "Does rotating keep text and layout?",
        answer:
          "Yes. Pages keep their real PDF content — rotation updates page orientation metadata so text, vector graphics, and layout are preserved.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per rotate.",
      },
      {
        question: "Can I rotate a password-protected PDF?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to rotate pages.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, rotate pages, and download immediately.",
      },
    ],
  },
  {
    slug: "rearrange-pdf",
    name: "Rearrange PDF Tool",
    shortName: "Rearrange PDF",
    description:
      "Rearrange PDF pages online for free — drag thumbnails into a new order and download. Private, no watermark, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/rearrange-pdf",
    keywords: [
      "rearrange pdf",
      "reorder pdf pages",
      "rearrange pdf pages",
      "change pdf page order",
      "pdf page reorder",
      "move pdf pages",
      "sort pdf pages",
      "reorganize pdf pages",
      "free rearrange pdf",
      "pdf page organizer",
    ],
    faq: [
      {
        question: "Is this PDF rearranger free?",
        answer:
          "Yes. Rearrange pages and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Page rearranging runs entirely in your browser with pdf-lib and PDF.js. Your files stay on your device.",
      },
      {
        question: "How do I rearrange PDF pages?",
        answer:
          "Upload your PDF, drag page thumbnails into the order you want (or select a page and use ↑ / ↓), then choose Download PDF. The new file uses your chosen sequence.",
      },
      {
        question: "Can I undo my page order changes?",
        answer:
          "Yes. Choose Reset order to restore the original page sequence, or upload the file again.",
      },
      {
        question: "Does rearranging keep text and layout?",
        answer:
          "Yes. Pages are copied as real PDF pages in the new order — text, vector graphics, and layout are preserved.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per rearrange.",
      },
      {
        question: "Can I rearrange a password-protected PDF?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to rearrange pages.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, rearrange pages, and download immediately.",
      },
    ],
  },
  {
    slug: "delete-pdf-pages",
    name: "Delete PDF Pages Tool",
    shortName: "Delete PDF Pages",
    description:
      "Delete PDF pages online for free — select pages visually or by range and download a clean file. Private, no watermark, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/delete-pdf-pages",
    keywords: [
      "delete pdf pages",
      "remove pdf pages",
      "pdf page deleter",
      "delete pages from pdf",
      "remove pages from pdf online",
      "pdf page remover",
      "free delete pdf pages",
      "erase pdf pages",
    ],
    faq: [
      {
        question: "Is this PDF page deleter free?",
        answer:
          "Yes. Delete pages and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Page deletion runs entirely in your browser with pdf-lib and PDF.js. Your files stay on your device.",
      },
      {
        question: "How do I delete pages from a PDF?",
        answer:
          "Upload your PDF, click the page thumbnails you want to remove (or enter ranges like 2, 4-6), then choose Delete & download. The new file keeps only the pages you did not select.",
      },
      {
        question: "Can I delete multiple pages at once?",
        answer:
          "Yes. Click pages to toggle them, hold Shift to select a range, use Select all / Invert, or apply page numbers in the range field.",
      },
      {
        question: "Does deleting pages keep text and layout?",
        answer:
          "Yes. Remaining pages are copied as real PDF pages — text, vector graphics, and layout are preserved.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per deletion.",
      },
      {
        question: "Can I delete pages from a password-protected PDF?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to delete pages.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, select pages, and download immediately.",
      },
    ],
  },
  {
    slug: "esign-pdf",
    name: "eSign PDF Tool",
    shortName: "eSign PDF",
    description:
      "Sign a PDF online for free — type a cursive signature, draw your mark, or upload an image, then place it on the page. Private, no account, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/esign-pdf",
    keywords: [
      "esign pdf",
      "sign pdf",
      "sign pdf online",
      "electronic signature pdf",
      "add signature to pdf",
      "draw signature on pdf",
      "typed signature pdf",
      "free pdf signature",
      "pdf esign tool",
      "sign document online",
    ],
    faq: [
      {
        question: "Is this eSign PDF tool free?",
        answer:
          "Yes. Sign and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Signing runs entirely in your browser with pdf-lib. Your PDF and signature stay on your device.",
      },
      {
        question: "Can I type or draw my signature?",
        answer:
          "Yes. Type your name in a script font, draw with your mouse or finger, or upload a PNG/JPG/WebP of your handwritten signature.",
      },
      {
        question: "Is this a legally binding electronic signature?",
        answer:
          "This tool adds a visual signature image to your PDF. Whether that meets legal requirements depends on your jurisdiction and the document — it is not a certificate-based digital signature.",
      },
      {
        question: "Can I choose which pages get signed?",
        answer:
          "Yes. Place the signature on the last page, first page, or every page, and pick a corner or center position.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per sign.",
      },
      {
        question: "Can I sign password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to sign.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, create your signature, and download immediately.",
      },
    ],
  },
  {
    slug: "add-page-numbers-to-pdf",
    name: "Add Page Numbers to PDF Tool",
    shortName: "Add Page Numbers to PDF",
    description:
      "Add page numbers to PDF online — place numbers in the header or footer with format, start number, and font size controls. Free, private, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/add-page-numbers-to-pdf",
    keywords: [
      "add page numbers to pdf",
      "pdf page numbers",
      "number pdf pages",
      "insert page numbers pdf",
      "pdf pagination",
      "page numbers pdf online",
      "add page number to pdf",
      "free pdf page numbering",
      "pdf footer page numbers",
      "page numbering tool",
    ],
    faq: [
      {
        question: "Is this PDF page number tool free?",
        answer:
          "Yes. Number unlimited PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Page numbering runs entirely in your browser with pdf-lib. Your PDF stays on your device.",
      },
      {
        question: "Where can I place the page numbers?",
        answer:
          "Choose bottom or top, then center, left, or right. Adjust font size so numbers fit your layout.",
      },
      {
        question: "What formats are available?",
        answer:
          "Use a plain number, 1 / N, Page 1, or Page 1 of N. You can also set a custom start number.",
      },
      {
        question: "Does numbering keep text selectable?",
        answer:
          "Yes. The original PDF pages stay intact — only the page number text is drawn on top.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per file.",
      },
      {
        question: "Can I number password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to add page numbers.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and download immediately.",
      },
    ],
  },
  {
    slug: "annotate-pdf",
    name: "Annotate PDF Tool",
    shortName: "Annotate PDF",
    description:
      "Annotate PDF online for free — highlight, draw, box, and add text notes on any page. Private, no watermark, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/annotate-pdf",
    keywords: [
      "annotate pdf",
      "pdf annotator",
      "highlight pdf",
      "mark up pdf",
      "draw on pdf",
      "pdf highlighter",
      "add notes to pdf",
      "annotate pdf online",
      "free pdf annotation",
      "write on pdf pages",
    ],
    faq: [
      {
        question: "Is this annotate PDF tool free?",
        answer:
          "Yes. Annotate and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Annotation runs entirely in your browser with PDF.js and pdf-lib. Your files stay on your device.",
      },
      {
        question: "What annotation tools are included?",
        answer:
          "Highlight regions, draw freehand with a pen, outline areas with boxes, and place text notes by clicking on the page.",
      },
      {
        question: "Can I annotate multiple pages?",
        answer:
          "Yes. Switch pages with the thumbnail strip, add marks on each page, then download one annotated PDF.",
      },
      {
        question: "Can I undo or clear marks?",
        answer:
          "Yes. Undo the last mark, clear the current page, or clear every annotation before you export.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per file.",
      },
      {
        question: "Can I annotate password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to annotate.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, mark it up, and download immediately.",
      },
    ],
  },
  {
    slug: "add-text-to-pdf",
    name: "Add Text to PDF Tool",
    shortName: "Add Text to PDF",
    description:
      "Add text to PDF online — place custom text with font, size, color, opacity, position, and page controls. Free, private, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/add-text-to-pdf",
    keywords: [
      "add text to pdf",
      "insert text into pdf",
      "write on pdf",
      "pdf text overlay",
      "stamp text on pdf",
      "add text to pdf online",
      "put text on pdf",
      "free add text pdf",
      "pdf text stamp",
      "annotate pdf with text",
    ],
    faq: [
      {
        question: "Is this add text to PDF tool free?",
        answer:
          "Yes. Add text to unlimited PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Text is drawn entirely in your browser with pdf-lib. Your PDF stays on your device.",
      },
      {
        question: "Where can I place the text?",
        answer:
          "Choose center, header, or footer positions (left, center, or right). You can also rotate text diagonally.",
      },
      {
        question: "Can I choose which pages get the text?",
        answer:
          "Yes. Apply text to every page, only the first page, or only the last page.",
      },
      {
        question: "Which fonts are available?",
        answer:
          "Helvetica, Helvetica Bold, Times, Times Bold, and Courier — standard PDF fonts that work in every viewer.",
      },
      {
        question: "Does adding text keep the original content selectable?",
        answer:
          "Yes. The original PDF pages stay intact — only your new text is drawn on top.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per file.",
      },
      {
        question: "Can I add text to password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to add text.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, type your text, and download immediately.",
      },
    ],
  },
  {
    slug: "add-text-on-image",
    name: "Add Text on Image Tool",
    shortName: "Add Text on Image",
    description:
      "Add text on image online — overlay captions, labels, or stamps with font, size, color, opacity, position, and live preview. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/add-text-on-image",
    keywords: [
      "add text on image",
      "add text to image",
      "text overlay on photo",
      "write on image",
      "caption image online",
      "stamp text on photo",
      "add text to picture",
      "put text on image",
      "free add text image",
      "image text overlay",
      "add caption to photo",
    ],
    faq: [
      {
        question: "Is this add text on image tool free?",
        answer:
          "Yes. Overlay text on unlimited images with no account, subscription, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Text is drawn entirely in your browser. Your photos stay on your device.",
      },
      {
        question: "Where can I place the text?",
        answer:
          "Choose center, header, or footer positions (left, center, or right). You can also rotate text diagonally.",
      },
      {
        question: "Can I preview before downloading?",
        answer:
          "Yes. The preview updates live as you type and change options. Download a full-resolution PNG when you are ready.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a PNG with the text baked in.",
      },
      {
        question: "What does Text outline do?",
        answer:
          "It adds a soft dark stroke around letters so white or light text stays readable on busy backgrounds.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, social, client work, and personal projects.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your image, type your text, and download immediately.",
      },
    ],
  },
  {
    slug: "add-images-to-pdf",
    name: "Add Images to PDF Tool",
    shortName: "Add Images to PDF",
    description:
      "Add images to PDF online — insert PNG, JPG, or WebP photos as new pages at the start, end, or after any page. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/add-images-to-pdf",
    keywords: [
      "add images to pdf",
      "insert images into pdf",
      "add photo to pdf",
      "insert picture into pdf",
      "add png to pdf",
      "add jpg to existing pdf",
      "append images to pdf",
      "insert pages from images",
      "free add images to pdf",
      "pdf insert image online",
    ],
    faq: [
      {
        question: "Is this add images to PDF tool free?",
        answer:
          "Yes. Insert unlimited images into PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs or images uploaded to a server?",
        answer:
          "No. Insertion runs entirely in your browser with pdf-lib. Your PDF and images stay on your device.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "PNG, JPG, and WebP up to 10 MB each (up to 30 images). WebP is converted locally before embedding.",
      },
      {
        question: "Where can I insert the images?",
        answer:
          "Append at the end, place at the start, or insert after a specific page number. Reorder the image list before you save.",
      },
      {
        question: "How is this different from Image to PDF?",
        answer:
          "Image to PDF creates a brand-new PDF from images. Add Images to PDF inserts image pages into an existing PDF while keeping the original pages.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB. Source pages plus new image pages must total 50 pages or fewer.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF and images, and download immediately.",
      },
    ],
  },
  {
    slug: "pdf-watermark",
    name: "PDF Watermark Tool",
    shortName: "PDF Watermark",
    description:
      "Add a watermark to PDF online — stamp a logo or image on every page with position, size, opacity, and rotation. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/pdf-watermark",
    keywords: [
      "pdf watermark",
      "add watermark to pdf",
      "stamp image on pdf",
      "pdf stamp",
      "watermark pdf online",
      "add logo to pdf",
      "overlay image on pdf",
      "free pdf watermark",
      "pdf watermark tool",
      "stamp pdf pages",
    ],
    faq: [
      {
        question: "Is this PDF watermark tool free?",
        answer:
          "Yes. Stamp unlimited PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Watermarking runs entirely in your browser with pdf-lib. Your PDF and stamp image stay on your device.",
      },
      {
        question: "What image formats can I use as a stamp?",
        answer:
          "JPG, PNG, and WebP up to 10 MB. Use PNG when you need a transparent logo or signature.",
      },
      {
        question: "Can I choose where the watermark appears?",
        answer:
          "Yes. Place it in the center or any corner, or tile it across each page. Adjust size, opacity, and diagonal rotation.",
      },
      {
        question: "Does watermarking keep text selectable?",
        answer:
          "Yes. The original PDF pages stay intact — only the stamp image is drawn on top, so text and layout remain.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per watermark.",
      },
      {
        question: "Can I watermark password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to stamp.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF and stamp image, and download immediately.",
      },
    ],
  },
  {
    slug: "crop-pdf",
    name: "Crop PDF Tool",
    shortName: "Crop PDF",
    description:
      "Crop PDF pages online — trim margins in inches, mm, points, or percent with uniform or custom sides. Free, private, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/crop-pdf",
    keywords: [
      "crop pdf",
      "pdf crop",
      "trim pdf margins",
      "crop pdf pages",
      "pdf margin trim",
      "crop pdf online",
      "free pdf cropper",
      "remove pdf margins",
      "trim pdf whitespace",
      "pdf crop tool",
    ],
    faq: [
      {
        question: "Is this PDF crop tool free?",
        answer:
          "Yes. Crop and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Cropping runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
      {
        question: "How does cropping work?",
        answer:
          "You set margins in inches, millimeters, points, or percent. Each page’s media and crop boxes are updated so viewers show only the trimmed area.",
      },
      {
        question: "Will text stay selectable?",
        answer:
          "Yes. Pages are not flattened into images — text, vector graphics, and layout remain intact after cropping.",
      },
      {
        question: "Can I set different margins per side?",
        answer:
          "Yes. Use Custom mode to set top, right, bottom, and left independently, or Uniform for the same trim on every side.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per crop.",
      },
      {
        question: "Can I crop password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to crop.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, set margins, and crop immediately.",
      },
    ],
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF Tool",
    shortName: "Compress PDF",
    description:
      "Compress PDF files online to reduce size — choose Extreme, Strong, Balanced, or Light compression and download instantly. Free, private, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/compress-pdf",
    keywords: [
      "compress pdf",
      "pdf compressor",
      "reduce pdf size",
      "shrink pdf",
      "optimize pdf",
      "compress pdf online",
      "free pdf compressor",
      "make pdf smaller",
    ],
    faq: [
      {
        question: "Is this PDF compressor free?",
        answer:
          "Yes. Compress and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Compression runs entirely in your browser with PDF.js and pdf-lib. Your files stay on your device.",
      },
      {
        question: "How does compression work?",
        answer:
          "Each page is rendered and re-encoded as a compact JPEG, then rebuilt into a smaller PDF. Stronger levels use lower resolution and quality for more savings.",
      },
      {
        question: "Will text stay selectable?",
        answer:
          "Compression flattens pages into images, so text is no longer selectable or searchable. Visual layout is preserved for sharing, email, and uploads.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per compression.",
      },
      {
        question: "Can I compress password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to compress.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and compress immediately.",
      },
    ],
  },
  {
    slug: "unlock-pdf",
    name: "Unlock PDF Tool",
    shortName: "Unlock PDF",
    description:
      "Unlock password-protected PDFs online — remove the open password and download an unprotected copy. Free, private, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/unlock-pdf",
    keywords: [
      "unlock pdf",
      "remove pdf password",
      "pdf password remover",
      "decrypt pdf",
      "unlock pdf online",
      "remove password from pdf",
      "unprotect pdf",
      "free pdf unlocker",
      "open password protected pdf",
      "pdf unlock tool",
    ],
    faq: [
      {
        question: "Is this PDF unlocker free?",
        answer:
          "Yes. Unlock and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs or passwords uploaded to a server?",
        answer:
          "No. Unlocking runs entirely in your browser. Your file and password stay on your device.",
      },
      {
        question: "Do I need to know the password?",
        answer:
          "Yes. Enter the password used to open the PDF. This tool does not crack or recover forgotten passwords.",
      },
      {
        question: "Will text and layout stay the same?",
        answer:
          "Yes. Pages are decrypted and copied as real PDF pages — selectable text, vector graphics, and layout are preserved.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per unlock.",
      },
      {
        question: "What if the PDF is not password-protected?",
        answer:
          "The tool will tell you no unlock is needed. Upload only encrypted PDFs when you want to remove protection.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, enter the password, and download immediately.",
      },
    ],
  },
  {
    slug: "protect-pdf",
    name: "Protect PDF Tool",
    shortName: "Protect PDF",
    description:
      "Password protect PDFs online — add an open password and download an encrypted copy. Free, private, and local in your browser.",
    categories: ["pdf"],
    status: "ready",
    href: "/protect-pdf",
    keywords: [
      "protect pdf",
      "password protect pdf",
      "encrypt pdf",
      "add password to pdf",
      "pdf password protector",
      "lock pdf",
      "secure pdf online",
      "free pdf protector",
      "pdf encryption tool",
      "password protect pdf online",
    ],
    faq: [
      {
        question: "Is this PDF protector free?",
        answer:
          "Yes. Protect and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs or passwords uploaded to a server?",
        answer:
          "No. Encryption runs entirely in your browser. Your file and password stay on your device.",
      },
      {
        question: "What kind of password is added?",
        answer:
          "An open password. Recipients must enter it before they can view the PDF. Store it safely — Focera cannot recover forgotten passwords.",
      },
      {
        question: "Will text and layout stay the same?",
        answer:
          "Yes. Pages are encrypted as real PDF pages — selectable text, vector graphics, and layout are preserved.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per protect.",
      },
      {
        question: "What if the PDF is already password-protected?",
        answer:
          "Unlock it first with Unlock PDF, then upload the unlocked copy to set a new password.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, set a password, and download immediately.",
      },
    ],
  },
  {
    slug: "utm-builder",
    name: "UTM Builder",
    shortName: "UTM Builder",
    description:
      "Build campaign URLs with utm_source, utm_medium, and utm_campaign — copy clean tracking links instantly in your browser.",
    categories: ["file"],
    status: "ready",
    href: "/utm-builder",
    keywords: [
      "utm builder",
      "utm generator",
      "campaign url builder",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "google analytics utm",
      "tracking link builder",
    ],
    faq: [
      {
        question: "Which UTM parameters are supported?",
        answer:
          "utm_source, utm_medium, and utm_campaign. Enter a base URL and optional values; empty fields are omitted from the final link.",
      },
      {
        question: "Is this UTM builder free?",
        answer:
          "Yes. Build and copy unlimited campaign URLs with no account, subscription, or daily limit.",
      },
      {
        question: "Does my URL leave the browser?",
        answer:
          "No. Links are assembled locally in your browser. Nothing is uploaded to Focera for processing.",
      },
      {
        question: "Can I use the result with Google Analytics?",
        answer:
          "Yes. Standard UTM parameters are recognized by GA4 and many other analytics platforms when someone clicks your link.",
      },
      {
        question: "What if my base URL is invalid?",
        answer:
          "Enter a full URL including https://. If the URL cannot be parsed, the builder will not produce a result until it is fixed.",
      },
    ],
  },
  {
    slug: "profit-calculator",
    name: "Profit Calculator",
    shortName: "Profit Calc",
    description:
      "Calculate profit and margin from revenue and cost instantly — free, private, and local in your browser.",
    categories: ["file"],
    status: "ready",
    href: "/profit-calculator",
    keywords: [
      "profit calculator",
      "margin calculator",
      "revenue minus cost",
      "profit margin",
      "gross profit calculator",
      "free profit calculator",
    ],
    faq: [
      {
        question: "How is profit calculated?",
        answer: "Profit = revenue − cost. Enter both values to see the result immediately.",
      },
      {
        question: "How is margin calculated?",
        answer:
          "Margin = (revenue − cost) ÷ revenue × 100. If revenue is zero, margin is shown as zero to avoid division errors.",
      },
      {
        question: "Is this profit calculator free?",
        answer:
          "Yes. Calculate unlimited scenarios with no account, subscription, or daily limit.",
      },
      {
        question: "Are my numbers uploaded?",
        answer:
          "No. All math runs locally in your browser. Values you enter are not sent to Focera servers.",
      },
      {
        question: "Can I use this for pricing decisions?",
        answer:
          "Yes as a quick check. For accounting, taxes, or formal reports, verify figures with your bookkeeping tools or advisor.",
      },
    ],
  },
  {
    slug: "background-remover",
    name: "AI Background Remover",
    shortName: "BG Remover",
    description: "Remove image backgrounds instantly for free.",
    categories: ["image", "ai"],
    status: "ready",
    href: "/background-remover",
    keywords: [
      "background remover",
      "remove background",
      "ai background remover",
      "transparent png",
      "remove bg online",
      "free background eraser",
    ],
    faq: [
      {
        question: "Is this background remover really free?",
        answer:
          "Yes. You can upload, process, preview, and download transparent PNGs without paying or creating an account.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Background removal runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a transparent PNG.",
      },
      {
        question: "Why does the first removal take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later runs are significantly faster.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After processing, drag the slider on the preview to compare the original image with the cutout.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, e-commerce, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "change-background",
    name: "Change Background of Image",
    shortName: "Change BG",
    description:
      "Replace any photo background with a solid color, custom image, or portrait blur — free AI cutout in your browser.",
    categories: ["image", "ai"],
    status: "ready",
    href: "/change-background",
    keywords: [
      "change background of image",
      "change image background",
      "replace background",
      "change photo background",
      "ai change background",
      "background changer online",
      "swap background",
      "new background for photo",
      "free background changer",
    ],
    faq: [
      {
        question: "Is this background changer free?",
        answer:
          "Yes. Upload a photo, pick a new background, preview the result, and download a PNG with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. AI cutout and compositing run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What background options can I use?",
        answer:
          "Choose a solid color, upload a custom background image, or apply a portrait-style blur to the original scene.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB for both the subject photo and an optional background image. Exports are PNG.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later background changes are significantly faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in e-commerce, marketing, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "blur-background",
    name: "Blur Background",
    shortName: "Blur BG",
    description:
      "Blur photo backgrounds online for free — keep your subject sharp with AI portrait-style depth blur in your browser.",
    categories: ["image", "ai"],
    status: "ready",
    href: "/blur-background",
    keywords: [
      "blur background",
      "blur photo background",
      "background blur online",
      "portrait blur",
      "blur image background",
      "ai background blur",
      "bokeh background",
      "soft background blur",
      "free background blur",
    ],
    faq: [
      {
        question: "Is this background blur tool free?",
        answer:
          "Yes. Upload a photo, apply portrait-style background blur, preview the result, and download a PNG with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. AI cutout and blur compositing run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I control how strong the blur is?",
        answer:
          "Yes. After processing, use the blur intensity slider to fine-tune softness from a light haze to a strong portrait bokeh look.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Exports are PNG.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later blurs are significantly faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in headshots, marketing, social posts, and personal projects.",
      },
    ],
  },
  {
    slug: "make-background-transparent",
    name: "Make Background Transparent",
    shortName: "Transparent BG",
    description:
      "Make any photo background transparent online for free — AI cutout to a clean PNG with alpha in your browser.",
    categories: ["image", "ai"],
    status: "ready",
    href: "/make-background-transparent",
    keywords: [
      "make background transparent",
      "transparent background",
      "make image background transparent",
      "transparent png online",
      "clear background from photo",
      "alpha transparent image",
      "make photo background transparent",
      "free transparent background",
    ],
    faq: [
      {
        question: "Is this transparent background tool free?",
        answer:
          "Yes. Upload a photo, make the background transparent, preview the cutout, and download a PNG with no account or payment.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. AI cutout runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What file do I get after processing?",
        answer:
          "A PNG or WebP with alpha transparency — ready for e-commerce, design tools, slides, and social graphics.",
      },
      {
        question: "Can I crop the cutout, add a shadow, or a sticker outline?",
        answer:
          "Yes. After the background is cleared, crop to the subject, add padding, apply a drop shadow, or wrap the cutout in a white, black, or custom outline, then download PNG or WebP.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Download a transparent PNG or WebP.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once and is cached by your browser. Later transparent cutouts are significantly faster.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Transparent PNGs you download are yours to use in marketing, e-commerce, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "ai-image-generator",
    name: "AI Image Generator",
    shortName: "AI Images",
    description:
      "Generate AI images from text prompts online — pick a style and size, preview instantly, and download a PNG. Free, no account required.",
    categories: ["ai", "image"],
    status: "ready",
    href: "/ai-image-generator",
    keywords: [
      "ai image generator",
      "free ai image generator",
      "text to image",
      "ai art generator",
      "generate image from text",
      "ai picture generator",
      "prompt to image",
      "free text to image",
      "ai image maker",
    ],
    faq: [
      {
        question: "Is this AI image generator free?",
        answer:
          "Yes. Write a prompt, generate images, and download PNGs with no account, subscription, or credit card.",
      },
      {
        question: "How does text-to-image generation work?",
        answer:
          "You describe the scene in plain language. The tool sends your prompt to an AI image model, which returns a new image you can preview and download.",
      },
      {
        question: "Are my prompts stored by Focera?",
        answer:
          "Focera does not keep a gallery of your prompts or images. Your prompt is sent to the generation provider to create the image, then the result is shown in your browser for download.",
      },
      {
        question: "Which sizes and styles are available?",
        answer:
          "Choose square, landscape, or portrait sizes, plus styles such as photorealistic, illustration, digital art, anime, and more. You can also leave the style on Auto.",
      },
      {
        question: "Can I download the generated image?",
        answer:
          "Yes. After generation, download a PNG to use in mockups, social posts, presentations, and creative projects.",
      },
      {
        question: "Why did generation fail or take long?",
        answer:
          "The free model can be busy or rate-limited. Wait a few seconds and try again, or shorten the prompt and regenerate with a new seed.",
      },
      {
        question: "Do I need an account or API key?",
        answer:
          "No. Open the page, enter a prompt, and generate. Nothing to install and no signup required.",
      },
    ],
  },
  {
    slug: "cleanup-picture",
    name: "Cleanup Picture — Clean Up Photos Online",
    shortName: "Cleanup Picture",
    description:
      "Cleanup pictures online — brush over clutter, people, stamps, or distractions and restore the photo. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/cleanup-picture",
    keywords: [
      "cleanup picture",
      "clean up photo",
      "photo cleanup",
      "clean up picture online",
      "picture cleanup tool",
      "clean photo online",
      "erase from photo",
      "photo cleanup online",
      "free picture cleanup",
      "clean up image",
    ],
    faq: [
      {
        question: "Is this picture cleanup tool free?",
        answer:
          "Yes. Upload a photo, mark the area, restore it, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Picture cleanup runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How do I cleanup a picture?",
        answer:
          "Upload your photo, paint over the clutter, person, stamp, or distraction with the brush, then click Cleanup picture. The tool fills the marked area using nearby pixels.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a cleaned PNG.",
      },
      {
        question: "What can I clean from a picture?",
        answer:
          "Brush over people, poles, trash, text, stamps, cables, or other distractions. Smaller, solid regions usually restore more cleanly than very large or complex areas.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After processing, drag the preview slider to compare the original photo with the cleaned result.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use. Only edit photos you own or have permission to change.",
      },
    ],
  },
  {
    slug: "remove-objects",
    name: "Remove Objects from Photo",
    shortName: "Remove Objects",
    description:
      "Remove objects from photos online — brush over people, clutter, or distractions and restore the background. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/remove-objects",
    keywords: [
      "remove objects from photo",
      "object remover",
      "remove object from image",
      "erase object from photo",
      "magic erase photo",
      "photo object remover",
      "remove distraction from photo",
      "free object remover",
      "remove objects online",
    ],
    faq: [
      {
        question: "Is this object remover free?",
        answer:
          "Yes. Upload a photo, mark the object, restore the area, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Object removal runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How do I remove an object from a photo?",
        answer:
          "Upload your photo, paint over the person or object with the brush, then click Remove objects. The tool fills the marked area using nearby pixels.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a cleaned PNG.",
      },
      {
        question: "What kinds of objects can I remove?",
        answer:
          "Brush over people, poles, trash, text, cables, or other distractions. Smaller, solid regions usually restore more cleanly than very large or complex areas.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After processing, drag the preview slider to compare the original photo with the cleaned result.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use. Only edit photos you own or have permission to change.",
      },
    ],
  },
  {
    slug: "remove-person",
    name: "Remove Person from Photo",
    shortName: "Remove Person",
    description:
      "Remove a person from a photo online — brush over people or photobombers and restore the background. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/remove-person",
    keywords: [
      "remove person from photo",
      "remove people from photo",
      "erase person from image",
      "photobomber remover",
      "remove someone from photo",
      "delete person from photo",
      "remove stranger from photo",
      "free person remover",
      "remove person online",
      "erase people from picture",
    ],
    faq: [
      {
        question: "Is this person remover free?",
        answer:
          "Yes. Upload a photo, mark the person, restore the area, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Person removal runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How do I remove a person from a photo?",
        answer:
          "Upload your photo, paint over the person with the brush, then click Remove person. The tool fills the marked area using nearby pixels.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a cleaned PNG.",
      },
      {
        question: "Can I remove more than one person?",
        answer:
          "Yes. Paint over each person you want gone before clicking Remove person, or edit the mask and run again. Smaller, solid regions usually restore more cleanly than very large or complex areas.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After processing, drag the preview slider to compare the original photo with the cleaned result.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use. Only edit photos you own or have permission to change.",
      },
    ],
  },
  {
    slug: "remove-watermark",
    name: "Remove Watermark from Photo",
    shortName: "Remove Watermark",
    description:
      "Remove watermarks from photos online — brush over logos or text and restore the image. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/remove-watermark",
    keywords: [
      "remove watermark",
      "watermark remover",
      "remove watermark from photo",
      "remove logo from image",
      "erase watermark",
      "photo watermark remover",
      "remove text from image",
      "free watermark remover",
      "remove watermark online",
      "clean watermark from photo",
    ],
    faq: [
      {
        question: "Is this watermark remover free?",
        answer:
          "Yes. Upload a photo, mark the watermark, restore the area, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Watermark removal runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How do I remove a watermark?",
        answer:
          "Upload your photo, paint over the watermark or logo with the brush, then click Remove watermark. The tool fills the marked area using nearby pixels.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a cleaned PNG.",
      },
      {
        question: "Does it work on text and logo watermarks?",
        answer:
          "Yes. Brush carefully over text overlays, stamps, or logos. Smaller, solid watermarks usually restore more cleanly than very large areas.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After processing, drag the preview slider to compare the original photo with the cleaned result.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use. Only remove watermarks from images you own or have permission to edit.",
      },
    ],
  },
  {
    slug: "upscale-image",
    name: "Upscale Image — Increase Resolution",
    shortName: "Upscale Image",
    description:
      "Increase image resolution online — upscale 2×, 3×, or 4× with detail enhancement. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/upscale-image",
    keywords: [
      "upscale image",
      "increase image resolution",
      "image upscaler",
      "enlarge image",
      "upscale photo",
      "increase photo resolution",
      "make image larger",
      "free image upscaler",
      "upscale image online",
      "4x image upscaler",
    ],
    faq: [
      {
        question: "Is this image upscaler free?",
        answer:
          "Yes. Upload, upscale, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Upscaling runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which scale factors are available?",
        answer:
          "Choose 2×, 3×, or 4×. Output is capped at 8192 pixels on the longest side for browser stability.",
      },
      {
        question: "What does Enhance details do?",
        answer:
          "After enlarging, a light sharpening pass restores edge clarity so the result looks crisper than plain resizing.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a high-resolution PNG.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After upscaling, drag the preview slider to compare the original with the enlarged image.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, print, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "unblur-image",
    name: "Unblur Image — Sharpen Blurry Photos",
    shortName: "Unblur Image",
    description:
      "Unblur images online — sharpen soft or blurry photos with light, medium, or strong clarity recovery. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/unblur-image",
    keywords: [
      "unblur image",
      "unblur photo",
      "sharpen image",
      "deblur image",
      "fix blurry photo",
      "make image sharper",
      "unblur picture online",
      "free image unblur",
      "sharpen blurry photo",
      "reduce image blur",
    ],
    faq: [
      {
        question: "Is this image unblur tool free?",
        answer:
          "Yes. Upload, unblur, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Unblurring runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which strength should I choose?",
        answer:
          "Start with Medium for most soft photos. Use Light for mild haze, or Strong when blur is heavier. Compare with the before/after slider and retry if needed.",
      },
      {
        question: "Will this recover extreme motion blur?",
        answer:
          "It restores edge clarity for soft focus and mild blur. Severe motion trails or heavily out-of-focus shots may only improve partially — try Strong, or pair with Upscale Image for larger exports.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a sharpened PNG at the original resolution.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After unblurring, drag the preview slider to compare the original with the sharpened image.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, print, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "resize-image",
    name: "Resize Image Dimensions",
    shortName: "Resize Image",
    description:
      "Resize image dimensions online — set exact width and height in pixels, lock aspect ratio, or use quick scale presets. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/resize-image",
    keywords: [
      "resize image",
      "resize image dimensions",
      "change image size",
      "change image dimensions",
      "image resizer",
      "resize photo",
      "scale image",
      "set image width height",
      "resize image online",
      "free image resizer",
      "resize jpg",
      "resize png",
    ],
    faq: [
      {
        question: "Is this image resizer free?",
        answer:
          "Yes. Upload, set dimensions, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Resizing runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I set exact pixel dimensions?",
        answer:
          "Yes. Enter any width and height in pixels up to 8192 on each side. Use Lock aspect ratio to keep proportions, or unlock to stretch freely.",
      },
      {
        question: "What do the quick scale presets do?",
        answer:
          "25%, 50%, 75%, 150%, and 200% set both dimensions relative to the original size while preserving aspect ratio.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a PNG at the new dimensions.",
      },
      {
        question: "How is this different from Upscale Image?",
        answer:
          "Resize Image sets exact width and height (or a percentage). Upscale Image enlarges by 2×–4× with optional detail enhancement for sharper enlargements.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "crop-image",
    name: "Crop Image Online",
    shortName: "Crop Image",
    description:
      "Crop an image online — drag to reframe, lock aspect ratios like 1:1 or 16:9, then download a PNG. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/crop-image",
    keywords: [
      "crop image",
      "crop photo",
      "image cropper",
      "crop picture online",
      "trim image",
      "crop jpg",
      "crop png",
      "aspect ratio crop",
      "free image cropper",
      "crop photo online",
      "cut image",
      "photo crop tool",
    ],
    faq: [
      {
        question: "Is this image cropper free?",
        answer:
          "Yes. Upload, crop, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Cropping runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I lock an aspect ratio?",
        answer:
          "Yes. Choose Free for any shape, or lock 1:1, 4:3, 3:2, 16:9, or 9:16 while you drag the handles.",
      },
      {
        question: "How do I adjust the crop area?",
        answer:
          "Drag inside the selection to move it. Use the corner and edge handles to resize. The live pixel size updates as you adjust.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a PNG at the cropped dimensions.",
      },
      {
        question: "How is this different from Profile Photo Maker?",
        answer:
          "Crop Image is a general rectangular cropper with freeform and common ratios. Profile Photo Maker focuses on square or circle avatars sized for social platforms.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "flip-image",
    name: "Flip Image Online",
    shortName: "Flip Image",
    description:
      "Flip an image online — mirror horizontally, vertically, or both, then download a PNG. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/flip-image",
    keywords: [
      "flip image",
      "flip photo",
      "mirror image",
      "flip picture online",
      "mirror photo",
      "flip jpg",
      "flip png",
      "horizontal flip",
      "vertical flip",
      "free image flipper",
      "reverse image",
      "mirror image online",
    ],
    faq: [
      {
        question: "Is this image flipper free?",
        answer:
          "Yes. Upload, flip, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Flipping runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What is the difference between horizontal and vertical flip?",
        answer:
          "Horizontal flip mirrors left and right (like a selfie camera). Vertical flip mirrors top and bottom. Both applies both axes at once.",
      },
      {
        question: "Does flipping change the image size?",
        answer:
          "No. The exported PNG keeps the original width and height. Only the pixel order is reversed along the axes you choose.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a PNG of the flipped image.",
      },
      {
        question: "How is this different from Crop Image?",
        answer:
          "Flip Image mirrors the whole photo. Crop Image reframes a rectangular area. Use both when you want to mirror first, then trim.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "image-splitter",
    name: "Image Splitter — Cut Photo Into Pieces",
    shortName: "Image Splitter",
    description:
      "Split an image into a grid of pieces online — 2×2, 3×3, custom rows and columns, then download PNGs or a ZIP. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/image-splitter",
    keywords: [
      "image splitter",
      "split image",
      "cut image into pieces",
      "split photo",
      "image grid cutter",
      "slice image",
      "cut photo into tiles",
      "split picture online",
      "divide image",
      "photo splitter",
      "cut image into squares",
      "free image splitter",
    ],
    faq: [
      {
        question: "Is this image splitter free?",
        answer:
          "Yes. Upload, choose a grid, preview pieces, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Splitting runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What grids can I use?",
        answer:
          "Presets include 2×2, 3×3, 4×4, 1×2, 2×1, and 1×3. Or set custom rows and columns from 1–10 (more than one piece).",
      },
      {
        question: "How do I download the pieces?",
        answer:
          "After splitting, download the selected piece as a PNG, or download all pieces in one ZIP. Files are named by row and column.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Each piece exports as a PNG at the sliced pixel size.",
      },
      {
        question: "How is this different from Crop Image?",
        answer:
          "Crop Image keeps one reframed area. Image Splitter cuts the whole photo into a grid of separate files.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "combine-photo",
    name: "Combine Photos — Photo Collage Maker",
    shortName: "Combine Photos",
    description:
      "Combine photos online into one collage — side by side, stacked, or grid. Reorder images, add gaps, and download a PNG. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/combine-photo",
    keywords: [
      "combine photos",
      "combine photo",
      "photo collage maker",
      "merge photos",
      "join photos",
      "side by side photos",
      "photo grid maker",
      "stitch photos together",
      "combine images online",
      "free photo combiner",
      "collage photos online",
      "put photos together",
    ],
    faq: [
      {
        question: "Is this photo combiner free?",
        answer:
          "Yes. Upload, arrange, combine, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Combining runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How many photos can I combine?",
        answer:
          "You can combine 2 to 9 JPG, PNG, or WebP photos in one collage. Each file can be up to 10 MB.",
      },
      {
        question: "What layouts are available?",
        answer:
          "Side by side (one row), stacked (one column), or grid (auto columns for three or more photos). Reorder the list to control left-to-right and top-to-bottom placement.",
      },
      {
        question: "Can I add space between photos?",
        answer:
          "Yes. Choose None, Small, or Medium gap, and pick a white, black, or transparent background for the spacing and letterboxing.",
      },
      {
        question: "What is Fill vs Fit?",
        answer:
          "Fill crops each photo to cover its cell. Fit shows the full photo inside the cell and fills leftover space with the background color.",
      },
      {
        question: "Which format do I download?",
        answer:
          "The tool exports a PNG collage. Use Image Compressor afterward if you need a smaller file for email or social uploads.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects — subject to rights in your original photos.",
      },
    ],
  },
  {
    slug: "photo-collage",
    name: "Photo Collage — Template Collage Maker Online",
    shortName: "Photo Collage",
    description:
      "Make a photo collage online with template layouts — hero, magazine, grid, and more. Pick square, landscape, portrait, or story ratios and download a PNG. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/photo-collage",
    keywords: [
      "photo collage",
      "photo collage maker",
      "collage maker online",
      "make a collage",
      "picture collage",
      "photo collage templates",
      "instagram collage maker",
      "free collage maker",
      "create photo collage",
      "collage photos online",
      "photo montage maker",
      "template collage",
    ],
    faq: [
      {
        question: "Is this photo collage maker free?",
        answer:
          "Yes. Upload, pick a template, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Collages are built entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How many photos can I use?",
        answer:
          "You can use 2 to 6 JPG, PNG, or WebP photos per collage. Each file can be up to 10 MB.",
      },
      {
        question: "How is this different from Combine Photos?",
        answer:
          "Combine Photos uses uniform side-by-side, stacked, or grid cells. Photo Collage offers template layouts with mixed cell sizes (hero, magazine, and more) plus canvas ratios for feed and story formats.",
      },
      {
        question: "What canvas ratios are available?",
        answer:
          "Square (1:1), landscape (16:9), portrait (3:4), and story (9:16). Templates scale to the ratio you pick.",
      },
      {
        question: "Can I add space between photos?",
        answer:
          "Yes. Choose None, Small, or Medium gap, and pick a white, black, or transparent background for spacing and letterboxing.",
      },
      {
        question: "Which format do I download?",
        answer:
          "The tool exports a PNG collage. Use Image Compressor afterward if you need a smaller file for email or social uploads.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects — subject to rights in your original photos.",
      },
    ],
  },
  {
    slug: "add-images-to-image",
    name: "Add Images to Image — Overlay Photos Online",
    shortName: "Add Images to Image",
    description:
      "Add images to an image online — overlay logos, stamps, or stickers with position, size, opacity, and live preview. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/add-images-to-image",
    keywords: [
      "add images to image",
      "overlay images",
      "add image on image",
      "put logo on photo",
      "stamp image on photo",
      "layer images online",
      "image watermark photo",
      "add sticker to photo",
      "overlay png on image",
      "add logo to picture",
      "composite images online",
      "free image overlay tool",
    ],
    faq: [
      {
        question: "Is this add images to image tool free?",
        answer:
          "Yes. Overlay unlimited images with no account, subscription, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Compositing runs entirely in your browser. Your photos stay on your device.",
      },
      {
        question: "How many overlays can I add?",
        answer:
          "You can place up to five overlay images on one base photo. Each overlay has its own position, size, opacity, and rotation.",
      },
      {
        question: "How is this different from Combine Photos?",
        answer:
          "Combine Photos builds a side-by-side, stacked, or grid collage. Add Images to Image layers overlays on top of a single base photo.",
      },
      {
        question: "Can I preview before downloading?",
        answer:
          "Yes. The preview updates live as you move, resize, or fade overlays. Download a full-resolution PNG when you are ready.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB each. The tool exports a PNG with overlays baked in. Transparent PNGs keep their alpha.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, social, client work, and personal projects — subject to rights in your original files.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your base and overlay images, and download immediately.",
      },
    ],
  },
  {
    slug: "add-border-to-image",
    name: "Add Border to Image — Frame Your Photo Online",
    shortName: "Add Border to Image",
    description:
      "Add a border to your image online — choose width and color, preview before and after, then download a PNG. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/add-border-to-image",
    keywords: [
      "add border to image",
      "add border to photo",
      "photo border",
      "frame image online",
      "image border tool",
      "add frame to picture",
      "white border on photo",
      "polaroid border",
      "picture frame online",
      "add edge to image",
      "photo mat border",
      "free image border tool",
    ],
    faq: [
      {
        question: "Is this add border to image tool free?",
        answer:
          "Yes. Upload, choose a border, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Adding a border runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What border widths and colors can I use?",
        answer:
          "Widths include Thin, Medium, Thick, and Extra (scaled to your image). Colors include White, Black, Gray, Cream, Navy, and Forest.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a PNG with the border baked in.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After adding a border, drag the preview slider to compare the original with the framed photo.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your photo, and download immediately.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, social, client work, and personal projects — subject to rights in your original image.",
      },
    ],
  },
  {
    slug: "profile-photo-maker",
    name: "Profile Photo Maker — Create Profile Photo from Image",
    shortName: "Profile Photo Maker",
    description:
      "Create a profile photo from an image — crop to square or circle, match LinkedIn, Instagram, and Discord sizes, then download a PNG. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/profile-photo-maker",
    keywords: [
      "profile photo maker",
      "create profile photo",
      "profile photo from image",
      "make profile picture",
      "avatar maker",
      "circle crop photo",
      "square profile picture",
      "linkedin profile photo",
      "instagram profile picture",
      "crop profile photo online",
      "free profile photo maker",
      "round profile picture",
    ],
    faq: [
      {
        question: "Is this profile photo maker free?",
        answer:
          "Yes. Upload, crop, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Cropping and export run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I make a circular profile photo?",
        answer:
          "Yes. Choose Circle to export a round PNG with a transparent background outside the circle — ideal for sites that show round avatars.",
      },
      {
        question: "Which platform sizes are included?",
        answer:
          "Presets cover common LinkedIn, Instagram, X/Twitter, Facebook, and Discord sizes, plus HD and retina options. You can also enter any custom square size from 32 to 2048 px.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a PNG profile photo.",
      },
      {
        question: "How do I reframe the crop?",
        answer:
          "Drag the preview to pan and use the zoom slider to tighten the frame around a face or subject before you create the photo.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects — subject to rights in your original photo.",
      },
    ],
  },
  {
    slug: "round-image",
    name: "Round Image — Make Image Circular Online",
    shortName: "Round Image",
    description:
      "Make an image round online — crop to a circle with a transparent edge, choose the diameter, then download a PNG. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/round-image",
    keywords: [
      "round image",
      "make image round",
      "circular image",
      "circle crop image",
      "round photo",
      "make photo circular",
      "round png",
      "circle crop online",
      "round image maker",
      "circular photo crop",
      "free round image tool",
      "crop image to circle",
    ],
    faq: [
      {
        question: "Is this round image tool free?",
        answer:
          "Yes. Upload, frame the circle, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Circle cropping runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Does the round image have a transparent background?",
        answer:
          "Yes. Outside the circle is transparent, so the PNG drops cleanly onto any background or UI frame.",
      },
      {
        question: "Can I choose the output size?",
        answer:
          "Yes. Use presets from 128 to 2048 px, or enter any custom diameter between 32 and 2048 px.",
      },
      {
        question: "How do I reframe the circle?",
        answer:
          "Drag the preview to pan and use the zoom slider to tighten the frame around a face or subject before you export.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a circular PNG.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects — subject to rights in your original image.",
      },
    ],
  },
  {
    slug: "black-and-white-photo",
    name: "Black and White Photo — Convert Photo to Grayscale",
    shortName: "B&W Photo",
    description:
      "Convert a photo to black and white online — Classic, Soft, or High contrast grayscale in your browser. Free, private, and no account required.",
    categories: ["image"],
    status: "ready",
    href: "/black-and-white-photo",
    keywords: [
      "black and white photo",
      "photo black and white",
      "convert photo to black and white",
      "grayscale photo",
      "make photo black and white",
      "desaturate photo",
      "black and white filter",
      "monochrome photo",
      "bw photo converter",
      "free black and white photo tool",
      "grayscale image online",
    ],
    faq: [
      {
        question: "Is this black and white photo tool free?",
        answer:
          "Yes. Upload, convert, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Black and white conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What do Classic, Soft, and High contrast mean?",
        answer:
          "Classic is true grayscale. Soft eases contrast for gentler tones. High contrast deepens blacks and brightens whites for a bolder look.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a black and white PNG.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After converting, drag the preview slider to compare the original with the black and white photo.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your photo, and convert immediately.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects — subject to rights in your original image.",
      },
    ],
  },
  {
    slug: "pixelate-image",
    name: "Pixelate Image — Mosaic & Pixel Effect Online",
    shortName: "Pixelate Image",
    description:
      "Pixelate an image online — Light, Medium, or Heavy mosaic blocks in your browser. Free, private, and no account required.",
    categories: ["image"],
    status: "ready",
    href: "/pixelate-image",
    keywords: [
      "pixelate image",
      "pixelate photo",
      "pixelate picture",
      "mosaic image",
      "pixel effect",
      "pixelate online",
      "blur face pixelate",
      "pixel art filter",
      "blocky image",
      "free pixelate tool",
      "pixelate jpg",
      "pixelate png",
    ],
    faq: [
      {
        question: "Is this pixelate image tool free?",
        answer:
          "Yes. Upload, pixelate, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Pixelation runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What do Light, Medium, and Heavy mean?",
        answer:
          "Light uses smaller blocks for a subtle mosaic. Medium is the classic pixel look. Heavy uses larger blocks for a stronger, more abstract effect.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a pixelated PNG.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After pixelating, drag the preview slider to compare the original with the pixelated image.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your image, and pixelate immediately.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use in marketing, web, client work, and personal projects — subject to rights in your original image.",
      },
    ],
  },
  {
    slug: "colorize-photo",
    name: "Colorize Photo — Color Your Photo",
    shortName: "Colorize Photo",
    description:
      "Colorize black and white photos online with AI — add natural color to old pictures in your browser. Free, private, and no account required.",
    categories: ["image", "ai"],
    status: "ready",
    href: "/colorize-photo",
    keywords: [
      "colorize photo",
      "colorize black and white photo",
      "color your photo",
      "photo colorizer",
      "colourise photo",
      "add color to black and white photo",
      "ai photo colorizer",
      "colorize old photos",
      "restore old photos color",
      "free photo colorizer",
      "colorize image online",
    ],
    faq: [
      {
        question: "Is this photo colorizer free?",
        answer:
          "Yes. Upload, colorize, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. AI colorization runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which photos work best?",
        answer:
          "Black & white, grayscale, and sepia photos colorize most cleanly. Color photos are converted to grayscale first, then recolored.",
      },
      {
        question: "What do Subtle, Natural, and Vivid mean?",
        answer:
          "They control color strength. Subtle keeps a soft tint, Natural aims for balanced everyday color, and Vivid boosts saturation for richer results.",
      },
      {
        question: "Why does the first run take longer?",
        answer:
          "The AI model downloads once (about 60 MB) and is cached by your browser. Later colorizations are significantly faster.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. The tool exports a colorized PNG.",
      },
      {
        question: "Can I compare before and after?",
        answer:
          "Yes. After colorizing, drag the preview slider to compare the original with the colorized photo.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. PNGs you download are yours to use. Only colorize photos you own or have permission to edit.",
      },
    ],
  },
  {
    slug: "image-to-text",
    name: "Image to Text — OCR Converter",
    shortName: "Image to Text",
    description:
      "Extract text from images online with OCR — convert photos, screenshots, and scans to editable text. Free, private, and local in your browser.",
    categories: ["image", "ai"],
    status: "ready",
    href: "/image-to-text",
    keywords: [
      "image to text",
      "ocr online",
      "extract text from image",
      "photo to text",
      "image to text converter",
      "screenshot to text",
      "scan to text",
      "free ocr",
      "picture to text",
      "ocr converter",
    ],
    faq: [
      {
        question: "Is this image to text converter free?",
        answer:
          "Yes. Upload an image, extract text, copy, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. OCR runs entirely in your browser with Tesseract. Your files stay on your device.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "Choose English, Spanish, French, German, Portuguese, Simplified Chinese, or Japanese before extracting text.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Clear, high-contrast text usually recognizes best.",
      },
      {
        question: "Can I edit the extracted text?",
        answer:
          "Yes. After OCR finishes, edit the result in the text panel, then copy it or download a .txt file.",
      },
      {
        question: "Does handwriting work?",
        answer:
          "Printed or typed text works best. Neat, high-contrast handwriting may work, but results vary.",
      },
      {
        question: "Can I use the text commercially?",
        answer:
          "Yes. Text you extract is yours to use. Only process images you own or have permission to convert.",
      },
    ],
  },
  {
    slug: "view-metadata-for-your-image",
    name: "View Metadata For Your Image — EXIF Viewer",
    shortName: "View Image Metadata",
    description:
      "View image metadata online — read EXIF, camera settings, dates, and GPS from JPG, PNG, or WebP. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/view-metadata-for-your-image",
    keywords: [
      "view image metadata",
      "exif viewer",
      "photo metadata viewer",
      "view metadata for your image",
      "image exif data",
      "read photo metadata",
      "gps from photo",
      "camera settings from image",
      "exif viewer online",
      "free image metadata viewer",
      "jpg exif",
      "view photo properties",
    ],
    faq: [
      {
        question: "Is this image metadata viewer free?",
        answer:
          "Yes. Upload a photo, read its tags, copy JSON, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Metadata is parsed entirely in your browser. Your files stay on your device.",
      },
      {
        question: "What metadata can I see?",
        answer:
          "File name, size, type, and pixel dimensions always appear. When the file includes EXIF, IPTC, or XMP, you also see camera make and model, lens, shutter, aperture, ISO, dates, and GPS coordinates.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. JPEG photos from cameras and phones usually contain the richest EXIF.",
      },
      {
        question: "Why does my image show almost no tags?",
        answer:
          "Many apps strip metadata when they export or compress. Screenshots and some PNGs have little or no EXIF. The tool still shows file size and dimensions.",
      },
      {
        question: "Is GPS shown to anyone else?",
        answer:
          "No. Coordinates stay in your browser. Opening the map link loads OpenStreetMap in a new tab from your device only.",
      },
      {
        question: "Can I export the metadata?",
        answer:
          "Yes. Copy JSON to the clipboard or download a .json file for your records.",
      },
    ],
  },
  {
    slug: "translate-your-image",
    name: "Translate Your Image — Image Text Translator",
    shortName: "Translate Your Image",
    description:
      "Translate text in images online — OCR photos and screenshots, then translate into 15+ languages. Free, private OCR in your browser.",
    categories: ["image", "ai"],
    status: "ready",
    href: "/translate-your-image",
    keywords: [
      "translate your image",
      "translate image text",
      "image translator",
      "translate photo text",
      "ocr translate",
      "translate screenshot",
      "image to translated text",
      "translate text from image",
      "photo translator online",
      "free image translator",
    ],
    faq: [
      {
        question: "Is this image translator free?",
        answer:
          "Yes. Upload an image, translate the text, copy, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. OCR runs entirely in your browser. Only the extracted text is sent to the translation service — not the original image.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "OCR supports English, Spanish, French, German, Portuguese, Simplified Chinese, and Japanese. You can translate into English, Spanish, French, German, Portuguese, Italian, Dutch, Polish, Russian, Chinese, Japanese, Korean, Arabic, Turkish, and Hindi.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Clear, high-contrast text usually recognizes and translates best.",
      },
      {
        question: "Can I edit the translation?",
        answer:
          "Yes. After translation finishes, edit the result in the text panel, then copy it or download a .txt file.",
      },
      {
        question: "Does handwriting work?",
        answer:
          "Printed or typed text works best. Neat, high-contrast handwriting may work for OCR, but results vary.",
      },
      {
        question: "Can I use the translation commercially?",
        answer:
          "Yes. Text you extract and translate is yours to use. Only process images you own or have permission to convert.",
      },
    ],
  },
  {
    slug: "image-compressor",
    name: "Compress Image Size",
    shortName: "Image Compressor",
    description:
      "Compress image file size online — shrink JPG, PNG, and WebP with Extreme, Strong, Balanced, or Light presets. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/image-compressor",
    keywords: [
      "compress image",
      "image compressor",
      "compress image size",
      "reduce image size",
      "shrink image",
      "optimize image",
      "compress jpg",
      "compress png",
      "compress webp",
      "free image compressor",
      "compress photo online",
    ],
    faq: [
      {
        question: "Is this image compressor free?",
        answer:
          "Yes. Upload, compress, preview, and download with no account, subscription, or credit card.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Compression runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "How does compression work?",
        answer:
          "Your image is optionally resized to a max dimension for the chosen level, then re-encoded as JPEG or WebP at a lower quality. Stronger levels use lower quality and smaller dimensions for more savings.",
      },
      {
        question: "Which formats are supported?",
        answer:
          "Upload JPG, PNG, or WebP files up to 10 MB. Output can be Auto, JPEG, or WebP.",
      },
      {
        question: "Will quality look the same?",
        answer:
          "Light keeps more detail; Extreme saves the most space. Use the before/after slider to judge quality, then try another level if needed.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your image, and compress immediately.",
      },
      {
        question: "Can I use the results commercially?",
        answer:
          "Yes. Compressed files you download are yours to use in marketing, web, client work, and personal projects.",
      },
    ],
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    shortName: "Converter",
    description: "Convert images between PNG, JPG, WebP, and more.",
    categories: ["image"],
    status: "soon",
    href: "/image-converter",
    keywords: ["convert", "png", "jpg", "webp"],
    faq: [
      {
        question: "Which formats will be supported?",
        answer: "PNG, JPG, and WebP are planned for the first release.",
      },
    ],
  },
  {
    slug: "heic-to-jpg",
    name: "HEIC to JPG Converter",
    shortName: "HEIC to JPG",
    description:
      "Convert HEIC to JPG online — turn iPhone .heic and .heif photos into standard JPEG files. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/heic-to-jpg",
    keywords: [
      "heic to jpg",
      "heic to jpeg",
      "convert heic to jpg",
      "heic to jpg converter",
      "heif to jpg",
      "iphone heic to jpg",
      "heic converter",
      "free heic to jpg",
      "heic to jpg online",
      "convert heif to jpeg",
    ],
    faq: [
      {
        question: "Is this HEIC to JPG converter free?",
        answer:
          "Yes. Convert and download unlimited HEIC-to-JPG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Decoding and conversion run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which formats are supported?",
        answer:
          ".heic and .heif (including image/heic and image/heif). Live Photo containers may only export the still image frame.",
      },
      {
        question: "Can I convert multiple HEIC files at once?",
        answer:
          "Yes. Add up to 20 HEIC photos. One file downloads as a .jpg; multiple files download together as a ZIP.",
      },
      {
        question: "What quality options are available?",
        answer:
          "Choose Smaller, Balanced, or High JPEG quality to trade file size for detail before downloading.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each HEIC can be up to 20 MB, with a combined limit of 100 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your HEIC photos, and convert immediately.",
      },
    ],
  },
  {
    slug: "heic-to-png",
    name: "HEIC to PNG Converter",
    shortName: "HEIC to PNG",
    description:
      "Convert HEIC to PNG online — turn iPhone .heic and .heif photos into lossless PNG files. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/heic-to-png",
    keywords: [
      "heic to png",
      "convert heic to png",
      "heic to png converter",
      "heif to png",
      "iphone heic to png",
      "heic converter",
      "free heic to png",
      "heic to png online",
      "convert heif to png",
      "heic png",
    ],
    faq: [
      {
        question: "Is this HEIC to PNG converter free?",
        answer:
          "Yes. Convert and download unlimited HEIC-to-PNG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. Decoding and conversion run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which formats are supported?",
        answer:
          ".heic and .heif (including image/heic and image/heif). Live Photo containers may only export the still image frame.",
      },
      {
        question: "Can I convert multiple HEIC files at once?",
        answer:
          "Yes. Add up to 20 HEIC photos. One file downloads as a .png; multiple files download together as a ZIP.",
      },
      {
        question: "Why PNG instead of JPG?",
        answer:
          "PNG is lossless, so it keeps sharp detail without JPEG compression artifacts. Choose HEIC to JPG when you need smaller files for sharing.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each HEIC can be up to 20 MB, with a combined limit of 100 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your HEIC photos, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word Converter",
    shortName: "PDF to Word",
    description:
      "Convert PDF to Word (.docx) online — extract editable text or embed exact page images. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/pdf-to-word",
    keywords: [
      "pdf to word",
      "pdf to docx",
      "convert pdf to word",
      "pdf to word converter",
      "pdf to microsoft word",
      "pdf to editable word",
      "free pdf to word",
      "pdf to word online",
    ],
    faq: [
      {
        question: "Is this PDF to Word converter free?",
        answer:
          "Yes. Convert and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "What is the difference between Editable text and Exact pages?",
        answer:
          "Editable text extracts selectable text into a Word document you can edit. Exact pages embeds each PDF page as an image so the layout matches visually, but text inside images is not editable.",
      },
      {
        question: "Will formatting match the original PDF?",
        answer:
          "Editable text rebuilds paragraphs and may not preserve complex columns, tables, or precise positioning. Exact pages keeps a visual match by embedding page images.",
      },
      {
        question: "What file do I download?",
        answer:
          "You get a .docx file compatible with Microsoft Word, Google Docs, LibreOffice, and most modern word processors.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Can I convert password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to convert.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-excel",
    name: "PDF to Excel Converter",
    shortName: "PDF to Excel",
    description:
      "Convert PDF to Excel (.xlsx) online — extract tables and text into a spreadsheet. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/pdf-to-excel",
    keywords: [
      "pdf to excel",
      "pdf to xlsx",
      "convert pdf to excel",
      "pdf to excel converter",
      "pdf to spreadsheet",
      "pdf table to excel",
      "free pdf to excel",
      "pdf to excel online",
      "extract table from pdf",
    ],
    faq: [
      {
        question: "Is this PDF to Excel converter free?",
        answer:
          "Yes. Convert and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "What is the difference between Detect tables and One column?",
        answer:
          "Detect tables splits lines into spreadsheet columns using horizontal gaps — best for invoices and reports. One column puts each text line into a single cell, which is better for prose-heavy PDFs.",
      },
      {
        question: "Will tables match the original PDF exactly?",
        answer:
          "Column detection works well on clear tabular layouts, but complex multi-level tables, merged cells, and scanned pages may need cleanup in Excel afterward.",
      },
      {
        question: "What file do I download?",
        answer:
          "You get a .xlsx workbook compatible with Microsoft Excel, Google Sheets, Numbers, and LibreOffice Calc.",
      },
      {
        question: "Does this work on scanned PDFs?",
        answer:
          "This tool reads selectable text already in the PDF. Image-only scans usually need OCR first — try PDF to JPG plus Image to Text, then paste into Excel.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Can I convert password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to convert.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-csv",
    name: "PDF to CSV Converter",
    shortName: "PDF to CSV",
    description:
      "Convert PDF to CSV online — extract tables from PDF into comma-separated files. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/pdf-to-csv",
    keywords: [
      "pdf to csv",
      "convert pdf to csv",
      "pdf to csv converter",
      "extract table from pdf",
      "pdf table to csv",
      "pdf tables to csv",
      "free pdf to csv",
      "pdf to csv online",
      "pdf data to csv",
    ],
    faq: [
      {
        question: "Is this PDF to CSV converter free?",
        answer:
          "Yes. Convert and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "What is the difference between Detect tables and One column?",
        answer:
          "Detect tables splits lines into CSV columns using horizontal gaps — best for invoices and reports. One column puts each text line into a single field, which is better for prose-heavy PDFs.",
      },
      {
        question: "Will tables match the original PDF exactly?",
        answer:
          "Column detection works well on clear tabular layouts, but complex multi-level tables, merged cells, and scanned pages may need cleanup afterward.",
      },
      {
        question: "What file do I download?",
        answer:
          "By default you get a single .csv file. Choose CSV per page to download a ZIP containing one CSV for each PDF page.",
      },
      {
        question: "Does this work on scanned PDFs?",
        answer:
          "This tool reads selectable text already in the PDF. Image-only scans usually need OCR first — try PDF to JPG plus Image to Text, then save as CSV.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Can I convert password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to convert.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-powerpoint",
    name: "PDF to PowerPoint Converter",
    shortName: "PDF to PowerPoint",
    description:
      "Convert PDF to PowerPoint (.pptx) online — extract editable text or embed exact page images as slides. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/pdf-to-powerpoint",
    keywords: [
      "pdf to powerpoint",
      "pdf to pptx",
      "pdf to ppt",
      "convert pdf to powerpoint",
      "pdf to powerpoint converter",
      "pdf to slides",
      "pdf to presentation",
      "free pdf to powerpoint",
      "pdf to powerpoint online",
    ],
    faq: [
      {
        question: "Is this PDF to PowerPoint converter free?",
        answer:
          "Yes. Convert and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "What is the difference between Editable text and Exact pages?",
        answer:
          "Editable text extracts selectable text onto slides you can edit. Exact pages embeds each PDF page as an image so the layout matches visually, but text inside images is not editable.",
      },
      {
        question: "Will formatting match the original PDF?",
        answer:
          "Editable text rebuilds paragraphs on widescreen slides and may not preserve complex columns, tables, or precise positioning. Exact pages keeps a visual match by embedding page images.",
      },
      {
        question: "What file do I download?",
        answer:
          "You get a .pptx file compatible with Microsoft PowerPoint, Google Slides, LibreOffice Impress, and most modern presentation apps.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Can I convert password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to convert.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF Converter",
    shortName: "PowerPoint to PDF",
    description:
      "Convert PowerPoint to PDF online — turn .pptx slides into landscape PDFs. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/powerpoint-to-pdf",
    keywords: [
      "powerpoint to pdf",
      "pptx to pdf",
      "ppt to pdf",
      "convert powerpoint to pdf",
      "powerpoint to pdf converter",
      "slides to pdf",
      "presentation to pdf",
      "free powerpoint to pdf",
      "powerpoint to pdf online",
      "convert pptx to pdf",
    ],
    faq: [
      {
        question: "Is this PowerPoint to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited PowerPoint files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PowerPoint files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your presentations stay on your device.",
      },
      {
        question: "Which PowerPoint formats are supported?",
        answer:
          "Upload .pptx files (modern PowerPoint format). Legacy .ppt files are not supported — open them in PowerPoint or LibreOffice and save as .pptx first.",
      },
      {
        question: "Will formatting match the original slides?",
        answer:
          "Text, basic shape fills, and common images are preserved when possible. Charts as images, SmartArt, animations, videos, and some theme fonts may look different after conversion.",
      },
      {
        question: "Can I choose widescreen, A4, or Letter?",
        answer:
          "Yes. Pick widescreen (16:9), A4 landscape, or US Letter landscape before converting. Each slide becomes one PDF page.",
      },
      {
        question: "Is there a file size or slide limit?",
        answer:
          "Yes. Upload PowerPoint files up to 25 MB with a maximum of 50 slides per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your .pptx, and convert immediately.",
      },
    ],
  },
  {
    slug: "url-to-pdf",
    name: "URL to PDF Converter",
    shortName: "URL to PDF",
    description:
      "Convert any webpage URL to PDF online — capture the full page length with backgrounds, preview, and download. Free and no account required.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/url-to-pdf",
    keywords: [
      "url to pdf",
      "webpage to pdf",
      "website to pdf",
      "convert url to pdf",
      "save webpage as pdf",
      "html to pdf online",
      "web page to pdf",
      "print url to pdf",
      "full page pdf",
      "free url to pdf",
      "convert website to pdf",
    ],
    faq: [
      {
        question: "Is this URL to PDF converter free?",
        answer:
          "Yes. Convert public webpages to PDF with no account, subscription, watermark, or daily limit beyond fair-use rate limits.",
      },
      {
        question: "Does it capture the full length of the page?",
        answer:
          "Yes. The converter loads the URL, scrolls the full page so lazy-loaded content appears, then exports a PDF of the entire document — not just the first screen.",
      },
      {
        question: "What layout options are available?",
        answer:
          "Choose Full page for one tall continuous PDF, or A4 / US Letter for a classic multipage print layout with backgrounds.",
      },
      {
        question: "Which URLs work?",
        answer:
          "Public HTTPS pages that load without a login. Sites that block bots, require sign-in, or sit on private networks cannot be converted.",
      },
      {
        question: "Are my URLs stored?",
        answer:
          "The URL is sent to Focera only to render the PDF. Generated files are not kept as a permanent archive after the response is returned.",
      },
      {
        question: "How long does conversion take?",
        answer:
          "Most pages finish within about a minute. Heavy, image-rich, or slow sites may take longer or time out.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the tool in a modern browser, paste a URL, and download the PDF.",
      },
    ],
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF Converter",
    shortName: "Word to PDF",
    description:
      "Convert Word to PDF online — turn .docx documents into A4 or Letter PDFs. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/word-to-pdf",
    keywords: [
      "word to pdf",
      "docx to pdf",
      "convert word to pdf",
      "word to pdf converter",
      "microsoft word to pdf",
      "doc to pdf",
      "free word to pdf",
      "word to pdf online",
      "convert docx to pdf",
    ],
    faq: [
      {
        question: "Is this Word to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited Word files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my Word files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your documents stay on your device.",
      },
      {
        question: "Which Word formats are supported?",
        answer:
          "Upload .docx files (modern Word format). Legacy .doc files are not supported — open them in Word or LibreOffice and save as .docx first.",
      },
      {
        question: "Will formatting match the original Word document?",
        answer:
          "Headings, paragraphs, lists, tables, links, and images are preserved when possible. Complex layouts, text boxes, columns, and some custom styles may look different after conversion.",
      },
      {
        question: "Can I choose A4 or Letter?",
        answer:
          "Yes. Pick A4 or US Letter before converting so the PDF matches your printer or regional standard.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Upload Word files up to 25 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your .docx, and convert immediately.",
      },
    ],
  },
  {
    slug: "outlook-to-pdf",
    name: "Outlook to PDF Converter",
    shortName: "Outlook to PDF",
    description:
      "Convert Outlook to PDF online — turn .msg and .eml emails into A4 or Letter PDFs. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/outlook-to-pdf",
    keywords: [
      "outlook to pdf",
      "msg to pdf",
      "eml to pdf",
      "convert outlook to pdf",
      "outlook email to pdf",
      "msg converter",
      "microsoft outlook to pdf",
      "email to pdf",
      "free outlook to pdf",
      "outlook to pdf online",
      "convert msg to pdf",
    ],
    faq: [
      {
        question: "Is this Outlook to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited Outlook emails with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my Outlook emails uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your .msg and .eml files stay on your device.",
      },
      {
        question: "Which Outlook formats are supported?",
        answer:
          "Upload Outlook Message (.msg) files and standard email (.eml) files exported from Microsoft Outlook or other mail clients.",
      },
      {
        question: "What appears in the PDF?",
        answer:
          "From, To, Cc, Date, Subject, the email body (HTML or plain text), and a list of attachment names when present. Inline CID images are included when readable.",
      },
      {
        question: "Can I choose A4 or Letter?",
        answer:
          "Yes. Pick A4 or US Letter before converting so the PDF matches your printer or regional standard.",
      },
      {
        question: "Is there a file size limit?",
        answer: "Yes. Upload Outlook email files up to 25 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your .msg or .eml, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-epub",
    name: "PDF to EPUB Converter",
    shortName: "PDF to EPUB",
    description:
      "Convert PDF to EPUB online — extract reflowable text or embed exact page images into an .epub ebook. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/pdf-to-epub",
    keywords: [
      "pdf to epub",
      "convert pdf to epub",
      "pdf to epub converter",
      "pdf to ebook",
      "pdf to kindle",
      "free pdf to epub",
      "pdf to epub online",
      "make epub from pdf",
      "pdf ebook converter",
    ],
    faq: [
      {
        question: "Is this PDF to EPUB converter free?",
        answer:
          "Yes. Convert and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "What is the difference between Reflowable text and Exact pages?",
        answer:
          "Reflowable text extracts selectable text into EPUB chapters you can resize and restyle on e-readers. Exact pages embeds each PDF page as an image so the layout matches visually, but text inside images is not selectable.",
      },
      {
        question: "Which apps open the EPUB file?",
        answer:
          "You get a standard EPUB 3 file compatible with Apple Books, Calibre, Google Play Books, Kindle apps (after transfer), and most modern e-readers.",
      },
      {
        question: "Will formatting match the original PDF?",
        answer:
          "Reflowable text rebuilds paragraphs and may not preserve complex columns, tables, or precise positioning. Exact pages keeps a visual match by embedding page images.",
      },
      {
        question: "Does this work on scanned PDFs?",
        answer:
          "Use Exact pages for image-only scans. Reflowable text needs selectable text already in the PDF — for OCR, try PDF to JPG plus Image to Text first.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Can I convert password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to convert.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-mobi",
    name: "PDF to MOBI Converter",
    shortName: "PDF to MOBI",
    description:
      "Convert PDF to MOBI online — extract reflowable text or embed exact page images into a Kindle .mobi ebook. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/pdf-to-mobi",
    keywords: [
      "pdf to mobi",
      "convert pdf to mobi",
      "pdf to mobi converter",
      "pdf to kindle",
      "pdf to azw",
      "make mobi from pdf",
      "free pdf to mobi",
      "pdf to mobi online",
      "pdf kindle converter",
      "pdf ebook converter",
    ],
    faq: [
      {
        question: "Is this PDF to MOBI converter free?",
        answer:
          "Yes. Convert and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "What is the difference between Reflowable text and Exact pages?",
        answer:
          "Reflowable text extracts selectable text into MOBI chapters you can resize and restyle on Kindle. Exact pages embeds each PDF page as an image so the layout matches visually, but text inside images is not selectable.",
      },
      {
        question: "Which apps open the MOBI file?",
        answer:
          "You get a classic Mobipocket .mobi file compatible with Kindle devices (via sideload), Kindle apps, Calibre, and many e-readers that still accept MOBI.",
      },
      {
        question: "Will formatting match the original PDF?",
        answer:
          "Reflowable text rebuilds paragraphs and may not preserve complex columns, tables, or precise positioning. Exact pages keeps a visual match by embedding page images.",
      },
      {
        question: "Does this work on scanned PDFs?",
        answer:
          "Use Exact pages for image-only scans. Reflowable text needs selectable text already in the PDF — for OCR, try PDF to JPG plus Image to Text first.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Can I convert password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to convert.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-azw3",
    name: "PDF to AZW3 Converter",
    shortName: "PDF to AZW3",
    description:
      "Convert PDF to AZW3 online — extract reflowable text or embed exact page images into a Kindle KF8 .azw3 ebook. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/pdf-to-azw3",
    keywords: [
      "pdf to azw3",
      "convert pdf to azw3",
      "pdf to azw3 converter",
      "pdf to kindle",
      "pdf to kf8",
      "make azw3 from pdf",
      "free pdf to azw3",
      "pdf to azw3 online",
      "pdf kindle converter",
      "pdf ebook converter",
    ],
    faq: [
      {
        question: "Is this PDF to AZW3 converter free?",
        answer:
          "Yes. Convert and download unlimited PDFs with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "What is the difference between Reflowable text and Exact pages?",
        answer:
          "Reflowable text extracts selectable text into AZW3 chapters you can resize and restyle on Kindle. Exact pages embeds each PDF page as an image so the layout matches visually, but text inside images is not selectable.",
      },
      {
        question: "Which apps open the AZW3 file?",
        answer:
          "You get a Kindle Format 8 (.azw3) file compatible with modern Kindle devices (via sideload), Kindle apps, and Calibre.",
      },
      {
        question: "Will formatting match the original PDF?",
        answer:
          "Reflowable text rebuilds paragraphs and may not preserve complex columns, tables, or precise positioning. Exact pages keeps a visual match by embedding page images.",
      },
      {
        question: "Does this work on scanned PDFs?",
        answer:
          "Use Exact pages for image-only scans. Reflowable text needs selectable text already in the PDF — for OCR, try PDF to JPG plus Image to Text first.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Can I convert password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to convert.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "epub-to-pdf",
    name: "EPUB to PDF Converter",
    shortName: "EPUB to PDF",
    description:
      "Convert EPUB to PDF online — turn ebook .epub files into A4 or Letter PDFs. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/epub-to-pdf",
    keywords: [
      "epub to pdf",
      "convert epub to pdf",
      "epub to pdf converter",
      "ebook to pdf",
      "epub converter",
      "free epub to pdf",
      "epub to pdf online",
      "turn epub into pdf",
      "convert ebook to pdf",
    ],
    faq: [
      {
        question: "Is this EPUB to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited EPUB files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my EPUB files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your ebooks stay on your device.",
      },
      {
        question: "Which EPUB files are supported?",
        answer:
          "Upload DRM-free .epub files up to 25 MB. Reflowable books with standard XHTML chapters work best. DRM-protected store books cannot be opened in the browser.",
      },
      {
        question: "Will formatting match the original ebook?",
        answer:
          "Chapters, headings, paragraphs, lists, links, and images are preserved when possible. Complex CSS, custom fonts, fixed-layout pages, and interactive features may look different after conversion.",
      },
      {
        question: "Can I choose A4 or Letter?",
        answer:
          "Yes. Pick A4 or US Letter before converting so the PDF matches your printer or regional standard.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Upload EPUB files up to 25 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your .epub, and convert immediately.",
      },
    ],
  },
  {
    slug: "mobi-to-pdf",
    name: "MOBI to PDF Converter",
    shortName: "MOBI to PDF",
    description:
      "Convert MOBI to PDF online — turn Kindle .mobi and .azw3 ebooks into A4 or Letter PDFs. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/mobi-to-pdf",
    keywords: [
      "mobi to pdf",
      "convert mobi to pdf",
      "mobi to pdf converter",
      "kindle to pdf",
      "azw to pdf",
      "free mobi to pdf",
      "mobi to pdf online",
      "convert kindle to pdf",
      "ebook to pdf",
    ],
    faq: [
      {
        question: "Is this MOBI to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited MOBI and Kindle ebook files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my MOBI files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your ebooks stay on your device.",
      },
      {
        question: "Which Kindle files are supported?",
        answer:
          "Upload DRM-free .mobi, .azw, .azw3, or .prc files up to 25 MB. Reflowable books work best. DRM-protected store books cannot be opened in the browser.",
      },
      {
        question: "Will formatting match the original ebook?",
        answer:
          "Chapters, headings, paragraphs, lists, links, and images are preserved when possible. Complex CSS, custom fonts, fixed-layout pages, and interactive features may look different after conversion.",
      },
      {
        question: "Can I choose A4 or Letter?",
        answer:
          "Yes. Pick A4 or US Letter before converting so the PDF matches your printer or regional standard.",
      },
      {
        question: "Is there a file size limit?",
        answer: "Yes. Upload ebook files up to 25 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your .mobi or .azw3, and convert immediately.",
      },
    ],
  },
  {
    slug: "azw3-to-pdf",
    name: "AZW3 to PDF Converter",
    shortName: "AZW3 to PDF",
    description:
      "Convert AZW3 to PDF online — turn Kindle KF8 .azw3 ebooks into A4 or Letter PDFs. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/azw3-to-pdf",
    keywords: [
      "azw3 to pdf",
      "convert azw3 to pdf",
      "azw3 to pdf converter",
      "kindle azw3 to pdf",
      "kf8 to pdf",
      "free azw3 to pdf",
      "azw3 to pdf online",
      "convert kindle azw3 to pdf",
      "ebook to pdf",
    ],
    faq: [
      {
        question: "Is this AZW3 to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited AZW3 files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my AZW3 files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your ebooks stay on your device.",
      },
      {
        question: "Which AZW3 files are supported?",
        answer:
          "Upload DRM-free .azw3 (KF8) files up to 25 MB. Reflowable books work best. DRM-protected Kindle store books cannot be opened in the browser.",
      },
      {
        question: "Will formatting match the original ebook?",
        answer:
          "Chapters, headings, paragraphs, lists, links, and images are preserved when possible. Complex CSS, custom fonts, fixed-layout pages, and interactive features may look different after conversion.",
      },
      {
        question: "Can I choose A4 or Letter?",
        answer:
          "Yes. Pick A4 or US Letter before converting so the PDF matches your printer or regional standard.",
      },
      {
        question: "Is there a file size limit?",
        answer: "Yes. Upload AZW3 files up to 25 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your .azw3, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-text",
    name: "Extract Text from PDF",
    shortName: "PDF to Text",
    description:
      "Extract text from PDF online — pull selectable text into plain text you can copy or download as .txt. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/pdf-to-text",
    keywords: [
      "extract text from pdf",
      "pdf to text",
      "pdf text extractor",
      "pdf to txt",
      "copy text from pdf",
      "pdf text extraction",
      "convert pdf to text",
      "free pdf to text",
      "pdf to plain text",
      "pull text from pdf",
    ],
    faq: [
      {
        question: "Is this PDF text extractor free?",
        answer:
          "Yes. Extract, copy, and download text from unlimited PDFs with no account, subscription, or watermark.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Text extraction runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "Does this work on scanned PDFs?",
        answer:
          "This tool reads selectable text already in the PDF. Scanned image-only pages usually need OCR — try Image to Text after converting pages with PDF to JPG.",
      },
      {
        question: "Can I edit the extracted text?",
        answer:
          "Yes. After extraction finishes, edit the result in the text panel, then copy it or download a .txt file.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per extraction.",
      },
      {
        question: "Can I extract text from password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to extract text.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and extract immediately.",
      },
    ],
  },
  {
    slug: "pdf-translator",
    name: "PDF Translator",
    shortName: "PDF Translator",
    description:
      "Translate PDF text online — extract selectable text, translate into 15+ languages, then copy or download as .txt or PDF. Free, no account required.",
    categories: ["pdf", "ai"],
    status: "ready",
    href: "/pdf-translator",
    keywords: [
      "pdf translator",
      "translate pdf",
      "pdf translation",
      "translate pdf online",
      "pdf translator free",
      "translate pdf to english",
      "pdf language translator",
      "translate pdf document",
      "multilingual pdf translator",
      "pdf to translated text",
    ],
    faq: [
      {
        question: "Is this PDF translator free?",
        answer:
          "Yes. Translate PDF text and download results with no account, subscription, or watermark.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "The PDF itself stays in your browser while text is extracted locally. Only the extracted text is sent to the translation service — not the original file.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "You can translate between English, Spanish, French, German, Portuguese, Italian, Dutch, Polish, Russian, Chinese, Japanese, Korean, Arabic, Turkish, and Hindi. Source language can also be auto-detected.",
      },
      {
        question: "Does this work on scanned PDFs?",
        answer:
          "This tool reads selectable text already in the PDF. Scanned image-only pages usually need OCR first — try PDF to JPG, then Image to Text.",
      },
      {
        question: "Can I download the translation as a PDF?",
        answer:
          "Yes. After translation finishes, download a .txt file or a simple text PDF. Complex scripts may display more reliably as .txt depending on font support.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages. Very long extracts are limited to about 12,000 characters per translation for reliable results.",
      },
      {
        question: "Can I translate password-protected PDFs?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to translate.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, choose languages, and translate immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG Converter",
    shortName: "PDF to JPG",
    description:
      "Convert PDF pages to JPG images online — preview each page, download singly or as a ZIP. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/pdf-to-jpg",
    keywords: [
      "pdf to jpg",
      "pdf to jpeg",
      "convert pdf to jpg",
      "pdf to jpg converter",
      "pdf to image",
      "pdf page to jpg",
      "free pdf to jpg",
      "pdf to jpg online",
    ],
    faq: [
      {
        question: "Is this PDF to JPG converter free?",
        answer:
          "Yes. Convert, preview, and download unlimited PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "Can I download all pages at once?",
        answer:
          "Yes. After conversion, download the current page as a JPG or use Download all (ZIP) to get every page in one archive.",
      },
      {
        question: "What quality and resolution options are available?",
        answer:
          "Choose Smaller, Balanced, or High JPEG quality, and 1×, 1.5×, or 2× render scale for sharper page images.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "Why do JPG pages have a white background?",
        answer:
          "JPEG does not support transparency. Transparent PDF areas are filled with white so pages look correct in viewers and editors.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "extract-images-from-pdf",
    name: "Extract Images from PDF Tool",
    shortName: "Extract Images from PDF",
    description:
      "Extract images from a PDF online — download embedded photos and graphics as PNG, singly or as a ZIP. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/extract-images-from-pdf",
    keywords: [
      "extract images from pdf",
      "download images from pdf",
      "pdf extract images",
      "pull images from pdf",
      "save images from pdf",
      "pdf image extractor",
      "export images from pdf",
      "free extract images from pdf",
      "pdf to images download",
      "extract pictures from pdf",
    ],
    faq: [
      {
        question: "Is this PDF image extractor free?",
        answer:
          "Yes. Extract, preview, and download unlimited images with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Extraction runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "What is the difference between Extract Images and PDF to PNG?",
        answer:
          "Extract Images pulls the embedded image objects stored inside the PDF. PDF to PNG rasterizes each full page into a screenshot-style image — useful when there are no separate embedded pictures.",
      },
      {
        question: "Can I download all images at once?",
        answer:
          "Yes. After extraction, download the current image as a PNG or use Download all (ZIP) to get every image in one archive.",
      },
      {
        question: "What format are downloaded images?",
        answer:
          "Images are saved as PNG so you keep a lossless preview suitable for reuse and editing.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per extraction. Up to 200 unique images are returned per file.",
      },
      {
        question: "Why were no images found?",
        answer:
          "Some PDFs only contain vector drawings or text, or images may be flattened into page content. Try PDF to PNG if you need full-page images instead.",
      },
      {
        question: "Can I extract images from a password-protected PDF?",
        answer:
          "Not directly. Unlock the file first with Unlock PDF, then upload the unlocked copy to extract images.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and extract immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-png",
    name: "PDF to PNG Converter",
    shortName: "PDF to PNG",
    description:
      "Convert PDF pages to PNG images online — preview each page, download singly or as a ZIP. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/pdf-to-png",
    keywords: [
      "pdf to png",
      "convert pdf to png",
      "pdf to png converter",
      "pdf to image",
      "pdf page to png",
      "free pdf to png",
      "pdf to png online",
      "pdf pages to png",
    ],
    faq: [
      {
        question: "Is this PDF to PNG converter free?",
        answer:
          "Yes. Convert, preview, and download unlimited PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js. Your files stay on your device.",
      },
      {
        question: "Can I download all pages at once?",
        answer:
          "Yes. After conversion, download the current page as a PNG or use Download all (ZIP) to get every page in one archive.",
      },
      {
        question: "What resolution options are available?",
        answer:
          "Choose 1×, 1.5×, or 2× render scale for sharper page images. PNG is lossless, so there is no separate quality slider.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "PDF to PNG or PDF to JPG — which should I use?",
        answer:
          "Use PNG for sharper, lossless page images (great for text and graphics). Use JPG when you want smaller files for sharing or web posts.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "pdf-to-tiff",
    name: "PDF to TIFF Converter",
    shortName: "PDF to TIFF",
    description:
      "Convert PDF pages to TIFF images online — preview each page, download singly, as a multipage TIFF, or as a ZIP. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/pdf-to-tiff",
    keywords: [
      "pdf to tiff",
      "pdf to tif",
      "convert pdf to tiff",
      "pdf to tiff converter",
      "pdf to multipage tiff",
      "pdf to image",
      "pdf page to tiff",
      "free pdf to tiff",
      "pdf to tiff online",
      "pdf pages to tiff",
    ],
    faq: [
      {
        question: "Is this PDF to TIFF converter free?",
        answer:
          "Yes. Convert, preview, and download unlimited PDFs with no account, subscription, or daily limit.",
      },
      {
        question: "Are my PDFs uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with PDF.js and UTIF. Your files stay on your device.",
      },
      {
        question: "Can I download a multipage TIFF?",
        answer:
          "Yes. After conversion, download the current page, use Download multipage TIFF for one multi-page .tiff file, or Download all (ZIP) for one TIFF per page.",
      },
      {
        question: "What resolution options are available?",
        answer:
          "Choose 1×, 1.5×, or 2× render scale for sharper page images. TIFF output is uncompressed RGBA.",
      },
      {
        question: "Is there a file size or page limit?",
        answer:
          "Yes. Upload PDFs up to 25 MB with a maximum of 50 pages per conversion.",
      },
      {
        question: "PDF to TIFF or PDF to PNG — which should I use?",
        answer:
          "Use TIFF for scanning, archival, and systems that expect .tif/.tiff (including multipage files). Use PNG for web, design tools, and everyday sharing.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PDF, and convert immediately.",
      },
    ],
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF Converter",
    shortName: "Image to PDF",
    description:
      "Convert images to PDF online — upload PNG, JPG, WebP, or GIF and download a multi-page PDF with Fit, A4, or Letter. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/image-to-pdf",
    keywords: [
      "image to pdf",
      "convert image to pdf",
      "images to pdf",
      "jpg to pdf",
      "jpeg to pdf",
      "photo to pdf",
      "pictures to pdf",
      "free image to pdf",
      "image to pdf online",
      "multiple images to pdf",
      "gif to pdf",
    ],
    faq: [
      {
        question: "Is this image to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited image-to-PDF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "PNG, JPG, WebP, and GIF. WebP and GIF are converted locally before embedding so the PDF stays widely compatible.",
      },
      {
        question: "Can I convert multiple images into one PDF?",
        answer:
          "Yes. Add up to 30 images, reorder them, and each image becomes a page in the downloaded PDF.",
      },
      {
        question: "What page size options are available?",
        answer:
          "Choose Fit so each page matches the image dimensions, or place images on A4 or US Letter with optional margins.",
      },
      {
        question: "Is PNG transparency preserved?",
        answer:
          "Yes. Transparent PNG areas stay transparent in the PDF. Some printers may still composite onto white paper.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each image can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your images, and convert immediately.",
      },
    ],
  },
  {
    slug: "png-to-pdf",
    name: "PNG to PDF Converter",
    shortName: "PNG to PDF",
    description:
      "Convert PNG to PDF online — turn one image or a batch into a multi-page PDF with Fit, A4, or Letter. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/png-to-pdf",
    keywords: [
      "png to pdf",
      "convert png to pdf",
      "png to pdf converter",
      "png images to pdf",
      "free png to pdf",
      "png to pdf online",
      "multiple png to pdf",
    ],
    faq: [
      {
        question: "Is this PNG to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited image-to-PDF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "PNG is the primary format. JPG and WebP are also accepted. WebP is converted locally before embedding so the PDF stays widely compatible.",
      },
      {
        question: "Can I convert multiple PNGs into one PDF?",
        answer:
          "Yes. Add up to 30 images, reorder them, and each image becomes a page in the downloaded PDF.",
      },
      {
        question: "What page size options are available?",
        answer:
          "Choose Fit so each page matches the image dimensions, or place images on A4 or US Letter with optional margins.",
      },
      {
        question: "Is PNG transparency preserved?",
        answer:
          "Yes. Transparent PNG areas stay transparent in the PDF. Some printers may still composite onto white paper.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each image can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your images, and convert immediately.",
      },
    ],
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG Converter",
    shortName: "PNG to JPG",
    description:
      "Convert PNG to JPG online — turn PNG images into standard JPEG files with quality control. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/png-to-jpg",
    keywords: [
      "png to jpg",
      "png to jpeg",
      "convert png to jpg",
      "png to jpg converter",
      "png to jpeg converter",
      "change png to jpg",
      "png jpg converter",
      "free png to jpg",
      "png to jpg online",
      "convert png to jpeg",
    ],
    faq: [
      {
        question: "Is this PNG to JPG converter free?",
        answer:
          "Yes. Convert and download unlimited PNG-to-JPG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple PNG files at once?",
        answer:
          "Yes. Add up to 20 PNG images. One file downloads as a .jpg; multiple files download together as a ZIP.",
      },
      {
        question: "What quality options are available?",
        answer:
          "Choose Smaller, Balanced, or High JPEG quality to trade file size for detail before downloading.",
      },
      {
        question: "What happens to transparent PNG areas?",
        answer:
          "JPEG does not support transparency. Transparent pixels are filled with white so the JPG looks correct in viewers and editors.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each PNG can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PNG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "png-to-webp",
    name: "PNG to WebP Converter",
    shortName: "PNG to WebP",
    description:
      "Convert PNG to WebP online — turn PNG images into smaller WebP files with quality control and transparency preserved. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/png-to-webp",
    keywords: [
      "png to webp",
      "convert png to webp",
      "png to webp converter",
      "change png to webp",
      "png webp converter",
      "free png to webp",
      "png to webp online",
      "convert png into webp",
      "png to webp tool",
      "transparent png to webp",
    ],
    faq: [
      {
        question: "Is this PNG to WebP converter free?",
        answer:
          "Yes. Convert and download unlimited PNG-to-WebP files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple PNG files at once?",
        answer:
          "Yes. Add up to 20 PNG images. One file downloads as a .webp; multiple files download together as a ZIP.",
      },
      {
        question: "What quality options are available?",
        answer:
          "Choose Smaller, Balanced, or High WebP quality to trade file size for detail before downloading.",
      },
      {
        question: "Does WebP keep PNG transparency?",
        answer:
          "Yes. Transparent PNG pixels stay transparent in the WebP output — no white background is added.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each PNG can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PNG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "png-to-svg",
    name: "PNG to SVG Converter",
    shortName: "PNG to SVG",
    description:
      "Convert PNG to SVG online — trace PNG logos and icons into scalable vector SVG files. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/png-to-svg",
    keywords: [
      "png to svg",
      "convert png to svg",
      "png to svg converter",
      "png to svg online",
      "trace png to svg",
      "vectorize png",
      "png svg converter",
      "free png to svg",
      "raster to svg",
      "png to vector",
    ],
    faq: [
      {
        question: "Is this PNG to SVG converter free?",
        answer:
          "Yes. Convert and download unlimited PNG-to-SVG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Tracing runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple PNG files at once?",
        answer:
          "Yes. Add up to 10 PNG images. One file downloads as a .svg; multiple files download together as a ZIP.",
      },
      {
        question: "What do Simple, Balanced, and Detailed mean?",
        answer:
          "They control how many colors and path details the tracer keeps. Simple produces fewer shapes; Detailed keeps more fidelity; Balanced is a good default for logos and icons.",
      },
      {
        question: "Will photos convert cleanly to SVG?",
        answer:
          "Tracing works best on logos, icons, and flat illustrations with clear edges. Photos can convert, but the SVG will contain many shapes and may look posterized.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each PNG can be up to 10 MB, with a combined limit of 40 MB per conversion. Very large images are downscaled before tracing so conversion stays responsive.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PNG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "png-to-eps",
    name: "PNG to EPS Converter",
    shortName: "PNG to EPS",
    description:
      "Convert PNG to EPS online — wrap PNG images in Encapsulated PostScript for Illustrator, InDesign, and print. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/png-to-eps",
    keywords: [
      "png to eps",
      "convert png to eps",
      "png to eps converter",
      "png to eps online",
      "png to postscript",
      "png eps converter",
      "free png to eps",
      "raster to eps",
      "png to encapsulated postscript",
      "convert png into eps",
    ],
    faq: [
      {
        question: "Is this PNG to EPS converter free?",
        answer:
          "Yes. Convert and download unlimited PNG-to-EPS files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple PNG files at once?",
        answer:
          "Yes. Add up to 10 PNG images. One file downloads as a .eps; multiple files download together as a ZIP.",
      },
      {
        question: "Is the EPS a vector tracing of my PNG?",
        answer:
          "No. The tool embeds the PNG pixels in a valid EPS file so photos and detailed graphics keep their look. Use PNG to SVG when you need traced vector paths.",
      },
      {
        question: "Does EPS keep PNG transparency?",
        answer:
          "Classic EPS does not support PNG-style alpha. Transparent pixels are flattened onto white.",
      },
      {
        question: "What do Screen, Draft, and Print mean?",
        answer:
          "They set placement DPI. Screen (72 DPI) makes 1 pixel equal 1 PostScript point. Draft uses 150 DPI and Print uses 300 DPI so the placed size matches print layouts. Pixel data is not downsampled.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each PNG can be up to 10 MB, with a combined limit of 40 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PNG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "eps-to-png",
    name: "EPS to PNG Converter",
    shortName: "EPS to PNG",
    description:
      "Convert EPS to PNG online — rasterize Encapsulated PostScript logos and artwork into PNG with DPI and transparent background options. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/eps-to-png",
    keywords: [
      "eps to png",
      "convert eps to png",
      "eps to png converter",
      "eps to png online",
      "encapsulated postscript to png",
      "epsf to png",
      "free eps to png",
      "illustrator eps to png",
      "eps png converter",
      "convert eps into png",
      "rasterize eps",
    ],
    faq: [
      {
        question: "Is this EPS to PNG converter free?",
        answer:
          "Yes. Convert and download unlimited EPS-to-PNG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my EPS files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device. The first visit downloads a converter engine (~15 MB) to your browser; the EPS itself is never uploaded.",
      },
      {
        question: "Which formats are supported?",
        answer:
          ".eps and .epsf (Encapsulated PostScript). Plain .ps multi-page documents are not the focus of this tool.",
      },
      {
        question: "What do Screen, Draft, and Print mean?",
        answer:
          "They set output DPI. Screen is 72 DPI for web-sized assets, Draft is 150 DPI, and Print is 300 DPI for sharper logos and mockups. Higher DPI makes a larger PNG.",
      },
      {
        question: "Does the PNG keep a transparent background?",
        answer:
          "Yes, when you choose Transparent. Unpainted areas stay alpha-transparent. Choose White if you need an opaque PNG.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each EPS can be up to 25 MB. Very large artwork at 300 DPI may exceed the 8192 px edge limit — try a lower DPI if that happens.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your EPS file, and convert. No Ghostscript or Illustrator install is required on your computer.",
      },
    ],
  },
  {
    slug: "psd-to-jpg",
    name: "PSD to JPG Converter",
    shortName: "PSD to JPG",
    description:
      "Convert PSD to JPG online — turn Photoshop .psd files into standard JPEG images. Free, private, and local in your browser.",
    categories: ["image", "file"],
    status: "ready",
    href: "/psd-to-jpg",
    keywords: [
      "psd to jpg",
      "psd to jpeg",
      "convert psd to jpg",
      "psd to jpg converter",
      "psd to jpg online",
      "photoshop to jpg",
      "psd to jpeg converter",
      "convert photoshop to jpg",
      "free psd to jpg",
      "photoshop psd to jpg",
    ],
    faq: [
      {
        question: "Is this PSD to JPG converter free?",
        answer:
          "Yes. Convert and download unlimited PSD-to-JPG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PSD files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple PSD files at once?",
        answer:
          "Yes. Add up to 10 Photoshop .psd files. One file downloads as a .jpg; multiple files download together as a ZIP.",
      },
      {
        question: "Are Photoshop layers preserved?",
        answer:
          "No. Layers, masks, and blend modes are flattened into a single JPG. Transparent areas become white because JPEG does not support alpha.",
      },
      {
        question: "Which PSD files are supported?",
        answer:
          "8-bit RGB .psd files with a saved composite. CMYK, Lab, Indexed, 16-bit, and PSB large documents are not supported — convert those to 8-bit RGB in Photoshop first.",
      },
      {
        question: "What quality options are available?",
        answer:
          "Choose Smaller, Balanced, or High JPEG quality to trade file size for detail before downloading.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each PSD can be up to 25 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PSD files, and convert immediately. Photoshop is not required.",
      },
    ],
  },
  {
    slug: "psd-to-png",
    name: "PSD to PNG Converter",
    shortName: "PSD to PNG",
    description:
      "Convert PSD to PNG online — turn Photoshop .psd files into lossless PNG images with optional transparency. Free, private, and local in your browser.",
    categories: ["image", "file"],
    status: "ready",
    href: "/psd-to-png",
    keywords: [
      "psd to png",
      "convert psd to png",
      "psd to png converter",
      "psd to png online",
      "photoshop to png",
      "psd png converter",
      "convert photoshop to png",
      "free psd to png",
      "photoshop psd to png",
      "psd to png transparent",
    ],
    faq: [
      {
        question: "Is this PSD to PNG converter free?",
        answer:
          "Yes. Convert and download unlimited PSD-to-PNG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PSD files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple PSD files at once?",
        answer:
          "Yes. Add up to 10 Photoshop .psd files. One file downloads as a .png; multiple files download together as a ZIP.",
      },
      {
        question: "Does the PNG keep a transparent background?",
        answer:
          "Yes, when you choose Transparent. Unpainted areas stay alpha-transparent. Choose White if you need an opaque PNG.",
      },
      {
        question: "Are Photoshop layers preserved?",
        answer:
          "No. Layers, masks, and blend modes are flattened into a single PNG — the same composite Photoshop saves with the file.",
      },
      {
        question: "Which PSD files are supported?",
        answer:
          "8-bit RGB .psd files with a saved composite. CMYK, Lab, Indexed, 16-bit, and PSB large documents are not supported — convert those to 8-bit RGB in Photoshop first.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each PSD can be up to 25 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PSD files, and convert immediately. Photoshop is not required.",
      },
    ],
  },
  {
    slug: "psd-to-ai",
    name: "PSD to AI Converter",
    shortName: "PSD to AI",
    description:
      "Convert PSD to AI online — turn Photoshop .psd files into Adobe Illustrator .ai files. Free, private, and local in your browser.",
    categories: ["image", "file"],
    status: "ready",
    href: "/psd-to-ai",
    keywords: [
      "psd to ai",
      "convert psd to ai",
      "psd to ai converter",
      "psd to ai online",
      "photoshop to illustrator",
      "psd to illustrator",
      "convert photoshop to ai",
      "psd ai converter",
      "free psd to ai",
      "photoshop psd to ai",
    ],
    faq: [
      {
        question: "Is this PSD to AI converter free?",
        answer:
          "Yes. Convert and download unlimited PSD-to-AI files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my PSD files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple PSD files at once?",
        answer:
          "Yes. Add up to 10 Photoshop .psd files. One file downloads as a .ai; multiple files download together as a ZIP.",
      },
      {
        question: "Is the AI file a vector tracing of my PSD?",
        answer:
          "No. The tool flattens the PSD composite and embeds it in a PDF-compatible .ai file so photos and detailed graphics keep their look. Use PNG to SVG when you need traced vector paths.",
      },
      {
        question: "Are Photoshop layers preserved?",
        answer:
          "No. Layers, masks, and blend modes are flattened into a single artboard image. Transparency is kept where the PSD has it.",
      },
      {
        question: "Which PSD files are supported?",
        answer:
          "8-bit RGB .psd files with a saved composite. CMYK, Lab, Indexed, 16-bit, and PSB large documents are not supported — convert those to 8-bit RGB in Photoshop first.",
      },
      {
        question: "What do Screen, Draft, and Print mean?",
        answer:
          "They set artboard DPI. Screen (72 DPI) makes 1 pixel equal 1 PostScript point. Draft uses 150 DPI and Print uses 300 DPI so the artboard size matches print layouts. Pixel data is not downsampled.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each PSD can be up to 25 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PSD files, and convert immediately. Adobe Illustrator is only needed if you want to edit the downloaded .ai file.",
      },
    ],
  },
  {
    slug: "png-to-gif",
    name: "PNG to GIF Converter",
    shortName: "PNG to GIF",
    description:
      "Convert PNG to GIF online — turn PNG images into still or animated GIFs with size, color, and frame-delay controls. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/png-to-gif",
    keywords: [
      "png to gif",
      "convert png to gif",
      "png to gif converter",
      "png gif converter",
      "make gif from png",
      "images to gif",
      "png to gif online",
      "animated gif from png",
      "free png to gif",
      "change png to gif",
    ],
    faq: [
      {
        question: "Is this PNG to GIF converter free?",
        answer:
          "Yes. Convert and download unlimited PNG-to-GIF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I make an animated GIF from multiple PNGs?",
        answer:
          "Yes. Add two or more PNG images and keep Animated GIF selected. Reorder the frames, pick a delay, and download one looping GIF. Switch to Separate GIFs to convert each image on its own.",
      },
      {
        question: "Can I convert a single PNG to GIF?",
        answer:
          "Yes. One PNG downloads as a still .gif. Multiple files can download as one animated GIF or as a ZIP of individual GIFs.",
      },
      {
        question: "What size and quality options are available?",
        answer:
          "Choose Small (320px), Medium (480px), or Large (640px) output, plus Low, Medium, or High color quality (64–256 colors). Animated GIFs also let you set frame delay from 0.1s to 1s.",
      },
      {
        question: "What happens to transparent PNG areas?",
        answer:
          "GIF transparency is limited. Transparent pixels are filled with white so the GIF looks correct in viewers and chat apps.",
      },
      {
        question: "Will the GIF be larger than the PNG?",
        answer:
          "It depends. GIF is limited to 256 colors. Simple graphics can stay compact; photos and detailed screenshots often grow. Smaller size and fewer colors keep the file lighter.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each PNG can be up to 10 MB, with a combined limit of 80 MB and up to 20 files per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your PNG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "jpg-to-svg",
    name: "JPG to SVG Converter",
    shortName: "JPG to SVG",
    description:
      "Convert JPG to SVG online — trace JPG logos and icons into scalable vector SVG files. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/jpg-to-svg",
    keywords: [
      "jpg to svg",
      "jpeg to svg",
      "convert jpg to svg",
      "jpg to svg converter",
      "jpeg to svg converter",
      "jpg to svg online",
      "trace jpg to svg",
      "vectorize jpg",
      "jpg svg converter",
      "free jpg to svg",
      "raster to svg",
      "jpg to vector",
    ],
    faq: [
      {
        question: "Is this JPG to SVG converter free?",
        answer:
          "Yes. Convert and download unlimited JPG-to-SVG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Tracing runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple JPG files at once?",
        answer:
          "Yes. Add up to 10 JPG or JPEG images. One file downloads as a .svg; multiple files download together as a ZIP.",
      },
      {
        question: "What do Simple, Balanced, and Detailed mean?",
        answer:
          "They control how many colors and path details the tracer keeps. Simple produces fewer shapes; Detailed keeps more fidelity; Balanced is a good default for logos and icons.",
      },
      {
        question: "Will photos convert cleanly to SVG?",
        answer:
          "Tracing works best on logos, icons, and flat illustrations with clear edges. Photos can convert, but the SVG will contain many shapes and may look posterized.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each JPG can be up to 10 MB, with a combined limit of 40 MB per conversion. Very large images are downscaled before tracing so conversion stays responsive.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your JPG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG Converter",
    shortName: "JPG to PNG",
    description:
      "Convert JPG to PNG online — turn JPEG photos into lossless PNG files. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/jpg-to-png",
    keywords: [
      "jpg to png",
      "jpeg to png",
      "convert jpg to png",
      "jpg to png converter",
      "jpeg to png converter",
      "change jpg to png",
      "jpg png converter",
      "free jpg to png",
      "jpg to png online",
      "convert jpeg to png",
    ],
    faq: [
      {
        question: "Is this JPG to PNG converter free?",
        answer:
          "Yes. Convert and download unlimited JPG-to-PNG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple JPG files at once?",
        answer:
          "Yes. Add up to 20 JPG or JPEG images. One file downloads as a .png; multiple files download together as a ZIP.",
      },
      {
        question: "Will the PNG file be larger than the JPG?",
        answer:
          "Often yes. JPEG uses lossy compression optimized for photos; PNG is lossless, so the same image can grow in file size.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each JPG can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your JPG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "svg-to-png",
    name: "SVG to PNG Converter",
    shortName: "SVG to PNG",
    description:
      "Convert SVG to PNG online — rasterize vector logos and icons into crisp PNG files with 1×–4× export scale. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/svg-to-png",
    keywords: [
      "svg to png",
      "convert svg to png",
      "svg to png converter",
      "svg to png online",
      "svg png converter",
      "rasterize svg",
      "svg to png free",
      "export svg as png",
      "vector to png",
      "svg to transparent png",
    ],
    faq: [
      {
        question: "Is this SVG to PNG converter free?",
        answer:
          "Yes. Convert and download unlimited SVG-to-PNG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple SVG files at once?",
        answer:
          "Yes. Add up to 20 SVG images. One file downloads as a .png; multiple files download together as a ZIP.",
      },
      {
        question: "What does export scale mean?",
        answer:
          "Scale multiplies the SVG’s width and height when rendering. 2× is a good default for retina screens; 3× and 4× create larger PNGs for high-DPI use.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each SVG can be up to 10 MB, with a combined limit of 80 MB per conversion. Very large outputs are capped to stay within browser canvas limits.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your SVG files, and convert immediately.",
      },
    ],
  },
  {
    slug: "jpg-to-webp",
    name: "JPG to WebP Converter",
    shortName: "JPG to WebP",
    description:
      "Convert JPG to WebP online — turn JPEG photos into smaller WebP files with quality control. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/jpg-to-webp",
    keywords: [
      "jpg to webp",
      "jpeg to webp",
      "convert jpg to webp",
      "jpg to webp converter",
      "jpeg to webp converter",
      "change jpg to webp",
      "jpg webp converter",
      "free jpg to webp",
      "jpg to webp online",
      "convert jpeg to webp",
      "jpg to webp tool",
    ],
    faq: [
      {
        question: "Is this JPG to WebP converter free?",
        answer:
          "Yes. Convert and download unlimited JPG-to-WebP files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple JPG files at once?",
        answer:
          "Yes. Add up to 20 JPG or JPEG images. One file downloads as a .webp; multiple files download together as a ZIP.",
      },
      {
        question: "What quality options are available?",
        answer:
          "Choose Smaller, Balanced, or High WebP quality to trade file size for detail before downloading.",
      },
      {
        question: "Will the WebP file be smaller than the JPG?",
        answer:
          "Often yes. WebP usually compresses photos more efficiently than JPEG at similar visual quality, though results vary by image.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each JPG can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your JPG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "jpg-to-gif",
    name: "JPG to GIF Converter",
    shortName: "JPG to GIF",
    description:
      "Convert JPG to GIF online — turn JPEG photos into still or animated GIFs with size, color, and frame-delay controls. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/jpg-to-gif",
    keywords: [
      "jpg to gif",
      "jpeg to gif",
      "convert jpg to gif",
      "jpg to gif converter",
      "jpeg to gif converter",
      "make gif from jpg",
      "images to gif",
      "photo to gif",
      "animated gif from jpg",
      "free jpg to gif",
      "jpg to gif online",
    ],
    faq: [
      {
        question: "Is this JPG to GIF converter free?",
        answer:
          "Yes. Convert and download unlimited JPG-to-GIF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I make an animated GIF from multiple JPGs?",
        answer:
          "Yes. Add two or more JPG or JPEG images and keep Animated GIF selected. Reorder the frames, pick a delay, and download one looping GIF. Switch to Separate GIFs to convert each photo on its own.",
      },
      {
        question: "Can I convert a single JPG to GIF?",
        answer:
          "Yes. One JPG downloads as a still .gif. Multiple files can download as one animated GIF or as a ZIP of individual GIFs.",
      },
      {
        question: "What size and quality options are available?",
        answer:
          "Choose Small (320px), Medium (480px), or Large (640px) output, plus Low, Medium, or High color quality (64–256 colors). Animated GIFs also let you set frame delay from 0.1s to 1s.",
      },
      {
        question: "Will the GIF be larger than the JPG?",
        answer:
          "Often yes for photos. GIF is limited to 256 colors and is less efficient than JPEG for still photography. Smaller size and fewer colors keep the file lighter.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each JPG can be up to 10 MB, with a combined limit of 80 MB and up to 20 files per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your JPG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "jpg-to-tiff",
    name: "JPG to TIFF Converter",
    shortName: "JPG to TIFF",
    description:
      "Convert JPG to TIFF online — turn JPEG photos into uncompressed .tif / .tiff files for print, scans, and archival workflows. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/jpg-to-tiff",
    keywords: [
      "jpg to tiff",
      "jpeg to tiff",
      "jpg to tif",
      "convert jpg to tiff",
      "jpg to tiff converter",
      "jpeg to tiff converter",
      "change jpg to tiff",
      "jpg tiff converter",
      "free jpg to tiff",
      "jpg to tiff online",
      "convert jpeg to tif",
    ],
    faq: [
      {
        question: "Is this JPG to TIFF converter free?",
        answer:
          "Yes. Convert and download unlimited JPG-to-TIFF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Can I convert multiple JPG files at once?",
        answer:
          "Yes. Add up to 20 JPG or JPEG images. One file downloads as a .tiff; multiple files download together as a ZIP.",
      },
      {
        question: "Will the TIFF file be larger than the JPG?",
        answer:
          "Usually yes. JPEG is a compact lossy format; this tool writes uncompressed TIFF at the original pixel size, so the file is often much larger.",
      },
      {
        question: "Which TIFF format is downloaded?",
        answer:
          "Each image downloads as a standard uncompressed .tiff (image/tiff) at the original width and height. Browsers preview a PNG of the result because TIFF is not widely displayable inline.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each JPG can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your JPG images, and convert immediately.",
      },
    ],
  },
  {
    slug: "webp-to-jpg",
    name: "WebP to JPG Converter",
    shortName: "WebP to JPG",
    description:
      "Convert WebP to JPG online — extract every frame from animated WebP or convert a still WebP to JPEG. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/webp-to-jpg",
    keywords: [
      "webp to jpg",
      "webp to jpeg",
      "convert webp to jpg",
      "webp to jpg converter",
      "animated webp to jpg",
      "webp frames to jpg",
      "extract webp frames",
      "webp video to jpg",
      "free webp to jpg",
      "webp to jpg online",
    ],
    faq: [
      {
        question: "Is this WebP to JPG converter free?",
        answer:
          "Yes. Convert and download unlimited WebP-to-JPG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my files uploaded to a server?",
        answer:
          "No. Decoding and conversion run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Does it support animated WebP?",
        answer:
          "Yes. Upload an animated WebP and every frame is exported as a separate JPG. Download one frame or a ZIP of all frames.",
      },
      {
        question: "What about still WebP images?",
        answer:
          "Still (single-frame) WebP files convert to one JPG with the same quality controls.",
      },
      {
        question: "What quality options are available?",
        answer:
          "Choose Smaller, Balanced, or High JPEG quality to trade file size for detail before downloading.",
      },
      {
        question: "Is there a file size or frame limit?",
        answer:
          "Yes. Upload WebP files up to 25 MB with a maximum of 300 frames per conversion.",
      },
      {
        question: "Why do JPG frames have a white background?",
        answer:
          "JPEG does not support transparency. Transparent WebP areas are filled with white so frames look correct in viewers and editors.",
      },
      {
        question: "Which browsers work best?",
        answer:
          "Chrome, Edge, and Safari support full animated-frame extraction via WebCodecs. Other browsers may convert the first frame only.",
      },
    ],
  },
  {
    slug: "webp-to-png",
    name: "WebP to PNG Converter",
    shortName: "WebP to PNG",
    description:
      "Convert WebP to PNG online — extract every frame from animated WebP or convert a still WebP to PNG with transparency preserved. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/webp-to-png",
    keywords: [
      "webp to png",
      "convert webp to png",
      "webp to png converter",
      "animated webp to png",
      "webp frames to png",
      "extract webp frames png",
      "webp to png transparent",
      "free webp to png",
      "webp to png online",
    ],
    faq: [
      {
        question: "Is this WebP to PNG converter free?",
        answer:
          "Yes. Convert and download unlimited WebP-to-PNG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my files uploaded to a server?",
        answer:
          "No. Decoding and conversion run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Does it support animated WebP?",
        answer:
          "Yes. Upload an animated WebP and every frame is exported as a separate PNG. Download one frame or a ZIP of all frames.",
      },
      {
        question: "Is transparency preserved?",
        answer:
          "Yes. PNG supports alpha, so transparent areas in your WebP stay transparent in the exported frames.",
      },
      {
        question: "What about still WebP images?",
        answer:
          "Still (single-frame) WebP files convert to one PNG with the same local workflow.",
      },
      {
        question: "Is there a file size or frame limit?",
        answer:
          "Yes. Upload WebP files up to 25 MB with a maximum of 300 frames per conversion.",
      },
      {
        question: "Which browsers work best?",
        answer:
          "Chrome, Edge, and Safari support full animated-frame extraction via WebCodecs. Other browsers may convert the first frame only.",
      },
    ],
  },
  {
    slug: "webp-to-gif",
    name: "WebP to GIF Converter",
    shortName: "WebP to GIF",
    description:
      "Convert WebP to GIF online — turn animated or still WebP into a looping GIF with size and color controls. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/webp-to-gif",
    keywords: [
      "webp to gif",
      "convert webp to gif",
      "webp to gif converter",
      "animated webp to gif",
      "webp animation to gif",
      "webp sticker to gif",
      "convert animated webp",
      "webp to gif online",
      "free webp to gif",
      "still webp to gif",
    ],
    faq: [
      {
        question: "Is this WebP to GIF converter free?",
        answer:
          "Yes. Convert and download unlimited WebP-to-GIF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my files uploaded to a server?",
        answer:
          "No. Decoding and conversion run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Does it support animated WebP?",
        answer:
          "Yes. Animated WebP files are decoded frame by frame and encoded as a looping GIF. Frame timing from the source is preserved.",
      },
      {
        question: "What about still WebP images?",
        answer:
          "Still (single-frame) WebP files convert to one still GIF with the same size and color controls.",
      },
      {
        question: "What size and quality options are available?",
        answer:
          "Choose Small (320px), Medium (480px), or Large (640px) output, plus Low, Medium, or High color quality (64–256 colors).",
      },
      {
        question: "Will the GIF be larger than the WebP?",
        answer:
          "Often yes. GIF is limited to 256 colors and is less efficient than WebP. Smaller size and fewer colors keep the file lighter.",
      },
      {
        question: "Is transparency preserved?",
        answer:
          "GIF transparency is limited. Transparent WebP areas are filled with white so the animation looks correct in viewers and chat apps.",
      },
      {
        question: "Is there a file size or frame limit?",
        answer:
          "Yes. Upload WebP files up to 25 MB with a maximum of 300 frames per conversion.",
      },
      {
        question: "Which browsers work best?",
        answer:
          "Chrome, Edge, and Safari support full animated-frame conversion via WebCodecs. Other browsers may convert the first frame only.",
      },
    ],
  },
  {
    slug: "webp-to-pdf",
    name: "WebP to PDF Converter",
    shortName: "WebP to PDF",
    description:
      "Convert WebP to PDF online — turn one image or a batch into a multi-page PDF with Fit, A4, or Letter. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/webp-to-pdf",
    keywords: [
      "webp to pdf",
      "convert webp to pdf",
      "webp to pdf converter",
      "webp images to pdf",
      "free webp to pdf",
      "webp to pdf online",
      "multiple webp to pdf",
    ],
    faq: [
      {
        question: "Is this WebP to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited WebP-to-PDF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "WebP is the primary format. PNG and JPG are also accepted. WebP is converted locally before embedding so the PDF stays widely compatible.",
      },
      {
        question: "Can I convert multiple WebP images into one PDF?",
        answer:
          "Yes. Add up to 30 images, reorder them, and each image becomes a page in the downloaded PDF.",
      },
      {
        question: "What page size options are available?",
        answer:
          "Choose Fit so each page matches the image dimensions, or place images on A4 or US Letter with optional margins.",
      },
      {
        question: "Is WebP transparency preserved?",
        answer:
          "Yes. Transparent WebP areas are preserved when converted locally before embedding. Some printers may still composite onto white paper.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each image can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your WebP images, and convert immediately.",
      },
    ],
  },
  {
    slug: "gif-to-pdf",
    name: "GIF to PDF Converter",
    shortName: "GIF to PDF",
    description:
      "Convert GIF to PDF online — turn one image or a batch into a multi-page PDF with Fit, A4, or Letter. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/gif-to-pdf",
    keywords: [
      "gif to pdf",
      "convert gif to pdf",
      "gif to pdf converter",
      "gif images to pdf",
      "free gif to pdf",
      "gif to pdf online",
      "multiple gif to pdf",
      "animated gif to pdf",
    ],
    faq: [
      {
        question: "Is this GIF to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited GIF-to-PDF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my images uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser with pdf-lib. Your files stay on your device.",
      },
      {
        question: "Which image formats are supported?",
        answer:
          "GIF is the primary format. PNG, JPG, and WebP are also accepted. GIF is converted locally before embedding so the PDF stays widely compatible.",
      },
      {
        question: "What happens with animated GIFs?",
        answer:
          "PDF pages are static. Each animated GIF contributes the frame your browser displays when the file is loaded (typically the first frame).",
      },
      {
        question: "Can I convert multiple GIFs into one PDF?",
        answer:
          "Yes. Add up to 30 images, reorder them, and each image becomes a page in the downloaded PDF.",
      },
      {
        question: "What page size options are available?",
        answer:
          "Choose Fit so each page matches the image dimensions, or place images on A4 or US Letter with optional margins.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each image can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your GIF images, and convert immediately.",
      },
    ],
  },
  {
    slug: "tiff-to-jpg",
    name: "TIFF to JPG Converter",
    shortName: "TIFF to JPG",
    description:
      "Convert TIFF to JPG online — turn .tif and .tiff scans, including multi-page files, into standard JPEG images with quality control. Free, private, and local in your browser.",
    categories: ["image"],
    status: "ready",
    href: "/tiff-to-jpg",
    keywords: [
      "tiff to jpg",
      "tiff to jpeg",
      "tif to jpg",
      "convert tiff to jpg",
      "tiff to jpg converter",
      "tiff to jpeg converter",
      "multipage tiff to jpg",
      "scan to jpg",
      "free tiff to jpg",
      "tiff to jpg online",
      "convert tif to jpeg",
    ],
    faq: [
      {
        question: "Is this TIFF to JPG converter free?",
        answer:
          "Yes. Convert and download unlimited TIFF-to-JPG files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my TIFF files uploaded to a server?",
        answer:
          "No. Decoding and conversion run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which formats are supported?",
        answer:
          ".tif and .tiff files (image/tiff). Multi-page TIFFs are supported — each page becomes a separate JPG.",
      },
      {
        question: "Can I convert multiple TIFF files at once?",
        answer:
          "Yes. Add up to 20 TIFF files (up to 100 pages total). One page downloads as a .jpg; multiple pages download together as a ZIP.",
      },
      {
        question: "What quality options are available?",
        answer:
          "Choose Smaller, Balanced, or High JPEG quality to trade file size for detail before downloading.",
      },
      {
        question: "What happens to transparent TIFF areas?",
        answer:
          "JPEG does not support transparency. Transparent pixels are filled with white so the JPG looks correct in viewers and editors.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each TIFF can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your TIFF files, and convert immediately.",
      },
    ],
  },
  {
    slug: "tiff-to-pdf",
    name: "TIFF to PDF Converter",
    shortName: "TIFF to PDF",
    description:
      "Convert TIFF to PDF online — upload .tif or .tiff scans, including multi-page files, and download a PDF with Fit, A4, or Letter. Free, private, and local in your browser.",
    categories: ["pdf", "image"],
    status: "ready",
    href: "/tiff-to-pdf",
    keywords: [
      "tiff to pdf",
      "tif to pdf",
      "convert tiff to pdf",
      "tiff to pdf converter",
      "multipage tiff to pdf",
      "scan to pdf",
      "free tiff to pdf",
      "tiff to pdf online",
      "convert tif to pdf",
    ],
    faq: [
      {
        question: "Is this TIFF to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited TIFF-to-PDF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my TIFF files uploaded to a server?",
        answer:
          "No. Decoding and conversion run entirely in your browser. Your files stay on your device.",
      },
      {
        question: "Which formats are supported?",
        answer:
          ".tif and .tiff files (image/tiff). Multi-page TIFFs are supported — each page becomes a PDF page.",
      },
      {
        question: "Can I convert multiple TIFF files into one PDF?",
        answer:
          "Yes. Add up to 30 TIFF files, reorder them, and their pages are combined into one downloaded PDF (up to 100 pages total).",
      },
      {
        question: "What page size options are available?",
        answer:
          "Choose Fit so each page matches the image dimensions, or place pages on A4 or US Letter with optional margins.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each TIFF can be up to 10 MB, with a combined limit of 80 MB per conversion.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your TIFF files, and convert immediately.",
      },
    ],
  },
  {
    slug: "eps-to-pdf",
    name: "EPS to PDF Converter",
    shortName: "EPS to PDF",
    description:
      "Convert EPS to PDF online — turn Encapsulated PostScript artwork into a PDF with Crop, A4, or Letter. Free, private, and local in your browser.",
    categories: ["pdf", "file"],
    status: "ready",
    href: "/eps-to-pdf",
    keywords: [
      "eps to pdf",
      "convert eps to pdf",
      "eps to pdf converter",
      "encapsulated postscript to pdf",
      "postscript to pdf",
      "epsf to pdf",
      "free eps to pdf",
      "eps to pdf online",
      "illustrator eps to pdf",
    ],
    faq: [
      {
        question: "Is this EPS to PDF converter free?",
        answer:
          "Yes. Convert and download unlimited EPS-to-PDF files with no account, subscription, watermark, or daily limit.",
      },
      {
        question: "Are my EPS files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your files stay on your device. The first visit downloads a converter engine (~15 MB) to your browser; the EPS itself is never uploaded.",
      },
      {
        question: "Which formats are supported?",
        answer:
          ".eps and .epsf (Encapsulated PostScript). Plain .ps multi-page documents are not the focus of this tool.",
      },
      {
        question: "What page size options are available?",
        answer:
          "Choose Crop so the PDF matches the EPS bounding box, or fit the artwork onto A4 or US Letter.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "Yes. Each EPS can be up to 25 MB.",
      },
      {
        question: "Will fonts and vectors be preserved?",
        answer:
          "Ghostscript embeds and subsets fonts when possible and writes a vector PDF. Complex PostScript, missing fonts, or linked resources may still fail or look different.",
      },
      {
        question: "Do I need to install software?",
        answer:
          "No. Open the page in a modern browser, drop your EPS file, and convert. No Ghostscript install is required on your computer.",
      },
    ],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    shortName: "Passwords",
    description:
      "Generate strong, random passwords with length controls, symbols, numbers, uppercase, lowercase, strength meter, and entropy.",
    categories: ["file"],
    status: "ready",
    href: "/password-generator",
    keywords: [
      "password generator",
      "free password generator",
      "random password generator",
      "strong password generator",
      "secure password maker",
      "password entropy",
      "password strength meter",
    ],
    faq: [
      {
        question: "Are generated passwords stored or uploaded?",
        answer:
          "No. Passwords are created locally in your browser with the Web Crypto API and are never sent to Focera servers.",
      },
      {
        question: "How does the strength meter work?",
        answer:
          "Strength is estimated from password entropy — length multiplied by log₂ of the selected character pool. Higher entropy maps to stronger labels.",
      },
      {
        question: "What is password entropy?",
        answer:
          "Entropy measures unpredictability in bits. A longer password from a larger character set has higher entropy and is harder to brute-force when generation is random.",
      },
      {
        question: "Can I include or exclude symbols and numbers?",
        answer:
          "Yes. Toggle lowercase, uppercase, numbers, and symbols independently. At least one character set must stay enabled.",
      },
      {
        question: "What password length should I use?",
        answer:
          "Sixteen characters or more is a solid default for most accounts. Use 20+ for email, banking, and admin access when the site allows it.",
      },
      {
        question: "Is this password generator free?",
        answer:
          "Yes. Generate and copy unlimited passwords with no account, subscription, or daily limit.",
      },
      {
        question: "Are the passwords cryptographically random?",
        answer:
          "Yes. The generator uses crypto.getRandomValues for secure randomness rather than Math.random.",
      },
    ],
  },
  {
    slug: "password-checker",
    name: "Password Checker",
    shortName: "Strength Check",
    description: "Estimate password strength and spot weak patterns.",
    categories: ["file"],
    status: "soon",
    href: "/password-checker",
    keywords: ["password", "strength", "security"],
    faq: [
      {
        question: "Do you check my password against breaches?",
        answer:
          "The first version estimates strength locally. Breach checks may come later.",
      },
    ],
  },
  {
    slug: "html-css-js-minifier",
    name: "HTML CSS JS Minifier",
    shortName: "Minifier",
    description:
      "Minify HTML, CSS, and JavaScript online — compress code in your browser, then copy or download. Free, private, and fast.",
    categories: ["file"],
    status: "ready",
    href: "/html-css-js-minifier",
    keywords: [
      "html minifier",
      "css minifier",
      "javascript minifier",
      "js minifier",
      "minify html css js",
      "online code minifier",
      "compress html",
      "compress css",
      "minify javascript online",
    ],
    faq: [
      {
        question: "Does my code leave the browser?",
        answer:
          "No. HTML, CSS, and JavaScript minification run locally in your browser. Nothing is uploaded to Focera for processing.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "HTML, CSS, and JavaScript. Switch modes with the tabs, paste your source, then click Minify.",
      },
      {
        question: "How does JavaScript minification work?",
        answer:
          "JS is minified with Terser in your browser — compression, mangling, and comment removal for compact production output.",
      },
      {
        question: "Can I download the minified file?",
        answer:
          "Yes. After minifying, use Download to save a .html, .css, or .js file generated on your device. You can also copy the result to the clipboard.",
      },
      {
        question: "Will HTML minification break my layout?",
        answer:
          "Significant whitespace inside tags like pre, code, script, and style is preserved. Most other comments and inter-tag whitespace are removed safely for typical markup.",
      },
      {
        question: "Is this minifier free?",
        answer:
          "Yes. Minify, copy, and download with no account, subscription, or daily limit.",
      },
      {
        question: "Do I need to install anything?",
        answer:
          "No. Open the page in a modern browser, paste your code, and minify immediately.",
      },
    ],
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    shortName: "JSON",
    description:
      "Format, validate, and minify JSON online with error highlighting, copy, download, and a dark editor mode.",
    categories: ["file"],
    status: "ready",
    href: "/json-formatter",
    keywords: [
      "json formatter",
      "json validator",
      "json beautifier",
      "minify json",
      "pretty print json",
      "format json online",
      "json lint",
    ],
    faq: [
      {
        question: "Does my JSON leave the browser?",
        answer:
          "No. Formatting, validation, and minification run locally with your browser’s JSON parser. Nothing is uploaded to Focera.",
      },
      {
        question: "Can I minify JSON as well as format it?",
        answer:
          "Yes. Use Format for readable 2-space indentation, or Minify to collapse whitespace into a compact single line.",
      },
      {
        question: "How does error highlighting work?",
        answer:
          "When JSON is invalid, the status bar shows the message with line and column when available, and the matching line is marked in the editor gutter.",
      },
      {
        question: "Can I download the result as a file?",
        answer:
          "Yes. After your JSON validates, click Download to save a .json file generated on your device.",
      },
      {
        question: "Is there a dark mode for the editor?",
        answer:
          "Yes. Toggle Dark / Light in the toolbar. Your preference is stored in local storage on your device only.",
      },
      {
        question: "Is this JSON formatter free?",
        answer:
          "Yes. Format, validate, minify, copy, and download with no account, subscription, or daily limit.",
      },
      {
        question: "Do I need to install anything?",
        answer:
          "No. Open the page in a modern browser, paste your JSON, and use the toolbar actions immediately.",
      },
    ],
  },
  {
    slug: "markdown-editor",
    name: "Markdown Editor with Live Preview",
    shortName: "Markdown",
    description:
      "Write Markdown with a live preview, syntax highlighting, dark mode, and export to Markdown, HTML, or PDF — all in your browser.",
    categories: ["file"],
    status: "ready",
    href: "/markdown-editor",
    keywords: [
      "markdown editor",
      "markdown preview",
      "online markdown editor",
      "markdown to html",
      "markdown to pdf",
      "live markdown preview",
      "md editor",
    ],
    faq: [
      {
        question: "Does my Markdown leave the browser?",
        answer:
          "No. Parsing, preview, sanitization, and exports run locally in your browser. Nothing is uploaded to Focera.",
      },
      {
        question: "What can I export?",
        answer:
          "Download your document as Markdown (.md), a self-contained HTML file, or a PDF generated on your device. You can also copy rendered HTML to the clipboard.",
      },
      {
        question: "Does the preview support syntax highlighting?",
        answer:
          "Yes. Fenced code blocks with a language tag (for example ts or python) are highlighted in the live preview.",
      },
      {
        question: "Is there a dark mode?",
        answer:
          "Yes. Toggle Dark / Light in the toolbar. Your preference is stored in local storage on your device only.",
      },
      {
        question: "Will my draft be saved?",
        answer:
          "Yes. The editor autosaves your draft to local storage on this device so you can refresh without losing work. Clear removes the draft.",
      },
      {
        question: "Is this Markdown editor free?",
        answer:
          "Yes. Write, preview, copy, and export with no account, subscription, or daily limit.",
      },
      {
        question: "Do I need to install anything?",
        answer:
          "No. Open the page in a modern browser and start writing immediately.",
      },
    ],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getReadyTools(): Tool[] {
  return tools.filter((tool) => tool.status === "ready");
}

export function isToolCategory(value: string): value is ToolCategory {
  return (categoryOrder as string[]).includes(value);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.categories.includes(category));
}

export function toolHasCategory(tool: Tool, category: ToolCategory): boolean {
  return tool.categories.includes(category);
}

export function getPrimaryCategory(tool: Tool): ToolCategory {
  return tool.categories[0] ?? "file";
}

export function getTopTools(limit = 8): Tool[] {
  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));
  return topToolSlugs
    .map((slug) => bySlug.get(slug))
    .filter((tool): tool is Tool => Boolean(tool && tool.status === "ready"))
    .slice(0, limit);
}

export function formatToolCategories(tool: Tool): string {
  return tool.categories.map((c) => categoryLabels[c]).join(" · ");
}

/** File / format tokens shown in uppercase in compact category labels. */
const SEO_TAG_UPPERCASE = new Set([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "tiff",
  "tif",
  "svg",
  "eps",
  "psd",
  "webp",
  "heic",
  "bmp",
  "mp4",
  "mp3",
  "mov",
  "webm",
  "wav",
  "m4a",
  "avi",
  "csv",
  "json",
  "xml",
  "html",
  "css",
  "js",
  "txt",
  "srt",
  "vtt",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "epub",
  "mobi",
  "azw3",
  "qr",
  "utm",
  "ai",
  "ocr",
  "bg",
]);

/** Compact SEO-style label for dense category lists (e.g. "Word to PDF"). */
export function toolSeoTag(tool: Tool): string {
  const words = tool.slug.split("-").map((word) => {
    const lower = word.toLowerCase();
    if (SEO_TAG_UPPERCASE.has(lower)) return lower.toUpperCase();
    return lower;
  });

  if (!words.length) return "";

  const [first, ...rest] = words;
  const titledFirst =
    first === first.toUpperCase()
      ? first
      : `${first.charAt(0).toUpperCase()}${first.slice(1)}`;

  return [titledFirst, ...rest].join(" ");
}

/** Short listing blurb — keeps full SEO meta copy off index/catalog cards. */
export function toolCardDescription(tool: Tool, maxLength = 96): string {
  const raw = tool.description.trim();
  const primary =
    raw.split(/\s+[—–]\s+/)[0]?.trim() ||
    raw.split(/(?<=\.)\s+/)[0]?.trim() ||
    raw;

  if (primary.length <= maxLength) {
    return /[.!?]$/.test(primary) ? primary : `${primary}.`;
  }

  const slice = primary.slice(0, maxLength - 1);
  const atWord = slice.replace(/\s+\S*$/, "").trim();
  return `${atWord || slice}…`;
}
