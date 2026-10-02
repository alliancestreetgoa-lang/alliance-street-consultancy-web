import { load } from "js-yaml";

/**
 * GitHub access for the publishing screens. Every action here runs with the
 * signed-in person's own GitHub permissions — GitHub decides what they may do
 * (branch rules on main, required reviews from CODEOWNERS). The portal only
 * presents it.
 */
export const OWNER = "alliancestreetgoa-lang";
export const REPO = "alliance-street-consultancy-web";
const API = "https://api.github.com";
const TOKEN_KEY = "asc.github.token";

export const CONFIG_URL = ["localhost", "127.0.0.1"].includes(location.hostname)
  ? "/cms/config.yml"
  : `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/admin/public/cms/config.yml`;

export const SITE_URL = "https://alliancestreetgoa-lang.github.io/alliance-street-consultancy-web";

export function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable: token lives for this page view only */ }
}

export class GitHubError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function gh<T = unknown>(path: string, init: RequestInit & { raw?: boolean } = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new GitHubError("Connect GitHub first.", 401);
  const res = await fetch(path.startsWith("http") ? path : `${API}${path}`, {
    ...init,
    headers: {
      Accept: init.raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new GitHubError(explain(res.status, (body as { message?: string }).message ?? res.statusText), res.status);
  }
  return (init.raw ? res.text() : res.json()) as Promise<T>;
}

export async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const data = await gh<{ data?: T; errors?: { message: string }[] }>("/graphql", {
    method: "POST", body: JSON.stringify({ query, variables }),
  });
  if (data.errors?.length) throw new GitHubError(data.errors.map((e) => e.message).join("; "), 400);
  return data.data as T;
}

/** GitHub's messages, translated into what the person should do next. */
function explain(status: number, message: string) {
  if (status === 401) return "Your GitHub sign-in has expired. Connect GitHub again.";
  if (/approving review|review is required|Code owner review|changes requested|review from/i.test(message))
    return "This needs approval before it can be published. A publisher (other than the author) must approve it first.";
  if (/required status check|is expected|checks? (are|is) (pending|failing)/i.test(message))
    return "The publish check has not passed yet. Wait for it to finish, or open the draft to see what needs fixing.";
  if (/not mergeable|merge conflict/i.test(message))
    return "This draft conflicts with a newer published change. Re-open it in the content editor and save it again.";
  if (status === 403 || status === 404)
    return `GitHub refused this (${message}). Your account may not have permission for it.`;
  return message;
}

// ---------------------------------------------------------------------------
// Sign-in through the same OAuth worker the content editor uses
// (Netlify/Decap popup protocol, implemented by sveltia-cms-auth).
// ---------------------------------------------------------------------------
export async function oauthBaseUrl(): Promise<string | null> {
  const yaml = await fetch(CONFIG_URL, { cache: "no-store" }).then((r) => r.text());
  const base = (load(yaml) as { backend?: { base_url?: string } }).backend?.base_url ?? "";
  return base && !base.includes("REPLACE-ME") ? base.replace(/\/$/, "") : null;
}

export function signInWithGitHub(baseUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const origin = new URL(baseUrl).origin;
    const url = `${baseUrl}/auth?provider=github&site_id=${encodeURIComponent(location.hostname)}&scope=repo,user`;
    const popup = window.open(url, "github-sign-in", "width=600,height=720");
    if (!popup) return reject(new Error("The sign-in window was blocked. Allow pop-ups for this site and try again."));
    const timer = window.setInterval(() => {
      if (popup.closed) { cleanup(); reject(new Error("The sign-in window was closed before finishing.")); }
    }, 500);
    function cleanup() { window.clearInterval(timer); window.removeEventListener("message", onMessage); }
    function onMessage(event: MessageEvent) {
      if (event.origin !== origin || typeof event.data !== "string") return;
      if (event.data === "authorizing:github") { popup!.postMessage(event.data, origin); return; }
      const match = /^authorization:github:(success|error):(.+)$/s.exec(event.data);
      if (!match) return;
      cleanup();
      popup!.close();
      try {
        const payload = JSON.parse(match[2]) as { token?: string; error?: string; message?: string };
        if (match[1] === "success" && payload.token) resolve(payload.token);
        else reject(new Error(payload.message ?? payload.error ?? "GitHub sign-in failed."));
      } catch { reject(new Error("GitHub sign-in returned an unexpected response.")); }
    }
    window.addEventListener("message", onMessage);
  });
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
export type GitHubRole = "admin" | "publisher" | "editor" | "none";

/** Logins listed as owners of the website content in .github/CODEOWNERS. */
export function publishersFrom(codeowners: string): string[] {
  const line = codeowners.split("\n").find((l) => /^\/src\/content\/\s/.test(l.trim()));
  return line ? [...line.matchAll(/@([\w-]+)/g)].map((m) => m[1].toLowerCase()) : [];
}

export async function loadCodeowners(): Promise<{ text: string; sha: string }> {
  const file = await gh<{ content: string; sha: string }>(`/repos/${OWNER}/${REPO}/contents/.github/CODEOWNERS?ref=main`);
  return { text: decodeBase64(file.content), sha: file.sha };
}

export async function whoAmI() {
  const [user, repo] = await Promise.all([
    gh<{ login: string; name: string | null; avatar_url: string }>("/user"),
    gh<{ permissions?: { admin: boolean; maintain: boolean; push: boolean } }>(`/repos/${OWNER}/${REPO}`),
  ]);
  let role: GitHubRole = "none";
  if (repo.permissions?.admin) role = "admin";
  else if (repo.permissions?.push) {
    const publishers = await loadCodeowners().then((c) => publishersFrom(c.text)).catch((): string[] => []);
    role = publishers.includes(user.login.toLowerCase()) ? "publisher" : "editor";
  }
  return { ...user, role };
}

export const ROLE_LABEL: Record<GitHubRole, string> = {
  admin: "Administrator", publisher: "Publisher", editor: "Editor", none: "No access",
};

export function decodeBase64(b64: string) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
export function encodeBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}
