"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerifyToggle({ id, isVerified }: { id: string; isVerified: boolean }) {
  const router = useRouter();
  const [verified, setVerified] = useState(isVerified);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/designers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !verified }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setVerified(data.isVerified);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={loading}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
          verified
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
        }`}
      >
        {loading ? "…" : verified ? "✓ Verified" : "Verify"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
