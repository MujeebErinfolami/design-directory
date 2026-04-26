"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/submit/ImageUpload";
import {
  RichContentEditor,
  type RichBlock,
} from "@/components/submit/RichContentEditor";

const CATEGORIES = [
  "Branding", "UX", "Motion", "Typography", "Process",
  "Color", "Career", "Layout", "Strategy",
] as const;

export function BlogPostForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [contentBlocks, setContentBlocks] = useState<RichBlock[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTag() {
    const val = tagsInput.trim();
    if (val && !tags.includes(val)) setTags((t) => [...t, val]);
    setTagsInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (contentBlocks.length === 0) {
      setError("Add at least one content block.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          coverImageUrl,
          category,
          contentBlocks,
          tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      router.push("/submissions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {/* ── Title & subtitle ── */}
      <section className="space-y-5">
        <h2 className={sectionHead}>Article Info</h2>

        <div>
          <label className={labelClass}>Title <Required /></label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. The Brief Is a Lie"
          />
        </div>

        <div>
          <label className={labelClass}>Subtitle</label>
          <input
            className={inputClass}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="One sentence that draws readers in"
          />
        </div>

        <div>
          <label className={labelClass}>Category <Required /></label>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </section>

      {/* ── Cover image ── */}
      <section className="space-y-4">
        <h2 className={sectionHead}>Cover Image</h2>
        <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} aspectClass="aspect-video" />
        <p className="text-xs text-muted-foreground">Shown at the top of the article and in blog listings.</p>
      </section>

      {/* ── Content ── */}
      <section className="space-y-4">
        <h2 className={sectionHead}>Content <Required /></h2>
        <p className="text-sm text-muted-foreground">
          Build your article with paragraphs, section headings, and images.
        </p>
        <RichContentEditor blocks={contentBlocks} onChange={setContentBlocks} />
      </section>

      {/* ── Tags ── */}
      <section className="space-y-4">
        <h2 className={sectionHead}>Tags</h2>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. branding, typography"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          />
          <button type="button" onClick={addTag} className={secondaryBtn}>Add</button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-3 py-1 text-sm">
                {t}
                <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))} className="ml-1 opacity-60 hover:opacity-100">×</button>
              </span>
            ))}
          </div>
        )}
      </section>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">Reviewed before publishing.</p>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Article"}
        </button>
      </div>
    </form>
  );
}

function Required() {
  return <span className="text-red-500">*</span>;
}

const sectionHead = "text-base font-semibold";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20";
const secondaryBtn =
  "shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:border-foreground/40 transition-colors";
