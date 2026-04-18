"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AccountType = "designer" | "agency";
type Step = "choose" | "profile";

const SPECIALTIES = [
  "Branding", "Typography", "UI/UX", "Motion", "Illustration",
  "Web Design", "Print", "Packaging", "Product", "3D",
];

export function OnboardingForm({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    displayName: userName ?? "",
    title: "",
    bio: "",
    locationCity: "",
    locationCountry: "",
    teamSize: "",
    specialties: [] as string[],
  });

  function toggleSpecialty(s: string) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (step === "choose") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Design Directory</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            How would you like to use the platform?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => { setAccountType("designer"); setStep("profile"); }}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-background p-6 text-center transition-all hover:border-foreground hover:shadow-md"
          >
            <span className="text-3xl">🎨</span>
            <div>
              <p className="font-semibold">Designer</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Share your portfolio and get discovered
              </p>
            </div>
          </button>

          <button
            onClick={() => { setAccountType("agency"); setStep("profile"); }}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-background p-6 text-center transition-all hover:border-foreground hover:shadow-md"
          >
            <span className="text-3xl">🏢</span>
            <div>
              <p className="font-semibold">Agency</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Showcase your studio's work and team
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => setStep("choose")}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold tracking-tight">
          Set up your {accountType === "designer" ? "designer" : "agency"} profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You can edit these details later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label={accountType === "designer" ? "Full name" : "Studio name"}
          required
        >
          <input
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            required
            className={inputCls}
          />
        </Field>

        {accountType === "designer" && (
          <Field label="Title / Role">
            <input
              placeholder="e.g. Brand & Type Designer"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputCls}
            />
          </Field>
        )}

        {accountType === "agency" && (
          <Field label="Team size">
            <select
              value={form.teamSize}
              onChange={(e) => setForm((f) => ({ ...f, teamSize: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select…</option>
              {["1-5", "6-15", "16-50", "51-100", "100+"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Bio">
          <textarea
            placeholder="A short intro about yourself or your studio…"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input
              value={form.locationCity}
              onChange={(e) => setForm((f) => ({ ...f, locationCity: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Country">
            <input
              value={form.locationCountry}
              onChange={(e) => setForm((f) => ({ ...f, locationCountry: e.target.value }))}
              className={inputCls}
            />
          </Field>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Specialties</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  form.specialties.includes(s)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {loading ? "Setting up…" : "Continue to dashboard"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children, required }: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
