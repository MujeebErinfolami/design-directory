"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface Props {
  name: string;
  email: string;
}

export function SettingsForm({ name, email }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Account */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Account</h2>
        <div className="space-y-4 rounded-xl border border-border p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-sm text-foreground">{name || "—"}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm text-foreground">{email || "—"}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Name and email are managed by your Google account and cannot be changed here.
          </p>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Preferences</h2>
        <div className="rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Get notified when your submissions are reviewed.
              </p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Coming soon
            </span>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-red-600">Danger Zone</h2>
        <div className="rounded-xl border border-red-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            {!confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
              >
                Delete account
              </button>
            )}
          </div>

          {confirmDelete && (
            <div className="mt-4 space-y-3 border-t border-red-200 pt-4">
              <p className="text-sm text-red-700">
                Type <strong>DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-lg border border-red-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "DELETE" || deleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </button>
                <button
                  onClick={() => { setConfirmDelete(false); setDeleteInput(""); }}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:border-foreground/40 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
