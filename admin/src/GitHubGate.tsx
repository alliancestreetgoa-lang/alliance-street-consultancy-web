import { useEffect, useState, type ReactNode } from "react";
import { useGitHub, type GitHubState } from "./hooks";
import { oauthBaseUrl, ROLE_LABEL, signInWithGitHub } from "./github";
import { ErrorNotice, Spinner } from "./ui";

type Ready = Extract<GitHubState, { status: "ready" }>;

/**
 * GitHub connection for publishing and website access. Website editing rights
 * come from GitHub itself, so this is the same identity the content editor uses.
 */
export function GitHubGate({ children }: { children: (me: Ready, refresh: () => void) => ReactNode }) {
  const { state, connect, disconnect, refresh } = useGitHub();
  const [base, setBase] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [token, setTokenInput] = useState("");

  useEffect(() => { oauthBaseUrl().then(setBase).catch(() => setBase(null)); }, []);

  async function oauth() {
    if (!base) return;
    setBusy(true); setError(null);
    try { await connect(await signInWithGitHub(base)); } catch (e) { setError(e); } finally { setBusy(false); }
  }

  if (state.status === "loading") return <Spinner label="Connecting to GitHub" />;
  if (state.status === "ready")
    return (
      <div className="stack">
        <div className="spread small muted">
          <span className="row"><img src={state.avatar} alt="" width={22} height={22} style={{ borderRadius: "50%" }} />
            GitHub: <strong>{state.login}</strong> · {ROLE_LABEL[state.role]}</span>
          <button className="btn small" onClick={disconnect}>Disconnect GitHub</button>
        </div>
        {state.role === "none" ? (
          <div className="notice warn">This GitHub account has no access to the website. Ask an administrator to invite it.</div>
        ) : children(state, refresh)}
      </div>
    );

  return (
    <div className="card stack" style={{ maxWidth: 600 }}>
      <h2>Connect GitHub</h2>
      <p className="muted" style={{ margin: 0 }}>
        Website changes are saved and published through GitHub, which also decides who may publish.
        Use the same GitHub account you use in the content editor.
      </p>
      {state.status === "error" ? <ErrorNotice error={state.message} onRetry={refresh} /> : null}
      {base === undefined ? <Spinner label="Checking sign-in options" /> : base ? (
        <div><button className="btn primary" onClick={oauth} disabled={busy}>{busy ? "Waiting for GitHub…" : "Sign in with GitHub"}</button></div>
      ) : (
        <div className="notice info small">
          “Sign in with GitHub” is not switched on yet — a developer needs to finish the one-time setup
          (docs/cms-setup.md). Until then you can connect with a personal access token.
        </div>
      )}
      <details>
        <summary className="small">Use an access token instead</summary>
        <form className="stack" style={{ marginTop: 12 }} onSubmit={(e) => { e.preventDefault(); if (token.trim()) void connect(token.trim()); setTokenInput(""); }}>
          <label className="field">Fine-grained personal access token
            <input type="password" autoComplete="off" value={token} onChange={(e) => setTokenInput(e.target.value)} />
          </label>
          <p className="small muted" style={{ margin: 0 }}>
            Needs Contents, Pull requests, Commit statuses and Actions (read) on this repository. It is kept only in this browser tab.
          </p>
          <div><button className="btn" type="submit" disabled={!token.trim()}>Connect</button></div>
        </form>
      </details>
      {error ? <ErrorNotice error={error} /> : null}
    </div>
  );
}
