import { gh, graphql, OWNER, REPO } from "./github";

/**
 * Read model for the publishing screen, built from GitHub's own records:
 *   draft      = an open pull request from this repository (the CMS opens one per save)
 *   preview    = the "Preview" commit status that deploy-pages.yml sets on the draft
 *   publish    = merging that pull request into main
 *   live       = the latest successful GitHub Pages deployment
 *   rollback   = a revert pull request, published like any other change
 */
const R = `/repos/${OWNER}/${REPO}`;

type PR = {
  number: number; node_id: string; title: string; html_url: string; draft: boolean; created_at: string; updated_at: string;
  merged_at: string | null; user: { login: string }; head: { ref: string; sha: string; repo: { full_name: string } | null };
  labels: { name: string }[];
};

export type DraftStage = "draft" | "in-review" | "ready";
export type Check = { state: "pending" | "success" | "failure" | "none"; url?: string; description?: string };

export type Draft = {
  number: number; nodeId: string; title: string; url: string; branch: string; sha: string; author: string; updated: string;
  stage: DraftStage; isRollback: boolean; files: string[]; approvals: string[];
  preview: Check; publishCheck: Check;
};

export type LiveStatus = {
  state: "live" | "building" | "failed" | "unknown";
  liveSha?: string; liveAt?: string; mainSha: string; runUrl?: string; message: string;
};

export async function getLiveStatus(): Promise<LiveStatus> {
  const [branch, deployments, runs] = await Promise.all([
    gh<{ commit: { sha: string } }>(`${R}/branches/main`),
    gh<{ id: number; sha: string; created_at: string }[]>(`${R}/deployments?environment=github-pages&per_page=10`),
    gh<{ workflow_runs: { head_sha: string; status: string; conclusion: string | null; html_url: string; event: string; head_branch: string }[] }>(
      `${R}/actions/workflows/deploy-pages.yml/runs?per_page=15`),
  ]);
  const mainSha = branch.commit.sha;
  let live: { sha: string; at: string } | undefined;
  for (const d of deployments) {
    const statuses = await gh<{ state: string }[]>(`${R}/deployments/${d.id}/statuses?per_page=5`);
    if (statuses.some((s) => s.state === "success")) { live = { sha: d.sha, at: d.created_at }; break; }
  }
  const runsForMain = runs.workflow_runs.filter((r) => r.head_sha === mainSha);
  const active = runs.workflow_runs.find((r) => r.status !== "completed");
  if (live?.sha === mainSha)
    return { state: active ? "building" : "live", liveSha: live.sha, liveAt: live.at, mainSha, runUrl: active?.html_url,
      message: active ? "The site is live and up to date. A preview build is running." : "Everything published is live." };
  if (active)
    return { state: "building", liveSha: live?.sha, liveAt: live?.at, mainSha, runUrl: active.html_url,
      message: "Publishing — the new version is being built. The site keeps showing the previous version until it finishes (usually 2–4 minutes)." };
  const failed = runsForMain.find((r) => r.conclusion && r.conclusion !== "success");
  if (failed)
    return { state: "failed", liveSha: live?.sha, liveAt: live?.at, mainSha, runUrl: failed.html_url,
      message: "The last publish failed to build. The site still shows the previous version. Open the build log or ask a developer." };
  return { state: "unknown", liveSha: live?.sha, liveAt: live?.at, mainSha, message: "Waiting for the build to start." };
}

function stageFrom(labels: { name: string }[]): DraftStage {
  const names = labels.map((l) => l.name);
  if (names.some((n) => /pending_publish$/.test(n))) return "ready";
  if (names.some((n) => /pending_review$/.test(n))) return "in-review";
  return "draft";
}

async function checksFor(sha: string): Promise<{ preview: Check; publishCheck: Check }> {
  const [combined, runs] = await Promise.all([
    gh<{ statuses: { context: string; state: string; target_url: string | null; description: string | null }[] }>(`${R}/commits/${sha}/status`),
    gh<{ check_runs: { name: string; status: string; conclusion: string | null; html_url: string }[] }>(`${R}/commits/${sha}/check-runs?per_page=50`),
  ]);
  const p = combined.statuses.find((s) => s.context === "Preview");
  const preview: Check = p
    ? { state: p.state === "success" ? "success" : p.state === "pending" ? "pending" : "failure", url: p.target_url ?? undefined, description: p.description ?? undefined }
    : { state: "none" };
  const c = runs.check_runs.find((r) => r.name === "Publish check");
  const publishCheck: Check = c
    ? { state: c.status !== "completed" ? "pending" : c.conclusion === "success" ? "success" : "failure", url: c.html_url }
    : { state: "none" };
  return { preview, publishCheck };
}

export async function getDrafts(): Promise<Draft[]> {
  const prs = await gh<PR[]>(`${R}/pulls?state=open&per_page=50&sort=updated&direction=desc`);
  const own = prs.filter((pr) => pr.head.repo?.full_name === `${OWNER}/${REPO}`);
  return Promise.all(own.map(async (pr) => {
    const [files, reviews, checks] = await Promise.all([
      gh<{ filename: string }[]>(`${R}/pulls/${pr.number}/files?per_page=100`),
      gh<{ user: { login: string }; state: string; commit_id: string }[]>(`${R}/pulls/${pr.number}/reviews?per_page=100`),
      checksFor(pr.head.sha),
    ]);
    const latest = new Map<string, { state: string; commit_id: string }>();
    reviews.forEach((r) => latest.set(r.user.login, r));
    const approvals = [...latest].filter(([, r]) => r.state === "APPROVED" && r.commit_id === pr.head.sha).map(([login]) => login);
    return {
      number: pr.number, nodeId: pr.node_id, title: pr.title, url: pr.html_url, branch: pr.head.ref, sha: pr.head.sha, author: pr.user.login,
      updated: pr.updated_at, stage: stageFrom(pr.labels), isRollback: /^revert-|^Roll back|^Revert "/.test(pr.head.ref + pr.title),
      files: files.map((f) => f.filename), approvals, ...checks,
    };
  }));
}

export type Published = { number: number; nodeId: string; title: string; url: string; author: string; mergedAt: string; isRollback: boolean };

export async function getHistory(): Promise<Published[]> {
  const prs = await gh<PR[]>(`${R}/pulls?state=closed&per_page=40&sort=updated&direction=desc`);
  return prs
    .filter((pr) => pr.merged_at)
    .sort((a, b) => b.merged_at!.localeCompare(a.merged_at!))
    .slice(0, 25)
    .map((pr) => ({
      number: pr.number, nodeId: pr.node_id, title: pr.title, url: pr.html_url, author: pr.user.login, mergedAt: pr.merged_at!,
      isRollback: /^Revert "|^Roll back/.test(pr.title),
    }));
}

export function approve(number: number) {
  return gh(`${R}/pulls/${number}/reviews`, { method: "POST", body: JSON.stringify({ event: "APPROVE", body: "Approved in the staff portal after checking the preview." }) });
}

export async function publish(draft: Draft) {
  await gh(`${R}/pulls/${draft.number}/merge`, {
    // `sha` makes GitHub refuse the merge if the draft changed after it was
    // previewed and approved, so what goes live is exactly what was checked.
    method: "PUT", body: JSON.stringify({ merge_method: "squash", commit_title: `${draft.title} (#${draft.number})`, sha: draft.sha }),
  });
  // Same housekeeping the content editor does after publishing.
  await gh(`${R}/git/refs/heads/${encodeURIComponent(draft.branch)}`, { method: "DELETE" }).catch(() => undefined);
}

export async function rollback(item: Published) {
  const data = await graphql<{ revertPullRequest: { revertPullRequest: { number: number; url: string } } }>(
    `mutation($id: ID!, $title: String!, $body: String!) {
      revertPullRequest(input: { pullRequestId: $id, title: $title, body: $body }) { revertPullRequest { number url } }
    }`,
    { id: item.nodeId, title: `Roll back: ${item.title}`, body: `Restores the website to how it was before #${item.number}. Created from the staff portal.` },
  );
  return data.revertPullRequest.revertPullRequest;
}

/** Plain-language names for the files a draft changes. */
export function describeFile(path: string) {
  const page = /^src\/content\/pages\/(.+)\.json$/.exec(path);
  if (page) return `Page: ${page[1]}`;
  if (path.startsWith("public/brand/")) return `Media: ${path.slice("public/brand/".length)}`;
  const named: Record<string, string> = {
    "src/content/site.json": "Company, menus & footer", "src/content/forms.json": "Forms", "src/content/theme.json": "Brand & appearance",
    "src/content/services.json": "Service catalogue", "src/content/direct-answers.json": "Tax figures & sources",
    "src/content/testimonials.json": "Testimonials", "src/content/service-page.json": "Service page labels",
    "src/content/service-hero-images.json": "Service page photos",
  };
  return named[path] ?? `Code: ${path}`;
}
