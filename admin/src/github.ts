import { load } from "js-yaml";

/**
 * GitHub access for the publishing screen. After the admin signs in, the
 * sign-in worker exchanges their Firebase session for the GitHub token that
 * saves and publishes the site (see admin/auth-worker). It is kept only for
 * this browser tab.
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
  if (!token) throw new GitHubError("Website publishing is not connected. Sign out and sign in again.", 401);
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

/** GitHub's messages, translated into what the admin should do next. */
function explain(status: number, message: string) {
  if (status === 401) return "The website publishing connection has expired. A developer needs to renew the GitHub token (docs/cms-setup.md).";
  if (/required status check|is expected|checks? (are|is) (pending|failing)/i.test(message))
    return "The publish check has not passed yet. Wait for it to finish, or open the draft to see what needs fixing.";
  if (/not mergeable|merge conflict/i.test(message))
    return "This draft conflicts with a newer published change. Re-open it in the content editor and save it again.";
  if (status === 403 || status === 404) return `GitHub refused this (${message}).`;
  return message;
}

/** The sign-in worker's address, from the content editor's configuration. */
export async function workerUrl(): Promise<string | null> {
  const yaml = await fetch(CONFIG_URL, { cache: "no-store" }).then((r) => r.text());
  const base = (load(yaml) as { backend?: { base_url?: string } }).backend?.base_url ?? "";
  return base && !base.includes("REPLACE-ME") ? base.replace(/\/$/, "") : null;
}

/** Exchanges the admin's Firebase session for the publishing token. */
export async function fetchGitHubToken(idToken: string): Promise<string> {
  const base = await workerUrl();
  if (!base) throw new Error("The sign-in worker is not configured.");
  const res = await fetch(`${base}/token`, { method: "POST", headers: { Authorization: `Bearer ${idToken}` } });
  const body = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
  if (!res.ok || !body.token) throw new Error(body.error ?? "Website publishing could not be connected.");
  return body.token;
}

export function decodeBase64(b64: string) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
