import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { USING_EMULATOR, signInAdmin, signOutAdmin, watchUser } from "./firebase";
import { fetchGitHubToken, getToken, setToken } from "./github";
import { ErrorNotice, Spinner } from "./ui";

/**
 * One sign-in for the whole portal: the admin username and password. Leads
 * are then read with the Firebase session (checked by firestore.rules) and
 * publishing uses the GitHub token the sign-in worker returns for it.
 */
type Publishing = { status: "loading" } | { status: "ready" } | { status: "error"; message: string };
type Session = { user: User; publishing: Publishing; retryPublishing: () => void; signOut: () => Promise<void> };

const SessionContext = createContext<Session | null>(null);

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession outside AuthGate");
  return session;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [publishing, setPublishing] = useState<Publishing>({ status: "loading" });

  const connectPublishing = useCallback(async (u: User) => {
    if (USING_EMULATOR) return setPublishing({ status: "error", message: "Publishing is not available in emulator mode." });
    if (getToken()) return setPublishing({ status: "ready" });
    setPublishing({ status: "loading" });
    try {
      setToken(await fetchGitHubToken(await u.getIdToken()));
      setPublishing({ status: "ready" });
    } catch (error) {
      setPublishing({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  useEffect(() => watchUser((u) => {
    setUser(u);
    if (u) void connectPublishing(u);
    else setToken(null);
  }), [connectPublishing]);

  const signOut = useCallback(async () => { setToken(null); await signOutAdmin(); }, []);

  if (user === undefined) return <div className="login"><Spinner label="Checking your sign-in" /></div>;
  if (!user) return <LoginForm />;
  return (
    <SessionContext.Provider value={{ user, publishing, retryPublishing: () => void connectPublishing(user), signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await signInAdmin(username, password); } catch (err) { setError(err); setBusy(false); }
  }

  return (
    <div className="login">
      <form className="card stack" onSubmit={submit} aria-labelledby="login-title" style={{ width: "min(380px, calc(100vw - 32px))" }}>
        <div className="row"><img src="/favicon.png" alt="" width={28} height={23} /><h1 id="login-title" style={{ margin: 0, fontSize: 22 }}>Alliance Street</h1></div>
        <p className="muted small" style={{ margin: 0 }}>Staff portal — website, publishing and leads.</p>
        <label className="field">Username
          <input type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </label>
        <label className="field">Password
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error ? <ErrorNotice error={error} /> : null}
        <button className="btn primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        {USING_EMULATOR ? <p className="small muted" style={{ margin: 0 }}>Emulator mode — test data</p> : null}
      </form>
    </div>
  );
}

/** For screens that need website publishing: shows why it isn't available. */
export function PublishingGate({ children }: { children: ReactNode }) {
  const { publishing, retryPublishing } = useSession();
  if (publishing.status === "loading") return <Spinner label="Connecting website publishing" />;
  if (publishing.status === "error") return <ErrorNotice error={publishing.message} onRetry={retryPublishing} />;
  return <>{children}</>;
}
