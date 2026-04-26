"use client";

import { ImageIcon, Type, Trash2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

export type ContentBlock =
  | { type: "text"; content: string }
  | { type: "image"; url: string; caption: string };

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function ContentBlockEditor({ blocks, onChange }: ContentBlockEditorProps) {
  function add(type: ContentBlock["type"]) {
    const block: ContentBlock =
      type === "text" ? { type: "text", content: "" } : { type: "image", url: "", caption: "" };
    onChange([...blocks, block]);
  }

  function update(index: number, updated: ContentBlock) {
    onChange(blocks.map((b, i) => (i === index ? updated : b)));
  }

  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function move(index: number, dir: "up" | "down") {
    const next = dir === "up" ? index - 1 : index + 1;
    if (next < 0 || next >= blocks.length) return;
    const arr = [...blocks];
    [arr[index], arr[next]] = [arr[next], arr[index]];
    onChange(arr);
  }

  return (
    <div className="space-y-3">
      {blocks.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Build your case study by adding text and image blocks in order.
        </div>
      )}

      {blocks.map((block, i) => (
        <div key={i} className="rounded-lg border border-border bg-background">
          {/* Block header */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              {block.type === "text" ? (
                <Type className="h-3.5 w-3.5" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              <span className="capitalize">{block.type} block</span>
              <span className="tabular-nums opacity-40">#{i + 1}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(i, "up")}
                disabled={i === 0}
                className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, "down")}
                disabled={i === blocks.length - 1}
                className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded p-1 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Block content */}
          <div className="p-3">
            {block.type === "text" ? (
              <textarea
                className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[120px]"
                value={block.content}
                onChange={(e) => update(i, { ...block, content: e.target.value })}
                placeholder="Write a paragraph…"
              />
            ) : (
              <div className="space-y-2">
                <ImageUpload
                  value={block.url}
                  onChange={(url) => update(i, { ...block, url })}
                  aspectClass="aspect-video"
                />
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  value={block.caption}
                  onChange={(e) => update(i, { ...block, caption: e.target.value })}
                  placeholder="Caption (optional)"
                />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add block buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => add("text")}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <Type className="h-3.5 w-3.5" />
          Add text
        </button>
        <button
          type="button"
          onClick={() => add("image")}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Add image
        </button>
      </div>
    </div>
  );
}
