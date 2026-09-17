"use client";

import { useState } from "react";
import TextBlockEditor from "@/components/admin/content/TextBlockEditor";
import ImageUrlField from "@/components/admin/content/ImageUrlField";
import {
  BLOCK_TYPES,
  type ContentBlock,
  type ContentTool,
} from "@/lib/content/types";
import { createEmptyBlock } from "@/lib/content/blocks";
import { cn } from "@/lib/utils";

const BLOCK_LABELS: Record<ContentBlock["type"], string> = {
  text: "Text",
  image: "Image",
  video: "Video",
  cta: "CTA",
  tool_embed: "Tool embed",
  faq: "FAQ",
  list: "List",
  table: "Table",
};

type BlockEditorProps = {
  blocks: ContentBlock[];
  tools: ContentTool[];
  onChange: (blocks: ContentBlock[]) => void;
};

export default function BlockEditor({ blocks, tools, onChange }: BlockEditorProps) {
  const [adding, setAdding] = useState<ContentBlock["type"]>("text");

  function updateAt(index: number, next: ContentBlock) {
    onChange(blocks.map((block, i) => (i === index ? next : block)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  return (
    <div className="admin-blocks">
      {blocks.map((block, index) => (
        <article key={block.id} className="admin-block">
          <header className="admin-block__head">
            <strong>{BLOCK_LABELS[block.type]}</strong>
            <div className="admin-block__actions">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>
                Up
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
              >
                Down
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => onChange(blocks.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          </header>
          <BlockFields
            block={block}
            tools={tools}
            onChange={(next) => updateAt(index, next)}
          />
        </article>
      ))}

      <div className="admin-blocks__add">
        <select
          value={adding}
          onChange={(event) => setAdding(event.target.value as ContentBlock["type"])}
        >
          {BLOCK_TYPES.map((type) => (
            <option key={type} value={type}>
              {BLOCK_LABELS[type]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="ui-btn ui-btn--ghost"
          onClick={() => onChange([...blocks, createEmptyBlock(adding)])}
        >
          Add block
        </button>
      </div>
    </div>
  );
}

function BlockFields({
  block,
  tools,
  onChange,
}: {
  block: ContentBlock;
  tools: ContentTool[];
  onChange: (block: ContentBlock) => void;
}) {
  switch (block.type) {
    case "text":
      return (
        <TextBlockEditor
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
        />
      );
    case "image":
      return (
        <div className="admin-block__grid">
          <ImageUrlField
            label="Image"
            value={block.url}
            onChange={(url) => onChange({ ...block, url })}
          />
          <label className="admin-field">
            Alt text
            <input
              value={block.alt}
              onChange={(event) => onChange({ ...block, alt: event.target.value })}
            />
          </label>
        </div>
      );
    case "video":
      return (
        <label className="admin-field">
          YouTube URL
          <input
            value={block.url}
            onChange={(event) => onChange({ ...block, url: event.target.value })}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </label>
      );
    case "cta":
      return (
        <div className="admin-block__grid">
          <label className="admin-field">
            Button label
            <input
              value={block.label}
              onChange={(event) => onChange({ ...block, label: event.target.value })}
            />
          </label>
          <ToolSelect
            tools={tools}
            value={block.toolId}
            onChange={(toolId) => onChange({ ...block, toolId })}
          />
        </div>
      );
    case "tool_embed":
      return (
        <ToolSelect
          tools={tools}
          value={block.toolId}
          onChange={(toolId) => onChange({ ...block, toolId })}
        />
      );
    case "faq":
      return (
        <div className="admin-faq-editor">
          {block.items.map((item, index) => (
            <div key={`${block.id}-faq-${index}`} className="admin-block__grid">
              <label className="admin-field">
                Question
                <input
                  value={item.question}
                  onChange={(event) => {
                    const items = block.items.map((entry, i) =>
                      i === index ? { ...entry, question: event.target.value } : entry,
                    );
                    onChange({ ...block, items });
                  }}
                />
              </label>
              <label className="admin-field">
                Answer
                <textarea
                  rows={3}
                  value={item.answer}
                  onChange={(event) => {
                    const items = block.items.map((entry, i) =>
                      i === index ? { ...entry, answer: event.target.value } : entry,
                    );
                    onChange({ ...block, items });
                  }}
                />
              </label>
              <button
                type="button"
                className="admin-table__link admin-table__link--danger"
                onClick={() =>
                  onChange({
                    ...block,
                    items: block.items.filter((_, i) => i !== index),
                  })
                }
              >
                Remove FAQ
              </button>
            </div>
          ))}
          <button
            type="button"
            className="ui-btn ui-btn--ghost"
            onClick={() =>
              onChange({
                ...block,
                items: [...block.items, { question: "", answer: "" }],
              })
            }
          >
            Add question
          </button>
        </div>
      );
    case "list":
      return (
        <div className="admin-block__grid">
          <label className={cn("admin-field")}>
            <span className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(block.ordered)}
                onChange={(event) => onChange({ ...block, ordered: event.target.checked })}
              />
              Numbered list
            </span>
          </label>
          <label className="admin-field">
            Items (one per line)
            <textarea
              rows={6}
              value={block.items.join("\n")}
              onChange={(event) =>
                onChange({ ...block, items: event.target.value.split("\n") })
              }
            />
          </label>
        </div>
      );
    case "table":
      return (
        <div className="admin-block__grid">
          <label className="admin-field">
            Headers (comma separated)
            <input
              value={block.headers.join(", ")}
              onChange={(event) =>
                onChange({
                  ...block,
                  headers: event.target.value.split(",").map((cell) => cell.trim()),
                })
              }
            />
          </label>
          <label className="admin-field">
            Rows (one per line, cells comma separated)
            <textarea
              rows={6}
              value={block.rows.map((row) => row.join(", ")).join("\n")}
              onChange={(event) =>
                onChange({
                  ...block,
                  rows: event.target.value
                    .split("\n")
                    .map((line) => line.split(",").map((cell) => cell.trim())),
                })
              }
            />
          </label>
        </div>
      );
    default:
      return null;
  }
}

function ToolSelect({
  tools,
  value,
  onChange,
}: {
  tools: ContentTool[];
  value: string;
  onChange: (toolId: string) => void;
}) {
  return (
    <label className="admin-field">
      Tool
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select a tool</option>
        {tools.map((tool) => (
          <option key={tool.id} value={tool.id}>
            {tool.name}
          </option>
        ))}
      </select>
    </label>
  );
}
