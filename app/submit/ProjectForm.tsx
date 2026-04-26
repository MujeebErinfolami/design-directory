"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/submit/ImageUpload";
import { GalleryUpload } from "@/components/submit/GalleryUpload";
import {
  ContentBlockEditor,
  type ContentBlock,
} from "@/components/submit/ContentBlockEditor";

const CATEGORIES = ["Branding", "Web", "Motion", "Print", "Product", "UX"] as const;

type LayoutType = "case_study" | "gallery";
type Credit = { creditName: string; role: string };

export function ProjectForm() {
  const router = useRouter();

  // Core fields
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [year, setYear] = useState(String(new Date().getFullYear()));

  // Layout
  const [layoutType, setLayoutType] = useState<LayoutType>("case_study");

  // Images
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  // Metadata
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agencyUrl, setAgencyUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [credits, setCredits] = useState<Credit[]>([{ creditName: "", role: "" }]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTag() {
    const val = tagsInput.trim();
    if (val && !tags.includes(val)) setTags((t) => [...t, val]);
    setTagsInput("");
  }

  function updateCredit(i: number, field: keyof Credit, val: string) {
    setCredits((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coverImageUrl) { setError("Cover image is required."); return; }
    if (layoutType === "gallery" && galleryUrls.length === 0) {
      setError("Add at least one gallery image.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline,
          description,
          category,
          year: parseInt(year, 10),
          layoutType,
          thumbnailUrl: coverImageUrl,
          contentBlocks: layoutType === "case_study" ? contentBlocks : [],
          galleryUrls: layoutType === "gallery" ? galleryUrls : [],
          tags,
          agencyName,
          agencyUrl,
          sourceUrl,
          credits: credits.filter((c) => c.creditName.trim()),
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

      {/* ── Core info ── */}
      <section className="space-y-5">
        <h2 className={sectionHead}>Project Info</h2>

        <div>
          <label className={labelClass}>Title <Required /></label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Saigon Coffee Co. Brand Identity" />
        </div>

        <div>
          <label className={labelClass}>Tagline</label>
          <input className={inputClass} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One sentence that captures the project" />
        </div>

        <div>
          <label className={labelClass}>Description <Required /></label>
          <textarea
            className={`${inputClass} min-h-[90px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="1–2 sentences. Shown in project cards and search results."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Category <Required /></label>
            <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Year</label>
            <input type="number" className={inputClass} value={year} onChange={(e) => setYear(e.target.value)} min="1990" max={new Date().getFullYear() + 1} />
          </div>
        </div>
      </section>

      {/* ── Layout type ── */}
      <section className="space-y-4">
        <h2 className={sectionHead}>Layout</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["case_study", "gallery"] as LayoutType[]).map((lt) => (
            <button
              key={lt}
              type="button"
              onClick={() => setLayoutType(lt)}
              className={`rounded-xl border-2 p-5 text-left transition-all ${layoutType === lt ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/30"}`}
            >
              <p className="font-semibold text-sm">
                {lt === "case_study" ? "Case Study" : "Gallery"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {lt === "case_study"
                  ? "Hero image + ordered text and image blocks"
                  : "Up to 12 images in a grid + description"}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Cover image (always) ── */}
      <section className="space-y-4">
        <h2 className={sectionHead}>Cover Image</h2>
        <ImageUpload
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          aspectClass="aspect-video"
          required
        />
        <p className="text-xs text-muted-foreground">
          Used as the project thumbnail across the site.
        </p>
      </section>

      {/* ── Case study content blocks ── */}
      {layoutType === "case_study" && (
        <section className="space-y-4">
          <h2 className={sectionHead}>Content Blocks</h2>
          <p className="text-sm text-muted-foreground">
            Add text and image blocks in the order you want them to appear on the project page.
          </p>
          <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
        </section>
      )}

      {/* ── Gallery images ── */}
      {layoutType === "gallery" && (
        <section className="space-y-4">
          <h2 className={sectionHead}>Gallery Images <Required /></h2>
          <GalleryUpload urls={galleryUrls} onChange={setGalleryUrls} max={12} />
        </section>
      )}

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

      {/* ── Agency / source ── */}
      <section className="space-y-4">
        <h2 className={sectionHead}>Agency &amp; Source</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Agency Name</label>
            <input className={inputClass} value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="Studio or agency" />
          </div>
          <div>
            <label className={labelClass}>Agency URL</label>
            <input type="url" className={inputClass} value={agencyUrl} onChange={(e) => setAgencyUrl(e.target.value)} placeholder="https://" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Project / Source URL</label>
          <input type="url" className={inputClass} value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://" />
        </div>
      </section>

      {/* ── Credits ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={sectionHead}>Credits</h2>
          <button type="button" onClick={() => setCredits((p) => [...p, { creditName: "", role: "" }])} className={secondaryBtn}>
            + Add credit
          </button>
        </div>
        {credits.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputClass} value={c.creditName} onChange={(e) => updateCredit(i, "creditName", e.target.value)} placeholder="Name" />
            <input className={`${inputClass} max-w-[180px]`} value={c.role} onChange={(e) => updateCredit(i, "role", e.target.value)} placeholder="Role" />
            {credits.length > 1 && (
              <button type="button" onClick={() => setCredits((p) => p.filter((_, idx) => idx !== i))} className="shrink-0 text-muted-foreground hover:text-foreground">×</button>
            )}
          </div>
        ))}
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
          {submitting ? "Submitting…" : "Submit Project"}
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
