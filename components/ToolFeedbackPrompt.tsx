import Link from "next/link";

type ToolFeedbackPromptProps = {
  toolSlug: string;
};

export default function ToolFeedbackPrompt({
  toolSlug,
}: ToolFeedbackPromptProps) {
  return (
    <p className="tool-feedback-prompt">
      Found a bug, know how to improve something, or want to suggest a new
      feature?{" "}
      <Link
        href={`/feedback?tool=${encodeURIComponent(toolSlug)}`}
        className="tool-feedback-prompt__link"
      >
        Report it to us
      </Link>
    </p>
  );
}
