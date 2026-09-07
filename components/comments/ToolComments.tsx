import CommentSection from "@/components/comments/CommentSection";
import { listToolComments } from "@/lib/comments/store";
import type { CommentListResult } from "@/lib/comments/types";

type ToolCommentsProps = {
  toolSlug: string;
  toolName: string;
};

const EMPTY: CommentListResult = {
  comments: [],
  total: 0,
  sort: "top",
};

export default async function ToolComments({
  toolSlug,
  toolName,
}: ToolCommentsProps) {
  let initial = EMPTY;
  try {
    initial = await listToolComments({
      toolSlug,
      toolName,
      sort: "top",
    });
  } catch (error) {
    console.error("[comments] SSR load failed:", error);
  }

  return (
    <CommentSection
      toolSlug={toolSlug}
      toolName={toolName}
      initial={initial}
    />
  );
}
