export type SeedComment = {
  name: string;
  content: string;
  rating: number;
  likes: number;
  /** Hours ago from "now" when seeding. */
  hoursAgo: number;
  replies?: Array<{
    name: string;
    content: string;
    likes: number;
    hoursAgo: number;
  }>;
};

/**
 * Realistic engagement seeds. `{tool}` is replaced with the tool's display name.
 * Applied once per tool when it has zero comments.
 */
export const COMMENT_SEEDS: SeedComment[] = [
  {
    name: "Maya Chen",
    content:
      "Used {tool} for a client deck last night — exported in under a minute. Tip: keep your source file under 20MB if you want the fastest pass.",
    rating: 5,
    likes: 24,
    hoursAgo: 6,
    replies: [
      {
        name: "Jordan Lee",
        content: "Same here. Worked great on a 40-page PDF batch.",
        likes: 5,
        hoursAgo: 4,
      },
    ],
  },
  {
    name: "Alex Rivera",
    content:
      "Prompt that worked for me: “Clean professional result, no watermarks, preserve original colors.” Got exactly what I needed on the first try.",
    rating: 5,
    likes: 18,
    hoursAgo: 14,
  },
  {
    name: "Priya Nair",
    content:
      "Solid tool. I use it weekly for social assets. Would love a batch mode someday, but for single files it’s already faster than my old workflow.",
    rating: 4,
    likes: 15,
    hoursAgo: 28,
    replies: [
      {
        name: "Sam Okonkwo",
        content: "Agreed — batch would be huge. Still five stars for speed.",
        likes: 3,
        hoursAgo: 20,
      },
    ],
  },
  {
    name: "Chris Walsh",
    content:
      "Honest take: output quality is great, but large files take a bit longer than I expected. Still better than installing desktop software.",
    rating: 4,
    likes: 11,
    hoursAgo: 36,
  },
  {
    name: "Elena Voss",
    content:
      "Shared this with my team for onboarding docs. No signup wall is refreshing — we just opened it and got work done.",
    rating: 5,
    likes: 21,
    hoursAgo: 48,
  },
  {
    name: "Noah Park",
    content:
      "Tried it after a failed export elsewhere. Result looked clean on mobile and desktop. Bookmarking {tool} for next sprint.",
    rating: 5,
    likes: 9,
    hoursAgo: 55,
  },
  {
    name: "Riley Brooks",
    content:
      "Works fine. UI is clear. One nit: I almost missed the download button on a small laptop screen. Otherwise smooth.",
    rating: 3,
    likes: 7,
    hoursAgo: 72,
    replies: [
      {
        name: "Maya Chen",
        content: "Thanks for the note — scrolling to the bottom usually reveals it on compact layouts.",
        likes: 2,
        hoursAgo: 60,
      },
    ],
  },
  {
    name: "Fatima Hassan",
    content:
      "Best prompt so far: “Keep text sharp, mild compression, prioritize readability over file size.” Perfect for handouts.",
    rating: 5,
    likes: 16,
    hoursAgo: 80,
  },
  {
    name: "Tomás Silva",
    content:
      "Used {tool} for a last-minute pitch. Not magical on messy inputs, but with a clean source it nailed it. Four stars.",
    rating: 4,
    likes: 8,
    hoursAgo: 96,
  },
  {
    name: "Hannah Kim",
    content:
      "Neutral review: does what it says. Privacy-friendly since processing feels local-ish. I’ll keep using it for routine tasks.",
    rating: 4,
    likes: 6,
    hoursAgo: 110,
  },
  {
    name: "Dev Patel",
    content:
      "Slightly critical: wish there were more export presets. Quality is good though — saved me from a paid subscription this month.",
    rating: 3,
    likes: 12,
    hoursAgo: 130,
    replies: [
      {
        name: "Alex Rivera",
        content: "Presets would help. For now I just re-run with different settings.",
        likes: 1,
        hoursAgo: 120,
      },
    ],
  },
  {
    name: "Olivia Grant",
    content:
      "Ran three variations for Instagram stories. Tip: start with the highest quality input you have — garbage in still means garbage out.",
    rating: 5,
    likes: 14,
    hoursAgo: 150,
  },
  {
    name: "Marcus Webb",
    content:
      "Pretty good for quick edits. Hit a hiccup once on a huge file, refreshed, and it worked. Would recommend for freelancers.",
    rating: 4,
    likes: 5,
    hoursAgo: 170,
  },
  {
    name: "Sofia Berg",
    content:
      "Our design intern used {tool} without training. That alone is a win. Clear labels, sensible defaults.",
    rating: 5,
    likes: 19,
    hoursAgo: 200,
  },
  {
    name: "Jake Miller",
    content:
      "It’s fine. Not the flashiest UI, but reliable. I preferred a bit more control over advanced options — still usable day to day.",
    rating: 3,
    likes: 4,
    hoursAgo: 240,
  },
  {
    name: "Aisha Rahman",
    content:
      "Prompt tip: describe the end use (“print flyer”, “web thumbnail”, “email attachment”) — results felt more on-target when I did.",
    rating: 5,
    likes: 13,
    hoursAgo: 280,
  },
];

export function fillSeedTemplate(text: string, toolName: string): string {
  return text.replaceAll("{tool}", toolName);
}
