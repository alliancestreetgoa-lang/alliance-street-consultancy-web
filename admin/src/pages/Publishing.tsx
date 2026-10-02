import { useCallback, useEffect, useState } from "react";
import { GitHubGate } from "../GitHubGate";
import { SITE_URL, type GitHubRole } from "../github";
import {
  approve, describeFile, getDrafts, getHistory, getLiveStatus, publish, rollback,
  type Check, type Draft, type LiveStatus, type Published,
} from "../publishing";
import { Badge, Confirm, Empty, ErrorNotice, Spinner, timeAgo } from "../ui";

export function Publishing() {
  return (
    <div className="stack">
      <div>
        <h1>Website publishing</h1>
        <p className="lede">
          Saving in the content editor creates a <strong>draft</strong>; the live site does not change. Each draft gets a
          full preview of the site. A publisher approves it, then it is published and goes live a few minutes later.
          Every publish can be rolled back.
        </p>
      </div>
      <GitHubGate>{(me) => <PublishingBoard login={me.login} role={me.role} />}</GitHubGate>
    </div>
  );
}

const STAGE: Record<Draft["stage"], { label: string; tone: "neutral" | "warn" | "info" }> = {
  draft: { label: "Draft", tone: "neutral" },
  "in-review": { label: "In review", tone: "warn" },
  ready: { label: "Ready to publish", tone: "info" },
};

function PublishingBoard({ login, role }: { login: string; role: GitHubRole }) {
  const [live, setLive] = useState<LiveStatus | null>(null);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [history, setHistory] = useState<Published[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "bad"; text: string; link?: string } | null>(null);
  const [pending, setPending] = useState<{ kind: "publish" | "rollback"; draft?: Draft; item?: Published } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [l, d, h] = await Promise.all([getLiveStatus(), getDrafts(), getHistory()]);
      setLive(l); setDrafts(d); setHistory(h);
    } catch (e) { setError(e); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
  useEffect(() => { void load(); }, [load]);
  // Keep the build state current while something is building or a preview is pending.
  useEffect(() => {
    const active = live?.state === "building" || drafts?.some((d) => d.preview.state === "pending" || d.publishCheck.state === "pending");
    if (!active) return;
    const t = window.setInterval(() => void load(), 20000);
    return () => window.clearInterval(t);
  }, [live, drafts, load]);

  const canPublish = role === "admin" || role === "publisher";

  async function doApprove(draft: Draft) {
    setBusy(true); setNotice(null);
    try { await approve(draft.number); setNotice({ tone: "ok", text: `Approved “${draft.title}”.` }); await load(); }
    catch (e) { setNotice({ tone: "bad", text: (e as Error).message }); } finally { setBusy(false); }
  }

  async function confirmPending() {
    if (!pending) return;
    setBusy(true); setNotice(null);
    try {
      if (pending.kind === "publish" && pending.draft) {
        await publish(pending.draft);
        setNotice({ tone: "ok", text: `Published “${pending.draft.title}”. The site is rebuilding — it will be live in a few minutes.` });
      } else if (pending.kind === "rollback" && pending.item) {
        const pr = await rollback(pending.item);
        setNotice({ tone: "ok", text: `Rollback draft #${pr.number} created. Check its preview below, then publish it to restore the previous version.`, link: pr.url });
      }
      setPending(null);
      await load();
    } catch (e) {
      setPending(null);
      setNotice({ tone: "bad", text: (e as Error).message });
    } finally { setBusy(false); }
  }

  if (error) return <ErrorNotice error={error} onRetry={load} />;
  if (!live || !drafts || !history) return <Spinner label="Loading publishing status" />;

  return (
    <div className="stack">
      {notice ? (
        <div className={`notice ${notice.tone}`} role={notice.tone === "bad" ? "alert" : "status"}>
          {notice.text} {notice.link ? <a href={notice.link} target="_blank" rel="noreferrer">View on GitHub</a> : null}
        </div>
      ) : null}

      <section className="card stack" aria-labelledby="live-heading">
        <div className="spread">
          <h2 id="live-heading" style={{ margin: 0 }}>Live site</h2>
          <LiveBadge state={live.state} />
        </div>
        <p style={{ margin: 0 }}>{live.message}</p>
        <div className="row small muted">
          {live.liveAt ? <span>Last published {timeAgo(live.liveAt)}</span> : null}
          <a href={SITE_URL} target="_blank" rel="noreferrer">Open the live site ↗</a>
          {live.runUrl ? <a href={live.runUrl} target="_blank" rel="noreferrer">Build log ↗</a> : null}
          <button className="btn small" onClick={() => void load()}>Refresh</button>
        </div>
      </section>

      <section className="stack" aria-labelledby="drafts-heading">
        <div className="spread">
          <h2 id="drafts-heading" style={{ margin: 0 }}>Unpublished changes</h2>
          <a className="btn small" href="/cms/#/workflow">Open the editor’s workflow board</a>
        </div>
        {drafts.length === 0 ? (
          <div className="card"><Empty title="No unpublished changes">Everything saved in the content editor has been published.</Empty></div>
        ) : drafts.map((d) => (
          <article key={d.number} className="card stack" aria-label={d.title}>
            <div className="spread">
              <div>
                <h3 style={{ margin: 0 }}>{d.isRollback ? "↩ " : ""}{d.title}</h3>
                <div className="small muted">by {d.author} · updated {timeAgo(d.updated)} · #{d.number}</div>
              </div>
              <Badge tone={STAGE[d.stage].tone}>{STAGE[d.stage].label}</Badge>
            </div>
            <div className="small">
              <strong>Changes:</strong> {[...new Set(d.files.map(describeFile))].join(", ") || "—"}
            </div>
            <div className="row small">
              <CheckBadge label="Preview" check={d.preview} />
              <CheckBadge label="Publish check" check={d.publishCheck} />
              {d.approvals.length ? <Badge tone="ok">Approved by {d.approvals.join(", ")}</Badge> : <Badge tone="neutral">Not approved yet</Badge>}
            </div>
            <div className="row">
              {d.preview.state === "success" && d.preview.url ? (
                <a className="btn" href={d.preview.url} target="_blank" rel="noreferrer">View preview ↗</a>
              ) : null}
              {canPublish && d.author.toLowerCase() !== login.toLowerCase() && !d.approvals.includes(login) ? (
                <button className="btn" onClick={() => doApprove(d)} disabled={busy || d.preview.state !== "success"}
                  title={d.preview.state !== "success" ? "Check the preview before approving" : undefined}>Approve</button>
              ) : null}
              {canPublish ? (
                <button className="btn primary" disabled={busy || d.publishCheck.state !== "success" || d.preview.state !== "success"}
                  title={d.publishCheck.state !== "success" ? "The publish check must pass first" : d.preview.state !== "success" ? "Wait for the preview, and check it, before publishing" : undefined}
                  onClick={() => setPending({ kind: "publish", draft: d })}>Publish…</button>
              ) : null}
              <a className="btn small" href={d.url} target="_blank" rel="noreferrer">Details on GitHub</a>
            </div>
            {!canPublish ? (
              <p className="small muted" style={{ margin: 0 }}>
                Set the draft to “Ready” in the editor when you are happy with the preview. A publisher will approve and publish it.
              </p>
            ) : role === "publisher" && d.author.toLowerCase() === login.toLowerCase() && !d.approvals.length ? (
              <p className="small muted" style={{ margin: 0 }}>Your own changes need approval from another publisher or the administrator.</p>
            ) : null}
          </article>
        ))}
      </section>

      <section className="stack" aria-labelledby="history-heading">
        <h2 id="history-heading" style={{ margin: 0 }}>Recently published</h2>
        {history.length === 0 ? <div className="card"><Empty title="Nothing published through the editor yet" /></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Change</th><th>By</th><th>Published</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.number}>
                    <td><a href={h.url} target="_blank" rel="noreferrer">{h.title}</a></td>
                    <td className="small">{h.author}</td>
                    <td className="small">{timeAgo(h.mergedAt)}</td>
                    <td>{canPublish && h.content && !h.isRollback ? (
                      <button className="btn small" disabled={busy} onClick={() => setPending({ kind: "rollback", item: h })}>Roll back…</button>
                    ) : !h.content && !h.isRollback ? <span className="small muted">Developer change</span> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="small muted" style={{ margin: 0 }}>
          Rolling back creates a new draft that undoes the change. It is previewed and published like any other change, so
          nothing goes live by surprise. Changes made directly by a developer are rolled back by a developer.
        </p>
      </section>

      <Confirm open={pending?.kind === "publish"} title="Publish this change?" actionLabel="Publish to the live site" busy={busy}
        onCancel={() => setPending(null)} onConfirm={confirmPending}>
        “{pending?.draft?.title}” will go live on the public website in a few minutes. Make sure you have checked the preview.
      </Confirm>
      <Confirm open={pending?.kind === "rollback"} title="Roll back this change?" actionLabel="Create rollback draft" busy={busy}
        onCancel={() => setPending(null)} onConfirm={confirmPending}>
        This creates a draft that undoes “{pending?.item?.title}”. Nothing changes on the live site until that draft is published.
      </Confirm>
    </div>
  );
}

function LiveBadge({ state }: { state: LiveStatus["state"] }) {
  if (state === "live") return <Badge tone="ok">Live</Badge>;
  if (state === "building") return <Badge tone="warn">Building</Badge>;
  if (state === "failed") return <Badge tone="bad">Publish failed</Badge>;
  return <Badge tone="neutral">Checking</Badge>;
}

function CheckBadge({ label, check }: { label: string; check: Check }) {
  const text = { success: "ready", pending: "building…", failure: "failed", none: "not started" }[check.state];
  const tone = { success: "ok", pending: "warn", failure: "bad", none: "neutral" }[check.state] as "ok" | "warn" | "bad" | "neutral";
  const badge = <Badge tone={tone}>{label}: {text}</Badge>;
  return check.state === "failure" && check.url ? <a href={check.url} target="_blank" rel="noreferrer" title="Open the log to see what needs fixing">{badge}</a> : badge;
}
