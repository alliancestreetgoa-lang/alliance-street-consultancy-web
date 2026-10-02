import { useState, type ReactNode } from "react";
import { signInWithGoogle, signOutStaff } from "./firebase";
import { useStaff, type StaffRole } from "./hooks";
import { ErrorNotice, Spinner } from "./ui";

/** Google sign-in for the lead and team tools. */
export function StaffGate({ children }: { children: (staff: { email: string; role: StaffRole }) => ReactNode }) {
  const staff = useStaff();
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true); setError(null);
    try { await signInWithGoogle(); } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") setError(e);
    } finally { setBusy(false); }
  }

  if (staff.status === "loading") return <Spinner label="Checking your sign-in" />;
  if (staff.status === "signed-out")
    return (
      <div className="card stack" style={{ maxWidth: 520 }}>
        <h2>Sign in with your Google account</h2>
        <p className="muted">Lead records are visible only to people an administrator has added to the staff list.</p>
        <div><button className="btn primary" onClick={signIn} disabled={busy}>{busy ? "Opening Google…" : "Sign in with Google"}</button></div>
        {error ? <ErrorNotice error={error} /> : null}
      </div>
    );
  if (staff.status === "denied")
    return (
      <div className="card stack" style={{ maxWidth: 560 }}>
        <div className="notice warn" role="alert">{staff.reason}</div>
        <div><button className="btn" onClick={() => signOutStaff()}>Sign out</button></div>
      </div>
    );
  return (
    <div className="stack">
      <div className="spread small muted">
        <span>Signed in as <strong>{staff.email}</strong> · {staff.role}</span>
        <button className="btn small" onClick={() => signOutStaff()}>Sign out</button>
      </div>
      {children({ email: staff.email, role: staff.role })}
    </div>
  );
}
