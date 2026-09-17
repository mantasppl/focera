"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BlockEditor from "@/components/admin/content/BlockEditor";
import ImageUrlField from "@/components/admin/content/ImageUrlField";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import Button from "@/components/Button";
import { adminFetch } from "@/lib/admin/csrf-client";
import { createEmptyBlock } from "@/lib/content/blocks";
import { slugify } from "@/lib/content/slug";
import {
  CTA_POSITIONS,
  DEFAULT_CTA_CONFIG,
  ROBOTS_OPTIONS,
  SCHEMA_TYPES,
  type ContentBlock,
  type ContentTool,
  type CtaConfig,
  type CtaPosition,
  type Post,
  type PostStatus,
  type RobotsDirective,
  type SchemaType,
} from "@/lib/content/types";

type EditorState = {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  content: ContentBlock[];
  seoTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: RobotsDirective;
  schemaType: SchemaType;
  schemaJson: string;
  primaryToolId: string;
  relatedToolIds: string[];
  ctaConfig: CtaConfig;
  status: PostStatus;
  publishedAtLocal: string;
};

function toDatetimeLocal(ms: number | null): string {
  if (!ms) return "";
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function postToState(post: Post): EditorState {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    content: post.content.length ? post.content : [createEmptyBlock("text")],
    seoTitle: post.seoTitle,
    metaDescription: post.metaDescription,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage,
    canonicalUrl: post.canonicalUrl,
    robots: post.robots,
    schemaType: post.schemaType,
    schemaJson: post.schemaJson,
    primaryToolId: post.primaryToolId || "",
    relatedToolIds: post.relatedToolIds,
    ctaConfig: {
      positions: post.ctaConfig.positions.length
        ? post.ctaConfig.positions
        : [...DEFAULT_CTA_CONFIG.positions],
      labels: { ...post.ctaConfig.labels },
      variant: post.ctaConfig.variant || "button",
    },
    status: post.status,
    publishedAtLocal: toDatetimeLocal(post.publishedAt),
  };
}

function emptyState(): EditorState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    coverImage: "",
    content: [createEmptyBlock("text")],
    seoTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    canonicalUrl: "",
    robots: "index,follow",
    schemaType: "article",
    schemaJson: "",
    primaryToolId: "",
    relatedToolIds: [],
    ctaConfig: {
      positions: ["top", "bottom"],
      labels: {},
      variant: "button",
    },
    status: "draft",
    publishedAtLocal: "",
  };
}

export default function PostEditor({
  postId,
  initialPost,
  initialTools = [],
}: {
  postId?: string;
  initialPost?: Post | null;
  initialTools?: ContentTool[];
}) {
  const router = useRouter();
  const { adminPath, contentPostsPath } = useAdminPath();
  const [state, setState] = useState<EditorState>(
    initialPost ? postToState(initialPost) : emptyState,
  );
  const [slugLocked, setSlugLocked] = useState(Boolean(initialPost || postId));
  const tools = initialTools;
  const loading = Boolean(postId) && !initialPost;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(
    postId && !initialPost ? "Post not found." : "",
  );
  const [notice, setNotice] = useState("");

  const payload = useMemo(
    () => ({
      title: state.title,
      slug: state.slug,
      excerpt: state.excerpt,
      coverImage: state.coverImage,
      content: state.content,
      seoTitle: state.seoTitle,
      metaDescription: state.metaDescription,
      ogTitle: state.ogTitle,
      ogDescription: state.ogDescription,
      ogImage: state.ogImage,
      canonicalUrl: state.canonicalUrl,
      robots: state.robots,
      schemaType: state.schemaType,
      schemaJson: state.schemaJson,
      primaryToolId: state.primaryToolId || null,
      relatedToolIds: state.relatedToolIds,
      ctaConfig: state.ctaConfig,
      status: state.status,
      publishedAt: fromDatetimeLocal(state.publishedAtLocal),
    }),
    [state],
  );

  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await adminFetch(
        postId
          ? `${adminPath}/api/content/posts/${postId}`
          : `${adminPath}/api/content/posts`,
        {
          method: postId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      const body = (await response.json().catch(() => null)) as {
        post?: Post;
        error?: string;
      } | null;
      if (!response.ok || !body?.post) {
        throw new Error(body?.error || "Could not save post.");
      }
      setNotice(postId ? "Saved." : "Post created.");
      setState(postToState(body.post));
      setSlugLocked(true);
      if (!postId) {
        router.replace(`${contentPostsPath}/${body.post.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save post.");
    } finally {
      setSaving(false);
    }
  }

  function togglePosition(position: CtaPosition) {
    setState((current) => {
      const has = current.ctaConfig.positions.includes(position);
      const positions = has
        ? current.ctaConfig.positions.filter((item) => item !== position)
        : [...current.ctaConfig.positions, position];
      return {
        ...current,
        ctaConfig: { ...current.ctaConfig, positions },
      };
    });
  }

  function toggleRelated(id: string) {
    setState((current) => ({
      ...current,
      relatedToolIds: current.relatedToolIds.includes(id)
        ? current.relatedToolIds.filter((item) => item !== id)
        : [...current.relatedToolIds, id],
    }));
  }

  if (loading) {
    return <p className="admin-muted">Loading editor…</p>;
  }

  return (
    <form
      className="admin-editor"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      {error ? (
        <div className="admin-error" role="alert">
          {error}
        </div>
      ) : null}
      {notice ? <p className="admin-notice">{notice}</p> : null}

      <div className="admin-editor__layout">
        <section className="admin-panel admin-panel--main">
          <h2>Content</h2>
          <label className="admin-field">
            Title
            <input
              required
              value={state.title}
              onChange={(event) => {
                const title = event.target.value;
                setState((current) => ({
                  ...current,
                  title,
                  slug: slugLocked ? current.slug : slugify(title),
                }));
              }}
            />
          </label>
          <label className="admin-field">
            Slug
            <input
              required
              value={state.slug}
              onChange={(event) => {
                setSlugLocked(true);
                setState((current) => ({ ...current, slug: event.target.value }));
              }}
            />
          </label>
          <label className="admin-field">
            Excerpt
            <textarea
              rows={3}
              value={state.excerpt}
              onChange={(event) =>
                setState((current) => ({ ...current, excerpt: event.target.value }))
              }
            />
          </label>
          <ImageUrlField
            label="Cover image"
            value={state.coverImage}
            onChange={(coverImage) =>
              setState((current) => ({ ...current, coverImage }))
            }
          />
          <BlockEditor
            blocks={state.content}
            tools={tools}
            onChange={(content) => setState((current) => ({ ...current, content }))}
          />
        </section>

        <div className="admin-editor__side">
          <section className="admin-panel">
            <h2>SEO</h2>
            <label className="admin-field">
              SEO title
              <input
                value={state.seoTitle}
                onChange={(event) =>
                  setState((current) => ({ ...current, seoTitle: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              Meta description
              <textarea
                rows={3}
                value={state.metaDescription}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    metaDescription: event.target.value,
                  }))
                }
              />
            </label>
            <label className="admin-field">
              OG title
              <input
                value={state.ogTitle}
                onChange={(event) =>
                  setState((current) => ({ ...current, ogTitle: event.target.value }))
                }
              />
            </label>
            <label className="admin-field">
              OG description
              <textarea
                rows={3}
                value={state.ogDescription}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    ogDescription: event.target.value,
                  }))
                }
              />
            </label>
            <ImageUrlField
              label="OG image"
              value={state.ogImage}
              onChange={(ogImage) =>
                setState((current) => ({ ...current, ogImage }))
              }
            />
            <label className="admin-field">
              Canonical URL
              <input
                value={state.canonicalUrl}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    canonicalUrl: event.target.value,
                  }))
                }
              />
            </label>
            <label className="admin-field">
              Robots
              <select
                value={state.robots}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    robots: event.target.value as RobotsDirective,
                  }))
                }
              >
                {ROBOTS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "index,follow" ? "index, follow" : option.replace(",", ", ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              Schema type
              <select
                value={state.schemaType}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    schemaType: event.target.value as SchemaType,
                  }))
                }
              >
                {SCHEMA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              Custom schema JSON (optional)
              <textarea
                rows={5}
                value={state.schemaJson}
                onChange={(event) =>
                  setState((current) => ({ ...current, schemaJson: event.target.value }))
                }
              />
            </label>
          </section>

          <section className="admin-panel">
            <h2>Conversion</h2>
            <label className="admin-field">
              Primary tool
              <select
                value={state.primaryToolId}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    primaryToolId: event.target.value,
                  }))
                }
              >
                <option value="">None</option>
                {tools.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="admin-field">
              <legend>Related tools</legend>
              <div className="admin-multiselect">
                {tools.map((tool) => (
                  <label key={tool.id} className="admin-check">
                    <input
                      type="checkbox"
                      checked={state.relatedToolIds.includes(tool.id)}
                      onChange={() => toggleRelated(tool.id)}
                    />
                    {tool.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="admin-field">
              <legend>CTA positions</legend>
              {CTA_POSITIONS.map((position) => (
                <label key={position} className="admin-check">
                  <input
                    type="checkbox"
                    checked={state.ctaConfig.positions.includes(position)}
                    onChange={() => togglePosition(position)}
                  />
                  {position}
                </label>
              ))}
            </fieldset>
            {CTA_POSITIONS.map((position) => (
              <label key={`${position}-label`} className="admin-field">
                {position} CTA label
                <input
                  value={state.ctaConfig.labels[position] || ""}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      ctaConfig: {
                        ...current.ctaConfig,
                        labels: {
                          ...current.ctaConfig.labels,
                          [position]: event.target.value,
                        },
                      },
                    }))
                  }
                />
              </label>
            ))}
            <label className="admin-field">
              Top CTA variant
              <select
                value={state.ctaConfig.variant || "button"}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    ctaConfig: {
                      ...current.ctaConfig,
                      variant: event.target.value as CtaConfig["variant"],
                    },
                  }))
                }
              >
                <option value="button">Button</option>
                <option value="embed">Button + embed</option>
              </select>
            </label>
          </section>

          <section className="admin-panel">
            <h2>Publish</h2>
            <label className="admin-field">
              Status
              <select
                value={state.status}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    status: event.target.value as PostStatus,
                  }))
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="admin-field">
              Publish date
              <input
                type="datetime-local"
                value={state.publishedAtLocal}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    publishedAtLocal: event.target.value,
                  }))
                }
              />
            </label>
            <div className="admin-editor__actions">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <a
                className="ui-btn ui-btn--ghost"
                href={state.slug ? `/blog/${state.slug}?preview=true` : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!state.slug}
                onClick={(event) => {
                  if (!state.slug) event.preventDefault();
                }}
              >
                Preview
              </a>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
