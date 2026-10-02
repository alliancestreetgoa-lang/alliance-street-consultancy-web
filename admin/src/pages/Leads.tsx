import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, Timestamp, writeBatch,
} from "firebase/firestore/lite";
import { db } from "../firebase";
import { StaffGate } from "../StaffGate";
import type { StaffRole } from "../hooks";
import { Badge, Confirm, Empty, ErrorNotice, Spinner, formatDateTime, timeAgo } from "../ui";

/**
 * Consultation leads saved by the public form (collection `leads`), joined with
 * staff follow-up state (`leadAdmin`). Visitor-submitted fields are read-only
 * here and in the database rules.
 */

const STATUSES = [
  { value: "new", label: "New", tone: "info" },
  { value: "contacted", label: "Contacted", tone: "neutral" },
  { value: "qualified", label: "Qualified", tone: "neutral" },
  { value: "proposal", label: "Proposal sent", tone: "warn" },
  { value: "won", label: "Client won", tone: "ok" },
  { value: "lost", label: "Not proceeding", tone: "neutral" },
  { value: "spam", label: "Spam / test", tone: "bad" },
] as const;
type Status = (typeof STATUSES)[number]["value"];
const statusInfo = (s: Status) => STATUSES.find((x) => x.value === s) ?? STATUSES[0];

const SERVICES = ["UAE Setup", "UAE Tax & Compliance", "UK Services", "Advisory"];
const MAX_LEADS = 1000;

type Lead = {
  id: string; name: string; country: string; email: string; phone: string; address: string; services: string[];
  notes: string; source: string; createdAt: Date | null; updatedAt: Date | null;
  enquiryRequested: boolean; bookingRequested: boolean;
  admin: { status: Status; meetingConfirmed: boolean; meetingAt: Date | null; notes: string; updatedBy?: string; updatedAt?: Date | null };
};

const toDate = (v: unknown) => (v instanceof Timestamp ? v.toDate() : null);

async function loadLeads(): Promise<{ leads: Lead[]; truncated: boolean }> {
  const [leadSnap, adminSnap] = await Promise.all([
    getDocs(query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(MAX_LEADS))),
    getDocs(collection(db, "leadAdmin")),
  ]);
  const admin = new Map(adminSnap.docs.map((d) => [d.id, d.data()]));
  const leads = leadSnap.docs.map((d) => {
    const v = d.data();
    const a = admin.get(d.id);
    return {
      id: d.id, name: v.name ?? "", country: v.country ?? "", email: v.email ?? "", phone: v.phone ?? "",
      address: v.address ?? "", services: v.services ?? [], notes: v.notes ?? "", source: v.source ?? "",
      createdAt: toDate(v.createdAt), updatedAt: toDate(v.updatedAt),
      enquiryRequested: !!v.enquiryRequested, bookingRequested: !!v.bookingRequested,
      admin: {
        status: (a?.status ?? "new") as Status, meetingConfirmed: !!a?.meetingConfirmed, meetingAt: toDate(a?.meetingAt),
        notes: a?.notes ?? "", updatedBy: a?.updatedBy, updatedAt: toDate(a?.updatedAt),
      },
    } satisfies Lead;
  });
  return { leads, truncated: leadSnap.size >= MAX_LEADS };
}

/** Neutralises spreadsheet formulas (CSV injection) and quotes every cell. */
function csvCell(value: unknown) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function exportCsv(rows: Lead[]) {
  const header = ["Lead ID", "Received", "Name", "Email", "Phone", "Country", "Address", "Services", "Visitor notes", "Form",
    "Enquiry requested", "Booking calendar opened", "Status", "Meeting confirmed by staff", "Meeting time", "Staff notes"];
  const lines = rows.map((l) => [
    l.id, l.createdAt?.toISOString() ?? "", l.name, l.email, l.phone, l.country, l.address, l.services.join("; "), l.notes,
    l.source, l.enquiryRequested ? "yes" : "no", l.bookingRequested ? "yes" : "no", statusInfo(l.admin.status).label,
    l.admin.meetingConfirmed ? "yes" : "no", l.admin.meetingAt?.toISOString() ?? "", l.admin.notes,
  ].map(csvCell).join(","));
  const blob = new Blob([`﻿${[header.map(csvCell).join(","), ...lines].join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `alliance-street-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Leads() {
  return (
    <div className="stack">
      <div>
        <h1>Leads</h1>
        <p className="lede">
          People who pressed Continue on the consultation or appointment form. Their details are saved at that moment,
          before they choose an enquiry or the calendar. Opening the booking calendar is <strong>not</strong> a confirmed
          meeting — tick “meeting confirmed” only once you have seen the booking.
        </p>
      </div>
      <StaffGate>{(staff) => <LeadTable {...staff} />}</StaffGate>
    </div>
  );
}

function LeadTable({ email, role }: { email: string; role: StaffRole }) {
  const [data, setData] = useState<{ leads: Lead[]; truncated: boolean } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | Status>("");
  const [step, setStep] = useState("");
  const [service, setService] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await loadLeads()); } catch (e) { setError(e); } finally { setLoading(false); }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
  useEffect(() => { void reload(); }, [reload]);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate_ = to ? new Date(`${to}T23:59:59`) : null;
    return data.leads.filter((l) => {
      if (q && ![l.name, l.email, l.phone, l.country, l.notes, l.admin.notes, l.id].some((v) => v.toLowerCase().includes(q))) return false;
      if (status && l.admin.status !== status) return false;
      if (service && !l.services.includes(service)) return false;
      if (step === "enquiry" && !l.enquiryRequested) return false;
      if (step === "calendar" && !l.bookingRequested) return false;
      if (step === "confirmed" && !l.admin.meetingConfirmed) return false;
      if (step === "none" && (l.enquiryRequested || l.bookingRequested)) return false;
      if (fromDate && (!l.createdAt || l.createdAt < fromDate)) return false;
      if (toDate_ && (!l.createdAt || l.createdAt > toDate_)) return false;
      return true;
    });
  }, [data, search, status, service, step, from, to]);

  const current = data?.leads.find((l) => l.id === selected) ?? null;
  const canExport = role === "admin" || role === "publisher";

  if (loading && !data) return <Spinner label="Loading leads" />;
  if (error) return <ErrorNotice error={explainFirestore(error)} onRetry={reload} />;
  if (!data) return null;

  return (
    <div className="stack">
      <div className="card flat stack">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
          <label className="field">Search
            <input type="search" placeholder="Name, email, phone, notes…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <label className="field">Status
            <select value={status} onChange={(e) => setStatus(e.target.value as Status | "")}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label className="field">Visitor’s next step
            <select value={step} onChange={(e) => setStep(e.target.value)}>
              <option value="">Any</option>
              <option value="enquiry">Requested an enquiry</option>
              <option value="calendar">Opened the booking calendar</option>
              <option value="confirmed">Meeting confirmed by staff</option>
              <option value="none">Saved details only</option>
            </select>
          </label>
          <label className="field">Service
            <select value={service} onChange={(e) => setService(e.target.value)}>
              <option value="">All services</option>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="field">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
        <div className="spread">
          <span className="muted small" aria-live="polite">
            Showing {rows.length} of {data.leads.length} lead{data.leads.length === 1 ? "" : "s"}
            {data.truncated ? ` (latest ${MAX_LEADS} only)` : ""}
          </span>
          <div className="row">
            <button className="btn small" onClick={reload} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
            {canExport ? (
              <button className="btn small" onClick={() => exportCsv(rows)} disabled={!rows.length}
                title="Downloads the leads currently shown. Store the file securely and delete it when done.">
                Export {rows.length} to CSV
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {data.leads.length === 0 ? (
        <div className="card"><Empty title="No leads yet">Leads appear here as soon as a visitor presses Continue on a booking form.</Empty></div>
      ) : rows.length === 0 ? (
        <div className="card"><Empty title="No leads match these filters" /></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Received</th><th>Name</th><th>Contact</th><th>Services</th><th>Next step</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="clickable" aria-selected={l.id === selected} tabIndex={0}
                  onClick={() => setSelected(l.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(l.id); } }}>
                  <td className="small" title={formatDateTime(l.createdAt)}>{timeAgo(l.createdAt)}</td>
                  <td><strong>{l.name}</strong><div className="small muted">{l.country}</div></td>
                  <td className="small">{l.email}<br />{l.phone}</td>
                  <td className="small">{l.services.join(", ")}</td>
                  <td className="small"><NextStep lead={l} /></td>
                  <td><Badge tone={statusInfo(l.admin.status).tone}>{statusInfo(l.admin.status).label}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {current ? (
        <LeadDrawer key={current.id} lead={current} staffEmail={email} role={role}
          onClose={() => setSelected(null)}
          onSaved={reload}
          onDeleted={() => { setSelected(null); void reload(); }} />
      ) : null}
    </div>
  );
}

function NextStep({ lead }: { lead: Lead }) {
  const parts: string[] = [];
  if (lead.enquiryRequested) parts.push("Enquiry requested");
  if (lead.admin.meetingConfirmed) parts.push("Meeting confirmed");
  else if (lead.bookingRequested) parts.push("Calendar opened");
  return <>{parts.length ? parts.join(" · ") : <span className="muted">Details saved only</span>}</>;
}

type HistoryEntry = { id: string; status: Status; meetingConfirmed: boolean; note?: string; by: string; at: Date | null };

function LeadDrawer({ lead, staffEmail, role, onClose, onSaved, onDeleted }: {
  lead: Lead; staffEmail: string; role: StaffRole; onClose: () => void; onSaved: () => void; onDeleted: () => void;
}) {
  const [status, setStatus] = useState<Status>(lead.admin.status);
  const [meetingConfirmed, setMeetingConfirmed] = useState(lead.admin.meetingConfirmed);
  const [meetingAt, setMeetingAt] = useState(lead.admin.meetingAt ? toLocalInput(lead.admin.meetingAt) : "");
  const [notes, setNotes] = useState(lead.admin.notes);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadHistory = useCallback(() => {
    getDocs(query(collection(db, "leadAdmin", lead.id, "history"), orderBy("at", "desc"), limit(50)))
      .then((snap) => setHistory(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HistoryEntry, "id" | "at">), at: toDate(d.data().at) }))))
      .catch(() => setHistory([]));
  }, [lead.id]);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dirty = status !== lead.admin.status || meetingConfirmed !== lead.admin.meetingConfirmed || notes !== lead.admin.notes
    || meetingAt !== (lead.admin.meetingAt ? toLocalInput(lead.admin.meetingAt) : "") || note.trim() !== "";

  async function save() {
    setSaving(true); setError(null); setSaved(false);
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "leadAdmin", lead.id), {
        status, meetingConfirmed, meetingAt: meetingConfirmed && meetingAt ? Timestamp.fromDate(new Date(meetingAt)) : null,
        notes: notes.slice(0, 5000), updatedBy: staffEmail, updatedAt: serverTimestamp(),
      });
      batch.set(doc(collection(db, "leadAdmin", lead.id, "history")), {
        status, meetingConfirmed, ...(note.trim() ? { note: note.trim().slice(0, 500) } : {}), by: staffEmail, at: serverTimestamp(),
      });
      await batch.commit();
      setSaved(true); setNote("");
      loadHistory();
      onSaved();
    } catch (e) { setError(explainFirestore(e)); } finally { setSaving(false); }
  }

  async function remove() {
    setDeleting(true); setError(null);
    try {
      const hist = await getDocs(collection(db, "leadAdmin", lead.id, "history"));
      const batch = writeBatch(db);
      hist.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(doc(db, "leadAdmin", lead.id));
      await batch.commit();
      await deleteDoc(doc(db, "leads", lead.id));
      setConfirmDelete(false);
      onDeleted();
    } catch (e) { setError(explainFirestore(e)); setDeleting(false); setConfirmDelete(false); }
  }

  return (
    <div className="drawer" role="dialog" aria-modal="false" aria-labelledby="lead-title">
      <div className="stack">
        <div className="spread">
          <h2 id="lead-title" style={{ margin: 0 }}>{lead.name}</h2>
          <button className="btn small" onClick={onClose} aria-label="Close lead details">Close</button>
        </div>

        <section className="card flat stack" aria-label="Submitted by the visitor">
          <h3>Submitted by the visitor</h3>
          <dl className="kv">
            <dt>Received</dt><dd>{formatDateTime(lead.createdAt)}</dd>
            <dt>Email</dt><dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd>
            <dt>Phone</dt><dd><a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`}>{lead.phone}</a></dd>
            <dt>Country</dt><dd>{lead.country}</dd>
            <dt>Address</dt><dd>{lead.address}</dd>
            <dt>Services</dt><dd>{lead.services.join(", ")}</dd>
            <dt>Notes</dt><dd>{lead.notes || <span className="muted">None</span>}</dd>
            <dt>Form</dt><dd>{lead.source === "/book-appointment" ? "Book an appointment" : "Book a consultation"}</dd>
            <dt>Enquiry</dt><dd>{lead.enquiryRequested ? "Requested a follow-up" : "Not requested"}</dd>
            <dt>Calendar</dt><dd>{lead.bookingRequested ? "Opened the booking calendar (not a confirmed meeting)" : "Not opened"}</dd>
            <dt>Last change</dt><dd>{formatDateTime(lead.updatedAt)}</dd>
            <dt>CRM (Telegus)</dt><dd className="muted">Not connected — integration deferred</dd>
          </dl>
        </section>

        <section className="card flat stack" aria-label="Staff follow-up">
          <h3>Follow-up</h3>
          <label className="field">Status
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label className="row" style={{ fontWeight: 600 }}>
            <input type="checkbox" checked={meetingConfirmed} onChange={(e) => setMeetingConfirmed(e.target.checked)} />
            Meeting confirmed (I have seen the booking)
          </label>
          {meetingConfirmed ? (
            <label className="field">Meeting time (optional)
              <input type="datetime-local" value={meetingAt} onChange={(e) => setMeetingAt(e.target.value)} />
            </label>
          ) : null}
          <label className="field">Internal notes
            <textarea value={notes} maxLength={5000} onChange={(e) => setNotes(e.target.value)} placeholder="Visible to staff only." />
          </label>
          <label className="field">Note for the history log (optional)
            <input type="text" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Called, left voicemail" />
          </label>
          <div className="row">
            <button className="btn primary" onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : "Save follow-up"}</button>
            {saved && !dirty ? <span role="status" className="small" style={{ color: "var(--ok)" }}>Saved</span> : null}
          </div>
          {error ? <ErrorNotice error={error} /> : null}
          {lead.admin.updatedBy ? <p className="small muted" style={{ margin: 0 }}>Last updated by {lead.admin.updatedBy}, {timeAgo(lead.admin.updatedAt)}</p> : null}
        </section>

        <section className="card flat stack" aria-label="History">
          <h3>History</h3>
          {history === null ? <Spinner label="Loading history" /> : history.length === 0 ? <p className="muted small" style={{ margin: 0 }}>No follow-up recorded yet.</p> : (
            <ul className="stack small" style={{ margin: 0, paddingLeft: 18, gap: 8 }}>
              {history.map((h) => (
                <li key={h.id}><strong>{statusInfo(h.status).label}</strong>{h.meetingConfirmed ? " · meeting confirmed" : ""}
                  {h.note ? ` — ${h.note}` : ""}<br /><span className="muted">{h.by}, {formatDateTime(h.at)}</span></li>
              ))}
            </ul>
          )}
        </section>

        {role === "admin" ? (
          <section className="card flat stack" aria-label="Delete">
            <h3>Delete this lead</h3>
            <p className="small muted" style={{ margin: 0 }}>For erasure requests. Permanently removes the visitor’s details and all follow-up history. This cannot be undone.</p>
            <div><button className="btn danger" onClick={() => setConfirmDelete(true)}>Delete lead…</button></div>
          </section>
        ) : null}
      </div>
      <Confirm open={confirmDelete} title={`Delete ${lead.name}?`} actionLabel="Delete permanently" danger confirmText="delete"
        busy={deleting} onCancel={() => setConfirmDelete(false)} onConfirm={remove}>
        This permanently deletes the lead and its history. Export it first if you need a record.
      </Confirm>
    </div>
  );
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function explainFirestore(error: unknown) {
  const code = (error as { code?: string }).code ?? "";
  if (code.includes("permission-denied")) return new Error("You don’t have permission for this. Ask an administrator to check your staff access.");
  if (code.includes("unavailable") || code.includes("deadline")) return new Error("Couldn’t reach the database. Check your connection and try again.");
  return error instanceof Error ? error : new Error(String(error));
}
