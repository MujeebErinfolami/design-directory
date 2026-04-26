"use client";

import { useState, useRef, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import {
  ImageIcon,
  Type,
  Grid2X2,
  Video,
  Code2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  X,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";

// ─── Types ───────────────────────────────────────────────────────────────────

type BlockType = "image" | "text" | "photo_grid" | "video" | "embed";

interface ImageBlock { id: string; type: "image"; url: string; caption: string }
interface TextBlock  { id: string; type: "text"; html: string }
interface PhotoGridBlock { id: string; type: "photo_grid"; urls: string[]; caption: string }
interface VideoBlock { id: string; type: "video"; embedUrl: string; caption: string }
interface EmbedBlock { id: string; type: "embed"; code: string; caption: string }

type Block = ImageBlock | TextBlock | PhotoGridBlock | VideoBlock | EmbedBlock;

interface Credit { creditName: string; role: string }
interface Attachment { name: string; url: string; size: number }

interface EditorState {
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  year: number;
  theme: string;
  externalLink: string;
  externalLinkLabel: string;
  agencyName: string;
  agencyUrl: string;
  sourceUrl: string;
  thumbnailUrl: string;
  thumbnailColor: string;
  blocks: Block[];
  credits: Credit[];
  attachments: Attachment[];
}

const CATEGORIES = ["Branding", "Web", "Motion", "Print", "Product", "UX"];
const THEMES = ["light", "dark"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Image size check (client-side) ──────────────────────────────────────────

function checkImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadImage(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });
  return blob.url;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProjectEditor() {
  const router = useRouter();
  const [state, setState] = useState<EditorState>({
    title: "",
    tagline: "",
    description: "",
    category: "Branding",
    tags: [],
    year: new Date().getFullYear(),
    theme: "light",
    externalLink: "",
    externalLinkLabel: "View Project",
    agencyName: "",
    agencyUrl: "",
    sourceUrl: "",
    thumbnailUrl: "",
    thumbnailColor: "#f5f5f4",
    blocks: [],
    credits: [],
    attachments: [],
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverWarning, setCoverWarning] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"add" | "edit">("add");
  const [uploadingBlocks, setUploadingBlocks] = useState<Set<string>>(new Set());
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── helpers ──

  const updateState = (patch: Partial<EditorState>) =>
    setState((s) => ({ ...s, ...patch }));

  const updateBlock = useCallback((id: string, patch: Partial<Block>) => {
    setState((s) => ({
      ...s,
      blocks: s.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
    }));
  }, []);

  const removeBlock = (id: string) => {
    setState((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setState((s) => {
      const idx = s.blocks.findIndex((b) => b.id === id);
      if (idx < 0) return s;
      const next = idx + dir;
      if (next < 0 || next >= s.blocks.length) return s;
      const blocks = [...s.blocks];
      [blocks[idx], blocks[next]] = [blocks[next], blocks[idx]];
      return { ...s, blocks };
    });
  };

  const addBlock = (type: BlockType) => {
    let block: Block;
    const id = uid();
    switch (type) {
      case "image":     block = { id, type, url: "", caption: "" }; break;
      case "text":      block = { id, type, html: "" }; break;
      case "photo_grid":block = { id, type, urls: [], caption: "" }; break;
      case "video":     block = { id, type, embedUrl: "", caption: "" }; break;
      case "embed":     block = { id, type, code: "", caption: "" }; break;
    }
    setState((s) => ({ ...s, blocks: [...s.blocks, block] }));
    setSelectedId(id);
    setSidebarTab("edit");
  };

  // ── cover image ──

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      setCoverWarning("Only JPG, PNG, or GIF files accepted.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setCoverWarning("File exceeds 50 MB limit.");
      return;
    }

    const { width } = await checkImageDimensions(file);
    setCoverWarning(width > 0 && width < 1400 ? "Cover image is under 1400px wide — may appear blurry." : null);

    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      updateState({ thumbnailUrl: url });
    } catch {
      setCoverWarning("Upload failed — please try again.");
    } finally {
      setCoverUploading(false);
    }
  };

  // ── save / submit ──

  const buildPayload = (status: "draft" | "pending") => ({
    title: state.title,
    tagline: state.tagline,
    description: state.description,
    category: state.category,
    tags: state.tags,
    year: state.year,
    layoutType: "editor",
    thumbnailUrl: state.thumbnailUrl,
    thumbnailColor: state.thumbnailColor,
    contentBlocks: state.blocks,
    theme: state.theme,
    externalLink: state.externalLink,
    externalLinkLabel: state.externalLinkLabel,
    agencyName: state.agencyName,
    agencyUrl: state.agencyUrl,
    sourceUrl: state.sourceUrl,
    attachments: state.attachments,
    credits: state.credits,
    status,
  });

  const saveDraft = async () => {
    if (!state.title.trim()) return;
    setSaving(true);
    try {
      if (projectId) {
        await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload("draft")),
        });
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload("draft")),
        });
        const data = await res.json();
        if (data.id) setProjectId(data.id);
      }
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    if (!state.title.trim() || !state.description.trim()) return;
    setSubmitting(true);
    try {
      if (projectId) {
        await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "pending" }),
        });
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload("pending")),
        });
        const data = await res.json();
        if (data.id) setProjectId(data.id);
      }
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBlock = state.blocks.find((b) => b.id === selectedId) ?? null;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <span className="text-sm font-semibold text-foreground">
          {state.title.trim() || "Untitled Project"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={saving || !state.title.trim()}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Draft"}
          </button>
          <a
            href={projectId ? `/projects/${projectId}` : "#"}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Preview
          </a>
          <button
            type="button"
            onClick={submitForReview}
            disabled={submitting || !state.title.trim() || !state.description.trim()}
            className="rounded-md bg-foreground px-4 py-1.5 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Submit for Review"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <main className="flex-1 overflow-y-auto bg-muted/30 px-8 py-10">
          <div className="mx-auto max-w-3xl space-y-4">
            {/* Cover image */}
            <div
              className="relative flex min-h-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border"
              style={state.thumbnailUrl ? { borderStyle: "solid" } : { backgroundColor: state.thumbnailColor }}
              onClick={() => coverInputRef.current?.click()}
            >
              {state.thumbnailUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={state.thumbnailUrl} alt="cover" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); updateState({ thumbnailUrl: "" }); }}
                    className="absolute right-3 top-3 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : coverUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">Click to add cover image</p>
                  <p className="text-[10px] text-muted-foreground/60">3200 × 410 px recommended · JPG, PNG, GIF · max 50 MB</p>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handleCoverFile}
              />
            </div>

            {coverWarning && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {coverWarning}
              </div>
            )}

            {/* Blocks */}
            {state.blocks.map((block, idx) => (
              <CanvasBlock
                key={block.id}
                block={block}
                selected={selectedId === block.id}
                isFirst={idx === 0}
                isLast={idx === state.blocks.length - 1}
                onSelect={() => { setSelectedId(block.id); setSidebarTab("edit"); }}
                onMoveUp={() => moveBlock(block.id, -1)}
                onMoveDown={() => moveBlock(block.id, 1)}
                onDelete={() => removeBlock(block.id)}
                onUpdate={(patch) => updateBlock(block.id, patch)}
                uploadingBlocks={uploadingBlocks}
                setUploadingBlocks={setUploadingBlocks}
              />
            ))}

            {state.blocks.length === 0 && (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground">Add content blocks using the sidebar →</p>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-background">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {(["add", "edit"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSidebarTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold capitalize ${
                  sidebarTab === tab
                    ? "border-b-2 border-foreground text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "add" ? "Add Content" : "Edit Project"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === "add" ? (
              <AddContentPanel onAdd={addBlock} />
            ) : (
              <EditProjectPanel
                state={state}
                update={updateState}
                tagInput={tagInput}
                setTagInput={setTagInput}
                selectedBlock={selectedBlock}
                onUpdateBlock={updateBlock}
                uploadingBlocks={uploadingBlocks}
                setUploadingBlocks={setUploadingBlocks}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Add Content Panel ────────────────────────────────────────────────────────

function AddContentPanel({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const items: { type: BlockType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: "image",      label: "Image",       icon: <ImageIcon className="h-4 w-4" />, desc: "Single image with optional caption" },
    { type: "text",       label: "Text",        icon: <Type className="h-4 w-4" />,      desc: "Rich text — bold, italic, headings" },
    { type: "photo_grid", label: "Photo Grid",  icon: <Grid2X2 className="h-4 w-4" />,   desc: "2–4 images in a responsive grid" },
    { type: "video",      label: "Video/Audio", icon: <Video className="h-4 w-4" />,     desc: "YouTube, Vimeo, or SoundCloud embed" },
    { type: "embed",      label: "Embed",       icon: <Code2 className="h-4 w-4" />,     desc: "Paste any HTML embed code" },
  ];
  return (
    <div className="space-y-2">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Content blocks</p>
      {items.map((item) => (
        <button
          key={item.type}
          type="button"
          onClick={() => onAdd(item.type)}
          className="flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/50"
        >
          <span className="mt-0.5 text-muted-foreground">{item.icon}</span>
          <span>
            <span className="block text-sm font-medium text-foreground">{item.label}</span>
            <span className="text-[11px] text-muted-foreground">{item.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Edit Project Panel ───────────────────────────────────────────────────────

function EditProjectPanel({
  state,
  update,
  tagInput,
  setTagInput,
  selectedBlock,
  onUpdateBlock,
  uploadingBlocks,
  setUploadingBlocks,
}: {
  state: EditorState;
  update: (p: Partial<EditorState>) => void;
  tagInput: string;
  setTagInput: (v: string) => void;
  selectedBlock: Block | null;
  onUpdateBlock: (id: string, patch: Partial<Block>) => void;
  uploadingBlocks: Set<string>;
  setUploadingBlocks: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().replace(/,$/, "");
      if (t && !state.tags.includes(t)) update({ tags: [...state.tags, t] });
      setTagInput("");
    }
  };
  const removeTag = (t: string) => update({ tags: state.tags.filter((x) => x !== t) });

  const addCredit = () => update({ credits: [...state.credits, { creditName: "", role: "" }] });
  const updateCredit = (i: number, patch: Partial<Credit>) =>
    update({ credits: state.credits.map((c, ci) => (ci === i ? { ...c, ...patch } : c)) });
  const removeCredit = (i: number) =>
    update({ credits: state.credits.filter((_, ci) => ci !== i) });

  return (
    <div className="space-y-5">
      {/* Selected block editor */}
      {selectedBlock && (
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Edit Block
          </p>
          <BlockEditor
            block={selectedBlock}
            onUpdate={(patch) => onUpdateBlock(selectedBlock.id, patch)}
            uploadingBlocks={uploadingBlocks}
            setUploadingBlocks={setUploadingBlocks}
          />
        </div>
      )}

      {/* Project details */}
      <SidebarSection label="Project Details">
        <SidebarField label="Title">
          <input
            type="text"
            value={state.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Project title"
            className="input-field"
          />
        </SidebarField>
        <SidebarField label="Tagline">
          <input
            type="text"
            value={state.tagline}
            onChange={(e) => update({ tagline: e.target.value })}
            placeholder="One-liner"
            className="input-field"
          />
        </SidebarField>
        <SidebarField label="Description">
          <textarea
            value={state.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Brief summary"
            rows={3}
            className="input-field resize-none"
          />
        </SidebarField>
        <SidebarField label="Category">
          <select
            value={state.category}
            onChange={(e) => update({ category: e.target.value })}
            className="input-field"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </SidebarField>
        <SidebarField label="Year">
          <input
            type="number"
            value={state.year}
            onChange={(e) => update({ year: parseInt(e.target.value, 10) })}
            className="input-field"
          />
        </SidebarField>
        <SidebarField label="Theme">
          <select
            value={state.theme}
            onChange={(e) => update({ theme: e.target.value })}
            className="input-field"
          >
            {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </SidebarField>
        <SidebarField label="Tags">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Type and press Enter"
            className="input-field"
          />
          {state.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {state.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </SidebarField>
      </SidebarSection>

      {/* External link */}
      <SidebarSection label="External Link">
        <SidebarField label="URL">
          <input
            type="url"
            value={state.externalLink}
            onChange={(e) => update({ externalLink: e.target.value })}
            placeholder="https://..."
            className="input-field"
          />
        </SidebarField>
        <SidebarField label="Label">
          <input
            type="text"
            value={state.externalLinkLabel}
            onChange={(e) => update({ externalLinkLabel: e.target.value })}
            placeholder="View Project"
            className="input-field"
          />
        </SidebarField>
      </SidebarSection>

      {/* Agency */}
      <SidebarSection label="Agency">
        <SidebarField label="Agency name">
          <input
            type="text"
            value={state.agencyName}
            onChange={(e) => update({ agencyName: e.target.value })}
            className="input-field"
          />
        </SidebarField>
        <SidebarField label="Agency URL">
          <input
            type="url"
            value={state.agencyUrl}
            onChange={(e) => update({ agencyUrl: e.target.value })}
            placeholder="https://..."
            className="input-field"
          />
        </SidebarField>
        <SidebarField label="Source URL">
          <input
            type="url"
            value={state.sourceUrl}
            onChange={(e) => update({ sourceUrl: e.target.value })}
            placeholder="https://..."
            className="input-field"
          />
        </SidebarField>
      </SidebarSection>

      {/* Credits */}
      <SidebarSection label="Credits">
        <div className="space-y-2">
          {state.credits.map((c, i) => (
            <div key={i} className="flex gap-1.5">
              <input
                type="text"
                value={c.creditName}
                onChange={(e) => updateCredit(i, { creditName: e.target.value })}
                placeholder="Name"
                className="input-field flex-1"
              />
              <input
                type="text"
                value={c.role}
                onChange={(e) => updateCredit(i, { role: e.target.value })}
                placeholder="Role"
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={() => removeCredit(i)}
                className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCredit}
          className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" /> Add credit
        </button>
      </SidebarSection>

      {/* Attachments */}
      <SidebarSection label="Attach Files">
        <AttachmentUploader
          attachments={state.attachments}
          onAdd={(a) => update({ attachments: [...state.attachments, a] })}
          onRemove={(i) => update({ attachments: state.attachments.filter((_, ai) => ai !== i) })}
        />
      </SidebarSection>
    </div>
  );
}

// ─── Block Editor (inline in sidebar) ────────────────────────────────────────

function BlockEditor({
  block,
  onUpdate,
  uploadingBlocks,
  setUploadingBlocks,
}: {
  block: Block;
  onUpdate: (patch: Partial<Block>) => void;
  uploadingBlocks: Set<string>;
  setUploadingBlocks: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadingBlocks.has(block.id);

  const handleImageFile = async (file: File, onDone: (url: string) => void) => {
    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) return;
    if (file.size > 50 * 1024 * 1024) return;

    const { width } = await checkImageDimensions(file);
    if (width > 0 && width < 1400) {
      // Non-blocking warning shown in canvas
    }

    setUploadingBlocks((prev) => new Set(prev).add(block.id));
    try {
      const url = await uploadImage(file);
      onDone(url);
    } finally {
      setUploadingBlocks((prev) => { const s = new Set(prev); s.delete(block.id); return s; });
    }
  };

  if (block.type === "image") {
    return (
      <div className="space-y-2">
        <div
          className="flex min-h-[80px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-muted/40"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : block.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.url} alt="" className="max-h-24 rounded object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">Click to upload</span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImageFile(f, (url) => onUpdate({ url } as Partial<ImageBlock>));
            }}
          />
        </div>
        <input
          type="text"
          value={block.caption}
          onChange={(e) => onUpdate({ caption: e.target.value } as Partial<ImageBlock>)}
          placeholder="Caption (optional)"
          className="input-field"
        />
      </div>
    );
  }

  if (block.type === "text") {
    return (
      <RichTextEditor
        value={block.html}
        onChange={(html) => onUpdate({ html } as Partial<TextBlock>)}
        className="text-xs"
      />
    );
  }

  if (block.type === "photo_grid") {
    return (
      <div className="space-y-2">
        <PhotoGridUploader
          urls={block.urls}
          blockId={block.id}
          onUpdate={(urls) => onUpdate({ urls } as Partial<PhotoGridBlock>)}
          uploadingBlocks={uploadingBlocks}
          setUploadingBlocks={setUploadingBlocks}
        />
        <input
          type="text"
          value={block.caption}
          onChange={(e) => onUpdate({ caption: e.target.value } as Partial<PhotoGridBlock>)}
          placeholder="Caption (optional)"
          className="input-field"
        />
      </div>
    );
  }

  if (block.type === "video") {
    return (
      <div className="space-y-2">
        <input
          type="url"
          value={block.embedUrl}
          onChange={(e) => onUpdate({ embedUrl: e.target.value } as Partial<VideoBlock>)}
          placeholder="YouTube, Vimeo, or SoundCloud URL"
          className="input-field"
        />
        <input
          type="text"
          value={block.caption}
          onChange={(e) => onUpdate({ caption: e.target.value } as Partial<VideoBlock>)}
          placeholder="Caption (optional)"
          className="input-field"
        />
      </div>
    );
  }

  if (block.type === "embed") {
    return (
      <div className="space-y-2">
        <textarea
          value={block.code}
          onChange={(e) => onUpdate({ code: e.target.value } as Partial<EmbedBlock>)}
          placeholder="Paste HTML embed code"
          rows={4}
          className="input-field resize-none font-mono text-[11px]"
        />
        <input
          type="text"
          value={block.caption}
          onChange={(e) => onUpdate({ caption: e.target.value } as Partial<EmbedBlock>)}
          placeholder="Caption (optional)"
          className="input-field"
        />
      </div>
    );
  }

  return null;
}

// ─── Photo Grid Uploader ──────────────────────────────────────────────────────

function PhotoGridUploader({
  urls,
  blockId,
  onUpdate,
  uploadingBlocks,
  setUploadingBlocks,
}: {
  urls: string[];
  blockId: string;
  onUpdate: (urls: string[]) => void;
  uploadingBlocks: Set<string>;
  setUploadingBlocks: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadingBlocks.has(blockId + "_grid");

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(
      (f) => ["image/jpeg", "image/png", "image/gif"].includes(f.type) && f.size <= 50 * 1024 * 1024
    ).slice(0, 4 - urls.length);
    if (validFiles.length === 0) return;

    setUploadingBlocks((prev) => new Set(prev).add(blockId + "_grid"));
    try {
      const newUrls = await Promise.all(validFiles.map(uploadImage));
      onUpdate([...urls, ...newUrls]);
    } finally {
      setUploadingBlocks((prev) => { const s = new Set(prev); s.delete(blockId + "_grid"); return s; });
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        {urls.map((url, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onUpdate(urls.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        {urls.length < 4 && (
          <div
            className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/40"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Plus className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">Up to 4 images</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files));
        }}
      />
    </div>
  );
}

// ─── Attachment Uploader ──────────────────────────────────────────────────────

function AttachmentUploader({
  attachments,
  onAdd,
  onRemove,
}: {
  attachments: Attachment[];
  onAdd: (a: Attachment) => void;
  onRemove: (i: number) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/asset",
      });
      onAdd({ name: file.name, url: blob.url, size: file.size });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {attachments.map((a, i) => (
        <div key={i} className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5">
          <span className="truncate text-[11px] text-foreground">{a.name}</span>
          <button type="button" onClick={() => onRemove(i)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
      >
        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
        Attach file
      </button>
      <p className="text-[10px] text-muted-foreground">PDF, ZIP, fonts, images · max 100 MB</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,.pdf,.ttf,.otf,.woff,.woff2,.svg,image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

// ─── Canvas Block ─────────────────────────────────────────────────────────────

function CanvasBlock({
  block,
  selected,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdate,
  uploadingBlocks,
  setUploadingBlocks,
}: {
  block: Block;
  selected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<Block>) => void;
  uploadingBlocks: Set<string>;
  setUploadingBlocks: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  return (
    <div
      className={`group relative rounded-xl border-2 transition-colors ${
        selected ? "border-foreground" : "border-transparent hover:border-border"
      }`}
      onClick={onSelect}
    >
      {/* Block controls */}
      <div
        className={`absolute -right-1 -top-1 z-10 flex items-center gap-0.5 rounded-lg border border-border bg-background p-0.5 shadow-sm ${
          selected ? "flex" : "hidden group-hover:flex"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!isFirst && (
          <ControlBtn onClick={onMoveUp} title="Move up">
            <ChevronUp className="h-3 w-3" />
          </ControlBtn>
        )}
        {!isLast && (
          <ControlBtn onClick={onMoveDown} title="Move down">
            <ChevronDown className="h-3 w-3" />
          </ControlBtn>
        )}
        <ControlBtn onClick={onDelete} title="Delete" danger>
          <Trash2 className="h-3 w-3" />
        </ControlBtn>
      </div>

      {/* Block content preview */}
      <BlockPreview block={block} uploadingBlocks={uploadingBlocks} />
    </div>
  );
}

function ControlBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded p-1 ${danger ? "text-red-500 hover:bg-red-50" : "text-muted-foreground hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}

// ─── Block Preview (canvas rendering) ────────────────────────────────────────

function BlockPreview({ block, uploadingBlocks }: { block: Block; uploadingBlocks: Set<string> }) {
  const isUploading = uploadingBlocks.has(block.id) || uploadingBlocks.has(block.id + "_grid");

  if (block.type === "image") {
    return (
      <figure className="overflow-hidden rounded-xl">
        {isUploading ? (
          <div className="flex min-h-48 items-center justify-center bg-muted">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : block.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.url} alt={block.caption} className="w-full object-cover" />
        ) : (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40">
            <span className="text-xs text-muted-foreground">No image — edit in sidebar</span>
          </div>
        )}
        {block.caption && (
          <figcaption className="border-t border-border bg-background px-4 py-2 text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "text") {
    return (
      <div
        className="prose prose-sm prose-neutral dark:prose-invert max-w-none rounded-xl bg-background p-5 text-sm"
        dangerouslySetInnerHTML={{ __html: block.html || "<p class='text-muted-foreground'>Empty text block — edit in sidebar</p>" }}
      />
    );
  }

  if (block.type === "photo_grid") {
    const cols = block.urls.length === 1 ? "grid-cols-1" : block.urls.length === 2 ? "grid-cols-2" : "grid-cols-2";
    return (
      <figure className="overflow-hidden rounded-xl">
        {block.urls.length > 0 ? (
          <div className={`grid ${cols} gap-0.5`}>
            {block.urls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="aspect-square w-full object-cover" />
            ))}
          </div>
        ) : (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-xs text-muted-foreground">No images — edit in sidebar</span>
            )}
          </div>
        )}
        {block.caption && (
          <figcaption className="border-t border-border bg-background px-4 py-2 text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "video") {
    const embedSrc = getVideoEmbedSrc(block.embedUrl);
    return (
      <figure className="overflow-hidden rounded-xl">
        {embedSrc ? (
          <div className="aspect-video">
            <iframe
              src={embedSrc}
              allow="autoplay; fullscreen"
              className="h-full w-full border-0"
              title={block.caption || "video"}
            />
          </div>
        ) : (
          <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40">
            <span className="text-xs text-muted-foreground">Paste a URL in the sidebar to embed</span>
          </div>
        )}
        {block.caption && (
          <figcaption className="border-t border-border bg-background px-4 py-2 text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "embed") {
    return (
      <figure className="overflow-hidden rounded-xl border border-border bg-background">
        {block.code ? (
          <div
            className="p-4"
            dangerouslySetInnerHTML={{ __html: block.code }}
          />
        ) : (
          <div className="flex min-h-24 items-center justify-center p-4">
            <span className="text-xs text-muted-foreground">Paste embed code in the sidebar</span>
          </div>
        )}
        {block.caption && (
          <figcaption className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVideoEmbedSrc(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be")
        ? u.pathname.slice(1)
        : u.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    // SoundCloud
    if (u.hostname.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&visual=true`;
    }
  } catch {
    // ignore
  }
  return null;
}

// ─── Sidebar helpers ──────────────────────────────────────────────────────────

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SidebarField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-0.5 block text-[11px] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
