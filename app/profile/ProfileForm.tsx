"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRIMARY_ROLES } from "@/lib/data/designers";

const ALL_TOOLS = [
  "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign",
  "After Effects", "Cinema 4D", "Blender", "Webflow", "Framer",
];

type DesignerProfile = {
  displayName: string;
  title: string;
  bio: string;
  locationCity: string;
  locationCountry: string;
  locationCountryCode: string;
  primaryRoles: string[];
  specialties: string[];
  tools: string[];
  availability: string;
  experienceLevel: string;
  contactEmail: string;
  contactWebsite: string;
  contactLinkedin: string;
  contactInstagram: string;
  contactBehance: string;
  contactDribbble: string;
};

type AgencyProfile = {
  displayName: string;
  bio: string;
  locationCity: string;
  locationCountry: string;
  locationCountryCode: string;
  teamSize: string;
  specialties: string[];
  pastClients: string[];
  contactEmail: string;
  contactWebsite: string;
  contactLinkedin: string;
  contactInstagram: string;
  contactBehance: string;
  contactDribbble: string;
};

export function DesignerProfileForm({ initial }: { initial: DesignerProfile }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function set(field: keyof DesignerProfile, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArray(field: "primaryRoles" | "specialties" | "tools", val: string) {
    setForm((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Basic Info">
        <Field label="Display Name">
          <input
            className={inputClass}
            value={form.displayName}
            onChange={(e) => set("displayName", e.target.value)}
            required
          />
        </Field>
        <Field label="Title / Tagline">
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Brand Director building identities that last"
          />
        </Field>
        <Field label="Bio">
          <textarea
            className={`${inputClass} min-h-[120px]`}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="City">
            <input className={inputClass} value={form.locationCity} onChange={(e) => set("locationCity", e.target.value)} />
          </Field>
          <Field label="Country">
            <input className={inputClass} value={form.locationCountry} onChange={(e) => set("locationCountry", e.target.value)} />
          </Field>
          <Field label="Country Code">
            <input className={inputClass} value={form.locationCountryCode} onChange={(e) => set("locationCountryCode", e.target.value)} placeholder="e.g. DE" maxLength={3} />
          </Field>
        </div>
      </Section>

      <Section title="Primary Roles">
        <div className="flex flex-wrap gap-2">
          {PRIMARY_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggleArray("primaryRoles", r)}
              className={tagButton(form.primaryRoles.includes(r))}
            >
              {r}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Tools">
        <div className="flex flex-wrap gap-2">
          {ALL_TOOLS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleArray("tools", t)}
              className={tagButton(form.tools.includes(t))}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          className={`${inputClass} mt-3`}
          placeholder="Add custom tool (press Enter)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const val = e.currentTarget.value.trim();
              if (val && !form.tools.includes(val)) {
                set("tools", [...form.tools, val]);
                e.currentTarget.value = "";
              }
            }
          }}
        />
        {form.tools.filter((t) => !ALL_TOOLS.includes(t)).map((t) => (
          <span key={t} className="mr-2 mt-2 inline-flex items-center gap-1 rounded-full bg-foreground/10 px-3 py-1 text-sm">
            {t}
            <button type="button" onClick={() => set("tools", form.tools.filter((x) => x !== t))} className="ml-1 opacity-60 hover:opacity-100">×</button>
          </span>
        ))}
      </Section>

      <Section title="Availability &amp; Experience">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Availability">
            <select className={inputClass} value={form.availability} onChange={(e) => set("availability", e.target.value)}>
              <option value="available">Available for work</option>
              <option value="freelance">Freelance only</option>
              <option value="unavailable">Not available</option>
            </select>
          </Field>
          <Field label="Experience Level">
            <select className={inputClass} value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
              <option value="junior">Junior (0–3 years)</option>
              <option value="mid">Mid (3–7 years)</option>
              <option value="senior">Senior (7+ years)</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Contact &amp; Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email"><input type="email" className={inputClass} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></Field>
          <Field label="Website"><input type="url" className={inputClass} value={form.contactWebsite} onChange={(e) => set("contactWebsite", e.target.value)} placeholder="https://" /></Field>
          <Field label="LinkedIn"><input type="url" className={inputClass} value={form.contactLinkedin} onChange={(e) => set("contactLinkedin", e.target.value)} placeholder="https://linkedin.com/in/..." /></Field>
          <Field label="Instagram"><input type="url" className={inputClass} value={form.contactInstagram} onChange={(e) => set("contactInstagram", e.target.value)} placeholder="https://instagram.com/..." /></Field>
          <Field label="Behance"><input type="url" className={inputClass} value={form.contactBehance} onChange={(e) => set("contactBehance", e.target.value)} placeholder="https://behance.net/..." /></Field>
          <Field label="Dribbble"><input type="url" className={inputClass} value={form.contactDribbble} onChange={(e) => set("contactDribbble", e.target.value)} placeholder="https://dribbble.com/..." /></Field>
        </div>
      </Section>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Profile saved successfully.</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </form>
  );
}

export function AgencyProfileForm({ initial }: { initial: AgencyProfile }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function set(field: keyof AgencyProfile, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSpecialty(val: string) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(val)
        ? prev.specialties.filter((x) => x !== val)
        : [...prev.specialties, val],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Basic Info">
        <Field label="Agency Name">
          <input className={inputClass} value={form.displayName} onChange={(e) => set("displayName", e.target.value)} required />
        </Field>
        <Field label="About">
          <textarea className={`${inputClass} min-h-[120px]`} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </Field>
        <Field label="Team Size">
          <input className={inputClass} value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} placeholder="e.g. 2–10" />
        </Field>
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="City"><input className={inputClass} value={form.locationCity} onChange={(e) => set("locationCity", e.target.value)} /></Field>
          <Field label="Country"><input className={inputClass} value={form.locationCountry} onChange={(e) => set("locationCountry", e.target.value)} /></Field>
          <Field label="Country Code"><input className={inputClass} value={form.locationCountryCode} onChange={(e) => set("locationCountryCode", e.target.value)} placeholder="e.g. US" maxLength={3} /></Field>
        </div>
      </Section>

      <Section title="Specialties">
        <div className="flex flex-wrap gap-2">
          {PRIMARY_ROLES.map((s) => (
            <button key={s} type="button" onClick={() => toggleSpecialty(s)} className={tagButton(form.specialties.includes(s))}>
              {s}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Past Clients">
        <input
          className={inputClass}
          placeholder="Add client name (press Enter)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const val = e.currentTarget.value.trim();
              if (val && !form.pastClients.includes(val)) {
                set("pastClients", [...form.pastClients, val]);
                e.currentTarget.value = "";
              }
            }
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {form.pastClients.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-3 py-1 text-sm">
              {c}
              <button type="button" onClick={() => set("pastClients", form.pastClients.filter((x) => x !== c))} className="ml-1 opacity-60 hover:opacity-100">×</button>
            </span>
          ))}
        </div>
      </Section>

      <Section title="Contact &amp; Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email"><input type="email" className={inputClass} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></Field>
          <Field label="Website"><input type="url" className={inputClass} value={form.contactWebsite} onChange={(e) => set("contactWebsite", e.target.value)} placeholder="https://" /></Field>
          <Field label="LinkedIn"><input type="url" className={inputClass} value={form.contactLinkedin} onChange={(e) => set("contactLinkedin", e.target.value)} placeholder="https://linkedin.com/company/..." /></Field>
          <Field label="Instagram"><input type="url" className={inputClass} value={form.contactInstagram} onChange={(e) => set("contactInstagram", e.target.value)} placeholder="https://instagram.com/..." /></Field>
          <Field label="Behance"><input type="url" className={inputClass} value={form.contactBehance} onChange={(e) => set("contactBehance", e.target.value)} placeholder="https://behance.net/..." /></Field>
          <Field label="Dribbble"><input type="url" className={inputClass} value={form.contactDribbble} onChange={(e) => set("contactDribbble", e.target.value)} placeholder="https://dribbble.com/..." /></Field>
        </div>
      </Section>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Profile saved successfully.</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20";

function tagButton(active: boolean) {
  return `rounded-full border px-3 py-1 text-sm transition-colors ${
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background text-foreground hover:border-foreground/40"
  }`;
}
