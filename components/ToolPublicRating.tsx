import ToolPublicRatingView from "@/components/ToolPublicRatingView";
import { ensureToolCommentSeedsForRating } from "@/lib/comments/store";
import { getPublicToolRating } from "@/lib/ratings/store";

type ToolPublicRatingProps = {
  toolSlug: string;
  toolName: string;
};

export default async function ToolPublicRating({
  toolSlug,
  toolName,
}: ToolPublicRatingProps) {
  let initial = {
    toolSlug,
    average: 0,
    count: 0,
    stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as const,
  };

  try {
    await ensureToolCommentSeedsForRating(toolSlug, toolName);
    initial = await getPublicToolRating(toolSlug);
  } catch (error) {
    console.error("[ratings] public load failed:", error);
  }

  return (
    <>
      <ToolPublicRatingView
        toolSlug={toolSlug}
        toolName={toolName}
        initial={initial}
      />
      {initial.count > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: toolName,
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: initial.average,
                bestRating: 5,
                worstRating: 1,
                ratingCount: initial.count,
              },
            }),
          }}
        />
      ) : null}
    </>
  );
}
