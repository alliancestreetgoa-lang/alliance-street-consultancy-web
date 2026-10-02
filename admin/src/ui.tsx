import { useEffect, useRef, useState, type ReactNode } from "react";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return <span className="row" role="status"><span className="spinner" aria-hidden /> <span className="muted">{label}…</span></span>;
}

export function ErrorNotice({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="notice bad" role="alert">
      <div className="spread">
        <span>{message}</span>
        {onRetry ? <button className="btn small" onClick={onRetry}>Try again</button> : null}
      </div>
    </div>
  );
}

export function Badge({ tone, children }: { tone: "ok" | "warn" | "bad" | "info" | "neutral"; children: ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="empty"><h3>{title}</h3>{children ? <div className="small">{children}</div> : null}</div>;
}

/**
 * Confirmation for anything destructive or public. `confirmText` makes the
 * person type a word for the riskiest actions (deleting a lead).
 */
export function Confirm({
  open, title, children, actionLabel, danger, confirmText, busy, onConfirm, onCancel,
}: {
  open: boolean; title: string; children: ReactNode; actionLabel: string; danger?: boolean;
  confirmText?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) { setTyped(""); dialog.showModal(); }
    if (!open && dialog.open) dialog.close();
  }, [open]);
  const blocked = !!confirmText && typed.trim().toLowerCase() !== confirmText.toLowerCase();
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); if (!busy) onCancel(); }} aria-labelledby="confirm-title">
      <div className="body">
        <h2 id="confirm-title">{title}</h2>
        <div className="muted">{children}</div>
        {confirmText ? (
          <label className="field">Type “{confirmText}” to confirm
            <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
          </label>
        ) : null}
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={`btn ${danger ? "danger" : "primary"}`} onClick={onConfirm} disabled={busy || blocked}>
            {busy ? "Working…" : actionLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function timeAgo(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(date: Date | null | undefined) {
  return date ? date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
}
