import { useCallback, useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, Timestamp } from "firebase/firestore/lite";
import { db } from "../firebase";
import { StaffGate } from "../StaffGate";
import type { StaffRole } from "../hooks";
import { GitHubGate } from "../GitHubGate";
import { encodeBase64, gh, loadCodeowners, OWNER, publishersFrom, REPO } from "../github";
import { Badge, Confirm, Empty, ErrorNotice, Spinner, formatDateTime } from "../ui";

export function Team() {
  return (
    <div className="stack">
      <div>
        <h1>Team & access</h1>
        <p className="lede">
          Two separate lists, because they protect different things. <strong>Lead access</strong> decides who can see
          customer enquiries. <strong>Website access</strong> decides who can edit and publish the site. Adding someone
          to one does not give them the other.
        </p>
      </div>
      <section className="stack" aria-labelledby="staff-heading">
        <h2 id="staff-heading">Lead access (Google accounts)</h2>
        <StaffGate>{(me) => <StaffList me={me.email} role={me.role} />}</StaffGate>
      </section>
      <section className="stack" aria-labelledby="web-heading">
        <h2 id="web-heading">Website access (GitHub accounts)</h2>
        <GitHubGate>{(me) => (me.role === "admin" ? <WebsiteAccess /> : <RoleSummary />)}</GitHubGate>
      </section>
    </div>
  );
}

const STAFF_ROLES: { value: StaffRole; label: string; help: string }[] = [
  { value: "editor", label: "Editor", help: "View leads and update their status" },
  { value: "publisher", label: "Publisher", help: "Editor, plus export to CSV" },
  { value: "admin", label: "Administrator", help: "Everything, including managing this list and deleting leads" },
];

type StaffEntry = { email: string; role: StaffRole; active: boolean; name?: string; addedBy: string; addedAt: Date | null };

function StaffList({ me, role }: { me: string; role: StaffRole }) {
  const [rows, setRows] = useState<StaffEntry[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("editor");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<StaffEntry | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const snap = await getDocs(collection(db, "staff"));
      setRows(snap.docs.map((d) => {
        const v = d.data();
        return { email: d.id, role: v.role, active: !!v.active, name: v.name, addedBy: v.addedBy, addedAt: v.addedAt instanceof Timestamp ? v.addedAt.toDate() : null };
      }).sort((a, b) => a.email.localeCompare(b.email)));
    } catch (e) { setError(e); }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
  useEffect(() => { if (role === "admin") void load(); }, [role, load]);

  if (role !== "admin")
    return <div className="card"><p style={{ margin: 0 }}>You have <strong>{STAFF_ROLES.find((r) => r.value === role)?.label}</strong> access to leads. Only administrators manage this list.</p></div>;

  async function save(entry: { email: string; role: StaffRole; active: boolean; name?: string }) {
    setBusy(true); setError(null); setMessage(null);
    try {
      await setDoc(doc(db, "staff", entry.email.toLowerCase()), {
        role: entry.role, active: entry.active, ...(entry.name ? { name: entry.name.slice(0, 100) } : {}),
        addedBy: me, addedAt: serverTimestamp(),
      });
      await load();
      return true;
    } catch (e) { setError(e); return false; } finally { setBusy(false); }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) { setError(new Error("Enter a valid Google account email address.")); return; }
    if (rows?.some((r) => r.email === clean)) { setError(new Error(`${clean} is already on the list.`)); return; }
    if (await save({ email: clean, role: newRole, active: true, name: name.trim() })) {
      setMessage(`${clean} can now sign in to see leads. Tell them to use “Sign in with Google” with that address.`);
      setEmail(""); setName(""); setNewRole("editor");
    }
  }

  async function remove() {
    if (!removing) return;
    setBusy(true);
    try { await deleteDoc(doc(db, "staff", removing.email)); setMessage(`${removing.email} no longer has access to leads.`); setRemoving(null); await load(); }
    catch (e) { setError(e); setRemoving(null); } finally { setBusy(false); }
  }

  return (
    <div className="stack">
      {message ? <div className="notice ok" role="status">{message}</div> : null}
      {error ? <ErrorNotice error={error} /> : null}
      <form className="card flat stack" onSubmit={add} aria-label="Add a person">
        <h3>Give someone access to leads</h3>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <label className="field">Google account email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" /></label>
          <label className="field">Name (optional)<input type="text" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} /></label>
          <label className="field">Role
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as StaffRole)}>
              {STAFF_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label} — {r.help}</option>)}
            </select>
          </label>
        </div>
        <div><button className="btn primary" type="submit" disabled={busy}>Add person</button></div>
      </form>
      {!rows ? <Spinner label="Loading staff list" /> : rows.length === 0 ? <Empty title="Nobody on the list" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Person</th><th>Role</th><th>Access</th><th>Last changed</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const self = r.email === me;
                return (
                  <tr key={r.email}>
                    <td><strong>{r.name || r.email}</strong>{r.name ? <div className="small muted">{r.email}</div> : null}{self ? <div className="small muted">You</div> : null}</td>
                    <td>
                      <label className="sr-only" htmlFor={`role-${r.email}`}>Role for {r.email}</label>
                      <select id={`role-${r.email}`} value={r.role} disabled={self || busy}
                        onChange={(e) => void save({ ...r, role: e.target.value as StaffRole })}>
                        {STAFF_ROLES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                      </select>
                    </td>
                    <td>{r.active ? <Badge tone="ok">Active</Badge> : <Badge tone="neutral">Paused</Badge>}</td>
                    <td className="small muted">{formatDateTime(r.addedAt)}<br />by {r.addedBy}</td>
                    <td>{self ? <span className="small muted">Ask another admin to change your access</span> : (
                      <div className="row">
                        <button className="btn small" disabled={busy} onClick={() => void save({ ...r, active: !r.active })}>{r.active ? "Pause" : "Resume"}</button>
                        <button className="btn small danger" disabled={busy} onClick={() => setRemoving(r)}>Remove…</button>
                      </div>
                    )}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Confirm open={!!removing} title={`Remove ${removing?.email}?`} actionLabel="Remove access" danger busy={busy}
        onCancel={() => setRemoving(null)} onConfirm={remove}>
        They will immediately stop being able to see leads. Their past follow-up notes stay in each lead’s history.
      </Confirm>
    </div>
  );
}

function RoleSummary() {
  return (
    <div className="card small">
      <p style={{ marginTop: 0 }}><strong>Editors</strong> can change anything on the website and send it for review. They cannot publish.</p>
      <p><strong>Publishers</strong> approve and publish other people’s changes. Their own changes need a second publisher or the administrator.</p>
      <p style={{ marginBottom: 0 }}><strong>The administrator</strong> can publish anything and manage who has access. Ask them to change your role.</p>
    </div>
  );
}

type Collaborator = { login: string; avatar: string; isOwner: boolean; publisher: boolean; pending?: number };

/** Repository collaborators and invitations; publishers are the content owners in .github/CODEOWNERS. */
function WebsiteAccess() {
  const [people, setPeople] = useState<Collaborator[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [username, setUsername] = useState("");
  const [asPublisher, setAsPublisher] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Collaborator | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [collabs, invites, owners] = await Promise.all([
        gh<{ login: string; avatar_url: string }[]>(`/repos/${OWNER}/${REPO}/collaborators?per_page=100`),
        gh<{ id: number; invitee: { login: string; avatar_url: string } | null }[]>(`/repos/${OWNER}/${REPO}/invitations?per_page=100`),
        loadCodeowners().catch(() => ({ text: "", sha: "" })),
      ]);
      const publishers = publishersFrom(owners.text);
      setPeople([
        ...collabs.map((c) => ({ login: c.login, avatar: c.avatar_url, isOwner: c.login.toLowerCase() === OWNER, publisher: publishers.includes(c.login.toLowerCase()) })),
        ...invites.filter((i) => i.invitee).map((i) => ({ login: i.invitee!.login, avatar: i.invitee!.avatar_url, isOwner: false, publisher: publishers.includes(i.invitee!.login.toLowerCase()), pending: i.id })),
      ]);
    } catch (e) { setError(e); }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
  useEffect(() => { void load(); }, [load]);

  /** Rewrites the content-owner lines in CODEOWNERS with the current publisher list. */
  async function setPublisher(login: string, publisher: boolean) {
    const { text, sha } = await loadCodeowners();
    const current = new Set(publishersFrom(text));
    if (publisher) current.add(login.toLowerCase()); else current.delete(login.toLowerCase());
    current.add(OWNER);
    const owners = [...current].map((l) => `@${l}`).join(" ");
    const next = text.split("\n").map((line) => (/^\/(src\/content|public\/brand)\/\s/.test(line.trim()) ? `${line.trim().split(/\s+/)[0]} ${owners}` : line)).join("\n");
    if (next === text) return;
    await gh(`/repos/${OWNER}/${REPO}/contents/.github/CODEOWNERS`, {
      method: "PUT",
      body: JSON.stringify({ message: `${publisher ? "Make" : "Remove"} ${login} ${publisher ? "a publisher" : "as publisher"}`, content: encodeBase64(next), sha, branch: "main" }),
    });
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const login = username.trim().replace(/^@/, "");
    if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login)) { setError(new Error("Enter a GitHub username, e.g. jane-smith.")); return; }
    setBusy(true); setError(null); setMessage(null);
    try {
      await gh(`/repos/${OWNER}/${REPO}/collaborators/${login}`, { method: "PUT", body: JSON.stringify({ permission: "push" }) });
      if (asPublisher) await setPublisher(login, true);
      setMessage(`Invitation sent to ${login}. They must accept it from their GitHub notifications or email before they can sign in.`);
      setUsername(""); setAsPublisher(false);
      await load();
    } catch (err) { setError(err); } finally { setBusy(false); }
  }

  async function toggle(p: Collaborator) {
    setBusy(true); setError(null); setMessage(null);
    try { await setPublisher(p.login, !p.publisher); setMessage(`${p.login} is now ${p.publisher ? "an editor" : "a publisher"}.`); await load(); }
    catch (err) { setError(err); } finally { setBusy(false); }
  }

  async function remove() {
    if (!removing) return;
    setBusy(true); setError(null);
    try {
      if (removing.pending) await gh(`/repos/${OWNER}/${REPO}/invitations/${removing.pending}`, { method: "DELETE" });
      else await gh(`/repos/${OWNER}/${REPO}/collaborators/${removing.login}`, { method: "DELETE" });
      if (removing.publisher) await setPublisher(removing.login, false);
      setMessage(`${removing.login} no longer has access to edit the website.`);
      setRemoving(null);
      await load();
    } catch (err) { setError(err); setRemoving(null); } finally { setBusy(false); }
  }

  return (
    <div className="stack">
      {message ? <div className="notice ok" role="status">{message}</div> : null}
      {error ? <ErrorNotice error={error} /> : null}
      <form className="card flat stack" onSubmit={invite} aria-label="Invite to edit the website">
        <h3>Invite someone to edit the website</h3>
        <p className="small muted" style={{ margin: 0 }}>They need a free GitHub account. Ask for their username.</p>
        <div className="row">
          <label className="field" style={{ flex: "1 1 220px" }}>GitHub username<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" /></label>
          <label className="row" style={{ fontWeight: 600, alignSelf: "flex-end", minHeight: 40 }}>
            <input type="checkbox" checked={asPublisher} onChange={(e) => setAsPublisher(e.target.checked)} /> Can publish
          </label>
        </div>
        <div><button className="btn primary" disabled={busy || !username.trim()}>Send invitation</button></div>
      </form>
      {!people ? <Spinner label="Loading website access" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>GitHub account</th><th>Role</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.login}>
                  <td className="row"><img src={p.avatar} alt="" width={24} height={24} style={{ borderRadius: "50%" }} /> {p.login}
                    {p.pending ? <Badge tone="warn">Invitation pending</Badge> : null}</td>
                  <td>{p.isOwner ? <Badge tone="info">Administrator</Badge> : p.publisher ? <Badge tone="ok">Publisher</Badge> : <Badge tone="neutral">Editor</Badge>}</td>
                  <td>{p.isOwner ? null : (
                    <div className="row">
                      <button className="btn small" disabled={busy} onClick={() => void toggle(p)}>{p.publisher ? "Make editor" : "Make publisher"}</button>
                      <button className="btn small danger" disabled={busy} onClick={() => setRemoving(p)}>Remove…</button>
                    </div>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Confirm open={!!removing} title={`Remove ${removing?.login}?`} actionLabel="Remove access" danger busy={busy}
        onCancel={() => setRemoving(null)} onConfirm={remove}>
        They will no longer be able to edit or publish the website. Their unpublished drafts stay until someone discards them.
      </Confirm>
    </div>
  );
}
