"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TurnstileWidget, {
  TURNSTILE_SITE_KEY,
  type TurnstileWidgetHandle,
} from "@/components/comments/TurnstileWidget";
import { formatTimeAgo } from "@/lib/comments/time-ago";
import type {
  CommentListResult,
  CommentSort,
  PublicComment,
} from "@/lib/comments/types";
import { TOOL_RATING_UPDATED_EVENT } from "@/lib/ratings/events";
import { cn } from "@/lib/utils";

const CLIENT_ID_KEY = "focera_comment_client_id";
const LIKED_KEY = "focera_comment_likes";
const INITIAL_VISIBLE_COMMENTS = 3;

type CommentSectionProps = {
  toolSlug: string;
  toolName: string;
  initial: CommentListResult;
};

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

function getOrCreateClientId(): string {
  try {
    const existing = window.localStorage.getItem(CLIENT_ID_KEY);
    if (existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing)) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    return `c${Date.now().toString(36)}`;
  }
}

function readLocalLiked(): Set<number> {
  try {
    const raw = window.localStorage.getItem(LIKED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed
        .map((v) => (typeof v === "number" ? v : Number(v)))
        .filter((n) => Number.isInteger(n) && n > 0),
    );
  } catch {
    return new Set();
  }
}

function writeLocalLiked(ids: Set<number>) {
  try {
    window.localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

function StarIcon({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2.6l2.83 6.54 7.1.66-5.4 4.66 1.6 6.94L12 17.9l-6.13 3.5 1.6-6.94-5.4-4.66 7.1-.66L12 2.6z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarsDisplay({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  return (
    <span className="tool-comments__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "tool-comments__star-static",
            i < rating && "is-on",
          )}
        >
          <StarIcon filled={i < rating} size={14} />
        </span>
      ))}
    </span>
  );
}

function StarPicker({
  value,
  onChange,
  disabled,
  name,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  name: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div
      className="tool-comments__star-picker"
      role="radiogroup"
      aria-label="Star rating"
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            name={name}
            aria-checked={value === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            className={cn(
              "tool-comments__star-btn",
              n <= shown && "is-on",
            )}
            disabled={disabled}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onClick={() => onChange(n)}
          >
            <StarIcon filled={n <= shown} size={22} />
          </button>
        );
      })}
    </div>
  );
}

function mergeLikedState(
  comments: PublicComment[],
  localLiked: Set<number>,
): PublicComment[] {
  return comments.map((c) => ({
    ...c,
    likedByMe: c.likedByMe || localLiked.has(c.id),
    replies: c.replies.map((r) => ({
      ...r,
      likedByMe: r.likedByMe || localLiked.has(r.id),
    })),
  }));
}

function upsertComment(
  list: PublicComment[],
  comment: PublicComment,
): PublicComment[] {
  if (comment.parentId == null) {
    return [comment, ...list];
  }
  return list.map((root) =>
    root.id === comment.parentId
      ? { ...root, replies: [...root.replies, comment] }
      : root,
  );
}

function patchLike(
  list: PublicComment[],
  commentId: number,
  liked: boolean,
  likesCount: number,
): PublicComment[] {
  return list.map((root) => {
    if (root.id === commentId) {
      return { ...root, likedByMe: liked, likesCount };
    }
    return {
      ...root,
      replies: root.replies.map((r) =>
        r.id === commentId ? { ...r, likedByMe: liked, likesCount } : r,
      ),
    };
  });
}

export default function CommentSection({
  toolSlug,
  toolName,
  initial,
}: CommentSectionProps) {
  const formId = useId();
  const [sort, setSort] = useState<CommentSort>(initial.sort);
  const [comments, setComments] = useState(initial.comments);
  const [total, setTotal] = useState(initial.total);
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [replyTurnstileToken, setReplyTurnstileToken] = useState<string | null>(
    null,
  );
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);
  const replyTurnstileRef = useRef<TurnstileWidgetHandle | null>(null);
  const [replyTo, setReplyTo] = useState<PublicComment | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyStatus, setReplyStatus] = useState<Status>({ type: "idle" });
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    () => new Set(),
  );
  const [showAllComments, setShowAllComments] = useState(false);
  const [isPending, startTransition] = useTransition();
  const turnstileRequired = Boolean(TURNSTILE_SITE_KEY);

  const onTurnstileReady = useCallback((handle: TurnstileWidgetHandle) => {
    turnstileRef.current = handle;
  }, []);
  const onReplyTurnstileReady = useCallback((handle: TurnstileWidgetHandle) => {
    replyTurnstileRef.current = handle;
  }, []);

  useEffect(() => {
    const id = getOrCreateClientId();
    setClientId(id);
    const localLiked = readLocalLiked();
    setComments((prev) => mergeLikedState(prev, localLiked));
  }, []);

  async function refresh(nextSort: CommentSort) {
    const params = new URLSearchParams({
      toolSlug,
      sort: nextSort,
    });
    if (clientId) params.set("clientId", clientId);
    const res = await fetch(`/api/comments?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to load comments");
    const data = (await res.json()) as CommentListResult;
    const localLiked = readLocalLiked();
    startTransition(() => {
      setSort(data.sort);
      setTotal(data.total);
      setComments(mergeLikedState(data.comments, localLiked));
    });
  }

  async function onSortChange(next: CommentSort) {
    if (next === sort) return;
    setSort(next);
    setShowAllComments(false);
    try {
      await refresh(next);
    } catch {
      // keep previous list
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (status.type === "loading") return;
    if (turnstileRequired && !turnstileToken) {
      setStatus({
        type: "error",
        message: "Please complete the security check.",
      });
      return;
    }
    setStatus({ type: "loading" });

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug,
          name,
          email: email || undefined,
          content,
          rating,
          website,
          company: "",
          turnstileToken: turnstileToken || "",
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        comment?: PublicComment;
      };
      if (!res.ok) {
        setStatus({
          type: "error",
          message: data.error || "Could not post comment.",
        });
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }
      if (data.comment) {
        setComments((prev) => upsertComment(prev, { ...data.comment!, isTop: false, replies: [] }));
        setTotal((n) => n + 1);
      }
      setName("");
      setEmail("");
      setContent("");
      setRating(0);
      setWebsite("");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setStatus({ type: "success" });
      window.dispatchEvent(
        new CustomEvent(TOOL_RATING_UPDATED_EVENT, {
          detail: { toolSlug },
        }),
      );
      window.setTimeout(() => setStatus({ type: "idle" }), 2500);
      if (sort === "top") {
        try {
          await refresh("top");
        } catch {
          // optimistic list already updated
        }
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  }

  async function onReplySubmit(event: FormEvent) {
    event.preventDefault();
    if (!replyTo || replyStatus.type === "loading") return;
    if (turnstileRequired && !replyTurnstileToken) {
      setReplyStatus({
        type: "error",
        message: "Please complete the security check.",
      });
      return;
    }
    setReplyStatus({ type: "loading" });
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug,
          name: replyName,
          content: replyContent,
          parentId: replyTo.id,
          website: "",
          company: "",
          turnstileToken: replyTurnstileToken || "",
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        comment?: PublicComment;
      };
      if (!res.ok) {
        setReplyStatus({
          type: "error",
          message: data.error || "Could not post reply.",
        });
        replyTurnstileRef.current?.reset();
        setReplyTurnstileToken(null);
        return;
      }
      if (data.comment) {
        setComments((prev) =>
          upsertComment(prev, {
            ...data.comment!,
            isTop: false,
            replies: [],
          }),
        );
        setExpandedReplies((prev) => new Set(prev).add(replyTo.id));
      }
      setReplyTo(null);
      setReplyName("");
      setReplyContent("");
      setReplyTurnstileToken(null);
      setReplyStatus({ type: "idle" });
    } catch {
      setReplyStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
      replyTurnstileRef.current?.reset();
      setReplyTurnstileToken(null);
    }
  }

  async function onToggleLike(comment: PublicComment) {
    const localLiked = readLocalLiked();
    // Optimistic
    const nextLiked = !comment.likedByMe;
    const nextCount = Math.max(0, comment.likesCount + (nextLiked ? 1 : -1));
    setComments((prev) => patchLike(prev, comment.id, nextLiked, nextCount));
    if (nextLiked) localLiked.add(comment.id);
    else localLiked.delete(comment.id);
    writeLocalLiked(localLiked);

    try {
      const res = await fetch("/api/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.id,
          toolSlug,
          clientId,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        liked?: boolean;
        likesCount?: number;
      };
      if (!res.ok || typeof data.liked !== "boolean" || typeof data.likesCount !== "number") {
        // revert
        setComments((prev) =>
          patchLike(prev, comment.id, comment.likedByMe, comment.likesCount),
        );
        if (comment.likedByMe) localLiked.add(comment.id);
        else localLiked.delete(comment.id);
        writeLocalLiked(localLiked);
        return;
      }
      setComments((prev) =>
        patchLike(prev, comment.id, data.liked!, data.likesCount!),
      );
      if (data.liked) localLiked.add(comment.id);
      else localLiked.delete(comment.id);
      writeLocalLiked(localLiked);
    } catch {
      setComments((prev) =>
        patchLike(prev, comment.id, comment.likedByMe, comment.likesCount),
      );
    }
  }

  function onReport(commentId: number) {
    // Placeholder for future moderation backend.
    window.alert(
      `Thanks — report for comment #${commentId} was noted. Moderation tools are coming soon.`,
    );
  }

  function renderComment(comment: PublicComment, isReply = false) {
    const showAllReplies =
      isReply ||
      expandedReplies.has(comment.id) ||
      comment.replies.length <= 2;
    const visibleReplies = showAllReplies
      ? comment.replies
      : comment.replies.slice(0, 2);

    return (
      <article
        key={comment.id}
        className={cn(
          "tool-comments__item",
          isReply && "tool-comments__item--reply",
          comment.isTop && "tool-comments__item--top",
        )}
      >
        <header className="tool-comments__item-head">
          <div className="tool-comments__identity">
            <span className="tool-comments__author">{comment.name}</span>
            <time
              className="tool-comments__time"
              dateTime={comment.createdAt}
            >
              {formatTimeAgo(comment.createdAt)}
            </time>
            {comment.isTop ? (
              <span className="tool-comments__top-badge">Top comment</span>
            ) : null}
          </div>
          <StarsDisplay rating={comment.rating} />
        </header>
        <p className="tool-comments__body">{comment.content}</p>
        <div className="tool-comments__actions">
          <button
            type="button"
            className={cn(
              "tool-comments__action",
              comment.likedByMe && "is-active",
            )}
            onClick={() => onToggleLike(comment)}
            aria-pressed={comment.likedByMe}
          >
            <span aria-hidden="true">👍</span>
            <span>{comment.likesCount}</span>
          </button>
          {!isReply ? (
            <button
              type="button"
              className="tool-comments__action"
              onClick={() => {
                setReplyTo(comment);
                setReplyStatus({ type: "idle" });
              }}
            >
              Reply
            </button>
          ) : null}
          <button
            type="button"
            className="tool-comments__action tool-comments__action--muted"
            onClick={() => onReport(comment.id)}
          >
            Report
          </button>
        </div>

        {!isReply && replyTo?.id === comment.id ? (
          <form className="tool-comments__reply-form" onSubmit={onReplySubmit}>
            <p className="tool-comments__reply-label">
              Replying to <strong>{comment.name}</strong>
            </p>
            <Input
              id={`${formId}-reply-name`}
              label="Name"
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              maxLength={50}
              required
              autoComplete="nickname"
            />
            <Input
              id={`${formId}-reply-content`}
              as="textarea"
              label="Reply"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              maxLength={1000}
              required
              rows={3}
            />
            {TURNSTILE_SITE_KEY ? (
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                className="tool-comments__turnstile"
                onToken={setReplyTurnstileToken}
                onReady={onReplyTurnstileReady}
              />
            ) : null}
            {replyStatus.type === "error" ? (
              <p className="tool-error" role="alert">
                {replyStatus.message}
              </p>
            ) : null}
            <div className="tool-comments__form-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setReplyTo(null);
                  setReplyTurnstileToken(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  replyStatus.type === "loading" ||
                  (turnstileRequired && !replyTurnstileToken)
                }
              >
                {replyStatus.type === "loading" ? "Posting…" : "Post reply"}
              </Button>
            </div>
          </form>
        ) : null}

        {!isReply && visibleReplies.length > 0 ? (
          <div className="tool-comments__replies">
            {visibleReplies.map((reply) => renderComment(reply, true))}
            {!showAllReplies && comment.replies.length > 2 ? (
              <button
                type="button"
                className="tool-comments__more-replies"
                onClick={() =>
                  setExpandedReplies((prev) => new Set(prev).add(comment.id))
                }
              >
                Show {comment.replies.length - 2} more{" "}
                {comment.replies.length - 2 === 1 ? "reply" : "replies"}
              </button>
            ) : null}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <section className="tool-comments" aria-labelledby={`${formId}-title`}>
      <div className="tool-comments__intro">
        <h2 id={`${formId}-title`} className="tool-comments__title">
          How did you use this tool?
        </h2>
        <p className="tool-comments__subtitle">
          Share your results, tips, or best prompts.
        </p>
      </div>

      <form className="tool-comments__form" onSubmit={onSubmit}>
        <div className="tool-comments__form-grid">
          <Input
            id={`${formId}-name`}
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
            autoComplete="nickname"
          />
          <Input
            id={`${formId}-email`}
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            autoComplete="email"
            hint="Not shown publicly"
          />
        </div>

        <div className="tool-comments__rating-field">
          <span className="ui-label" id={`${formId}-rating-label`}>
            Rating
          </span>
          <StarPicker
            name={`${formId}-rating`}
            value={rating}
            onChange={setRating}
            disabled={status.type === "loading"}
          />
        </div>

        <Input
          id={`${formId}-content`}
          as="textarea"
          label="Comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          required
          rows={4}
          placeholder={`How did ${toolName} help you?`}
        />

        {/* Honeypot — hidden from users */}
        <div className="tool-comments__hp" aria-hidden="true">
          <label htmlFor={`${formId}-website`}>Website</label>
          <input
            id={`${formId}-website`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {TURNSTILE_SITE_KEY ? (
          <TurnstileWidget
            siteKey={TURNSTILE_SITE_KEY}
            className="tool-comments__turnstile"
            onToken={setTurnstileToken}
            onReady={onTurnstileReady}
          />
        ) : null}

        {status.type === "error" ? (
          <p className="tool-error" role="alert">
            {status.message}
          </p>
        ) : null}
        {status.type === "success" ? (
          <p className="tool-comments__success" role="status">
            Thanks — your comment is live.
          </p>
        ) : null}

        <div className="tool-comments__form-actions">
          <Button
            type="submit"
            className="tool-comments__submit"
            disabled={
              status.type === "loading" ||
              rating < 1 ||
              (turnstileRequired && !turnstileToken)
            }
          >
            {status.type === "loading" ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </form>

      <div className="tool-comments__list-head">
        <p className="tool-comments__count">
          {total} {total === 1 ? "comment" : "comments"}
        </p>
        <div className="tool-comments__sort" role="group" aria-label="Sort comments">
          <button
            type="button"
            className={cn(
              "tool-comments__sort-btn",
              sort === "top" && "is-active",
            )}
            onClick={() => onSortChange("top")}
            disabled={isPending}
          >
            Top comments
          </button>
          <button
            type="button"
            className={cn(
              "tool-comments__sort-btn",
              sort === "newest" && "is-active",
            )}
            onClick={() => onSortChange("newest")}
            disabled={isPending}
          >
            Newest
          </button>
        </div>
      </div>

      <div className="tool-comments__list">
        {comments.length === 0 ? (
          <p className="tool-comments__empty">
            Be the first to share how you used this tool.
          </p>
        ) : (
          <>
            {(showAllComments
              ? comments
              : comments.slice(0, INITIAL_VISIBLE_COMMENTS)
            ).map((comment) => renderComment(comment))}
            {comments.length > INITIAL_VISIBLE_COMMENTS ? (
              <button
                type="button"
                className="tool-comments__show-more"
                onClick={() => setShowAllComments((open) => !open)}
              >
                {showAllComments
                  ? "Show less"
                  : `Show more (${comments.length - INITIAL_VISIBLE_COMMENTS} more)`}
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
