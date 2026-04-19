"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "pending" | "approved" | "rejected";

export function ReviewActions({ id, currentStatus }: { id: string; currentStatus: Status }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<Status>(currentStatus);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: action === "reject" ? reason : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      setStatus(data.status);
      setShowReject(false);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  if (status === "approved") {
    return <StatusBadge status="approved" />;
  }

  if (status === "rejected" && !showReject) {
    return (
      <div className="flex items-center gap-2">
        <StatusBadge status="rejected" />
        <button
          onClick={() => setShowReject(true)}
          className={secondaryBtn}
        >
          Re-review
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showReject ? (
        <>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason (optional)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => act("reject")}
              disabled={loading}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {loading ? "…" : "Confirm Reject"}
            </button>
            <button onClick={() => setShowReject(false)} className={secondaryBtn}>Cancel</button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          {status === "pending" && <StatusBadge status="pending" />}
          <button
            onClick={() => act("approve")}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "…" : "Approve"}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={loading}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending:  "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<Status, string> = {
    pending:  "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

const secondaryBtn = "rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:border-foreground/40 transition-colors";
