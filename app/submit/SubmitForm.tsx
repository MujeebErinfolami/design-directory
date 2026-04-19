"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Branding", "Web", "Motion", "Print", "Product", "UX"] as const;

type Credit = { creditName: string; role: string };

export function SubmitForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [agencyName, setAgencyName] = useState("");
  const [agencyUrl, setAgencyUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [credits, setCredits] = useState<Credit[]>([{ creditName: "", role: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTag() {
    const val = tagsInput.trim();
    if (val && !tags.includes(val)) setTags((prev) => [...prev, val]);
    setTagsInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function updateCredit(index: number, field: keyof Credit, value: string) {
    setCredits((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function addCredit() {
    setCredits((prev) => [...prev, { creditName: "", role: "" }]);
  }

  function removeCredit(index: number) {
    setCredits((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const validCredits = credits.filter((c) => c.creditName.trim());
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          tags,
          year: parseInt(year, 10),
          agencyName,
          agencyUrl,
          sourceUrl,
          credits: validCredits,
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Project Title <span className="text-red-500">*</span></label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Helvetica Identity System"
          />
        </div>

        <div>
          <label className={labelClass}>Short Description <span className="text-red-500">*</span></label>
          <textarea
            className={`${inputClass} min-h-[100px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="1–2 sentences describing the project."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Category <span className="text-red-500">*</span></label>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input
            type="number"
            className={inputClass}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="1990"
            max={new Date().getFullYear() + 1}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tags</label>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Add a tag"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          />
          <button type="button" onClick={addTag} className={secondaryButtonClass}>Add</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-3 py-1 text-sm">
              {t}
              <button type="button" onClick={() => removeTag(t)} className="ml-1 opacity-60 hover:opacity-100">×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold">Agency / Source</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Agency Name</label>
            <input className={inputClass} value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="Studio or agency name" />
          </div>
          <div>
            <label className={labelClass}>Agency URL</label>
            <input type="url" className={inputClass} value={agencyUrl} onChange={(e) => setAgencyUrl(e.target.value)} placeholder="https://" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Source / Behance / Project URL</label>
          <input type="url" className={inputClass} value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Credits</h2>
          <button type="button" onClick={addCredit} className={secondaryButtonClass}>+ Add credit</button>
        </div>
        {credits.map((credit, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputClass}
              value={credit.creditName}
              onChange={(e) => updateCredit(i, "creditName", e.target.value)}
              placeholder="Person or team name"
            />
            <input
              className={`${inputClass} max-w-[160px]`}
              value={credit.role}
              onChange={(e) => updateCredit(i, "role", e.target.value)}
              placeholder="Role"
            />
            {credits.length > 1 && (
              <button
                type="button"
                onClick={() => removeCredit(i)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Remove credit"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">All submissions are reviewed before publishing.</p>
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

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

const secondaryButtonClass =
  "shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:border-foreground/40 transition-colors";
