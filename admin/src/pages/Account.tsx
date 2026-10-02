import { useState } from "react";
import { changePassword, ADMIN_USERNAME } from "../firebase";
import { ErrorNotice } from "../ui";

const MIN_LENGTH = 8;

/** The single admin account. Changing the password here changes it for the content editor too. */
export function Account() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setDone(false);
    if (next.length < MIN_LENGTH) return setError(new Error(`Use at least ${MIN_LENGTH} characters — a few unrelated words is easiest to remember.`));
    if (next !== confirm) return setError(new Error("The two new passwords don’t match."));
    if (next === current) return setError(new Error("Choose a password different from the current one."));
    setBusy(true);
    try { await changePassword(current, next); setDone(true); setCurrent(""); setNext(""); setConfirm(""); }
    catch (err) { setError(err); } finally { setBusy(false); }
  }

  return (
    <div className="stack">
      <div>
        <h1>Account</h1>
        <p className="lede">
          There is one account, <strong>{ADMIN_USERNAME}</strong>, for the staff portal and the content editor. It can
          change, publish and roll back anything on the website and see every enquiry, so keep the password private.
        </p>
      </div>
      <form className="card stack" onSubmit={submit} style={{ maxWidth: 480 }} aria-labelledby="pw-title">
        <h2 id="pw-title">Change password</h2>
        <input type="text" name="username" autoComplete="username" value={ADMIN_USERNAME} readOnly hidden />
        <label className="field">Current password
          <input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </label>
        <label className="field">New password
          <input type="password" autoComplete="new-password" required minLength={MIN_LENGTH} value={next} onChange={(e) => setNext(e.target.value)} />
        </label>
        <label className="field">New password again
          <input type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        <p className="small muted" style={{ margin: 0 }}>A long phrase of unrelated words is strongest. Avoid anything containing “admin”, the company name or a year.</p>
        {error ? <ErrorNotice error={error} /> : null}
        {done ? <div className="notice ok" role="status">Password changed. Use it next time you sign in to the portal or the content editor.</div> : null}
        <div><button className="btn primary" disabled={busy}>{busy ? "Saving…" : "Change password"}</button></div>
      </form>
    </div>
  );
}
