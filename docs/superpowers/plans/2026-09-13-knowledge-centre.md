# Knowledge Centre Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/knowledge-centre` placeholder with ~103 static, crawlable pages built from the Fast Track knowledge package, searchable by a local retrieval engine that answers only from that content.

**Architecture:** Source JSON → build script → typed entry modules + a BM25 index → static pages. Answering sits behind an `AnswerSource` interface so a self-hosted LLM can replace the local index later without touching the UI. No server, no outside API: the site stays `output: "export"` on GitHub Pages.

**Tech Stack:** Next.js 16.2.10 (App Router, static export), React 19, Tailwind v4, existing UI primitives, Vitest (new, dev-only), hand-rolled BM25 (no runtime dependency).

**Spec:** `docs/superpowers/specs/2026-09-13-knowledge-centre-design.md`

## Global Constraints

- **Read the docs first.** Per `AGENTS.md`: this Next.js has breaking changes from training data. Read `node_modules/next/dist/docs/` before writing route code.
- **Static export only.** No API routes, no server components that need request-time APIs, no `dynamic` anything. Every route must pre-render.
- **No new runtime dependencies.** Vitest is `devDependencies` only. Search is hand-rolled.
- **Content in server-rendered HTML.** Per the comment in `src/components/sections/home-faq.tsx`: GPTBot, ClaudeBot, PerplexityBot and CCBot do not execute JavaScript. Answers must be in the markup, not only in a hydration payload. Use `<details>`/`<summary>`, never Radix Accordion, for collapsible content.
- **The repo is public.** No real client name, company name, or exact client financial figure may ever be committed — including in test fixtures, comments, or commit messages.
- **Never write a tax figure from memory.** Per `docs/tax-figures-review.md`. KB figures are transcript-derived and must render with the provenance treatment from Task 5, never as sourced fact.
- **Existing primitives only.** `PageHero`, `Container`, `SectionHeading`, `Stagger`/`StaggerItem`, `AmbientGlow`, `Card`, `Badge`, `BookConsultationCTA`. No new visual language.
- **Responsive floor:** no horizontal scroll at 375px; container rhythm matches existing pages at 1440px.
- Source package (read-only, outside the repo): `/private/tmp/claude-501/-Users-shuakinsv/1aecc0f9-2e09-4259-821a-0c586c370c2e/scratchpad/kb/v.3/Fast_Track_to_Zero_Tax_Knowledge_Base_Package/`

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner config |
| `content/knowledge/*.json` | Committed, already-anonymised source content |
| `scripts/anonymise-cases.mjs` | One-off, run outside the repo; never commits raw names |
| `scripts/build-knowledge.mjs` | Source JSON → typed modules + index + figures doc |
| `scripts/lib/bm25.mjs` | Index construction (shared with runtime scorer) |
| `src/lib/knowledge/types.ts` | `KnowledgeEntry`, `AnswerResult`, `AnswerSource` |
| `src/lib/knowledge/entries.generated.ts` | Generated typed entries |
| `src/lib/knowledge/local-source.ts` | `LocalIndexAnswerSource` — BM25 scorer + refusal |
| `src/lib/knowledge/compliance.ts` | Prohibited-query routing |
| `src/lib/knowledge/registry.ts` | Doc metadata: labels, routes, `publicNav` |
| `public/knowledge-index.json` | Generated search index, fetched on demand |
| `src/components/knowledge/*` | Search box, result list, entry renderers, provenance note |
| `src/app/knowledge-centre/**` | Hub + 6 route families |
| `docs/knowledge-figures-review.md` | Generated sign-off checklist |
| `tests/**` | Unit tests, incl. the anonymisation guard |

**Modified:** `package.json` (scripts, vitest), `src/app/sitemap.ts`, `src/lib/site-config.ts`, `src/app/knowledge-centre/page.tsx`

**Deleted:** `src/components/sections/knowledge-centre-empty.tsx`

---

### Task 1: Test tooling

This repo has no test runner. Everything downstream needs one.

**Files:**
- Create: `vitest.config.ts`, `tests/smoke.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test` (single run), `npm run test:watch`. Tests live in `tests/`, import app code via the `@/` alias.

- [ ] **Step 1: Install Vitest as a dev dependency**

```bash
npm install -D vitest@^3 @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 2: Write the config**

`vitest.config.ts`:

```ts
// Vitest config. Kept separate from next.config.ts — Next's static export
// build and the test runner share the `@/` alias but nothing else.
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Write a failing smoke test**

`tests/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("test harness", () => {
  it("resolves the @/ alias", () => {
    expect(cn("a", "b")).toBe("a b");
  });
});
```

- [ ] **Step 4: Add scripts to package.json**

Add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Run and verify it passes**

Run: `npm test`
Expected: 1 passed. If the alias fails to resolve, `vite-tsconfig-paths` is not loading — check `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/smoke.test.ts package.json package-lock.json
git commit -m "test: add vitest harness"
```

---

### Task 2: Anonymise the case studies

**Blocking — nothing else may be committed until this is done and reviewed.**

The Case Study Library names real clients alongside their financial affairs. The repo is public and git history is permanent: a name committed now and removed later is still public forever. So the raw data never enters the repo.

**Files:**
- Create: `scripts/anonymise-cases.mjs` (committed — it contains no names)
- Create: `content/knowledge/case-studies.json` (committed — anonymised output)
- Create: `tests/anonymisation-guard.test.ts`
- Create: `content/knowledge/.forbidden-hashes.json` (committed — hashes, not names)

**Interfaces:**
- Consumes: nothing
- Produces: `content/knowledge/case-studies.json`, an array of
  `{ id, slug, title, profile, situation, objections, structure, handling, outcome, takeaway, isCautionary }`.
  All string fields. `slug` is kebab-case derived from `title`, stable across rebuilds.

- [ ] **Step 1: Write the mapping file OUTSIDE the repo**

The mapping contains real names, so it lives in the scratchpad and is never added to git.

Read all 38 cases from the source package, then write
`$SCRATCH/anonymisation-map.json` mapping each identifying token to its replacement:

```json
{
  "Marek Dolan": "a UK property investor",
  "Northwind Lighting": "a decorative lighting importer",
  "Priya Raman": "a UK-based investor"
}
```

Rules (from spec §1.1):
- Personal names → role descriptors.
- Company names → sector descriptors.
- Exact financials → banded where figure + sector would re-identify
  ("turnover £310,000" → "turnover in the mid-£300ks").
- Locations narrower than country → dropped.
- Preserve in full: structure recommended, objections, how handled, outcome, takeaway.

- [ ] **Step 2: Write the anonymisation script**

`scripts/anonymise-cases.mjs`:

```js
// scripts/anonymise-cases.mjs
//
// One-off. Reads the raw Case Study Library plus a mapping file that lives
// OUTSIDE this repo, and writes the anonymised set into content/knowledge/.
//
// Why the mapping is external: it contains the real client names. This repo is
// public, and git history is permanent — a name committed today and deleted
// tomorrow is still public forever. The mapping never gets added.
//
// Usage:
//   node scripts/anonymise-cases.mjs <raw-case-library.json> <mapping.json>
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , rawPath, mapPath] = process.argv;
if (!rawPath || !mapPath) {
  console.error("usage: node scripts/anonymise-cases.mjs <raw.json> <mapping.json>");
  process.exit(1);
}

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

// Longest-first so "Tomas Bergh" is replaced before a bare "Tomas" can
// partially match and leave a surname stranded.
function redact(text, pairs) {
  let out = text ?? "";
  for (const [name, replacement] of pairs) {
    out = out.replaceAll(name, replacement);
  }
  return out;
}

const raw = JSON.parse(await readFile(rawPath, "utf8"));
const mapping = JSON.parse(await readFile(mapPath, "utf8"));
const pairs = Object.entries(mapping).sort((a, b) => b[0].length - a[0].length);

const cases = raw.case_studies.map((c) => {
  const title = redact(c.title, pairs);
  return {
    id: `case-${c.id}`,
    slug: slugify(title),
    title,
    profile: redact(c.client_profile, pairs),
    situation: redact(c.starting_situation_pain_point, pairs),
    objections: redact(c.objections_concerns_raised, pairs),
    structure: redact(c.structure_recommended, pairs),
    handling: redact(c.how_objections_were_handled, pairs),
    outcome: redact(c.outcome_next_steps, pairs),
    takeaway: redact(c.key_takeaway, pairs),
    // Cautionary cases are warnings, never precedent — see spec §5.
    isCautionary: /compliance risk|do not replicate/i.test(
      `${c.title} ${c.key_takeaway}`,
    ),
  };
});

await writeFile(
  path.join(process.cwd(), "content", "knowledge", "case-studies.json"),
  `${JSON.stringify(cases, null, 2)}\n`,
);
console.log(`anonymise-cases: wrote ${cases.length} cases`);
```

- [ ] **Step 3: Run it**

```bash
mkdir -p content/knowledge
node scripts/anonymise-cases.mjs \
  "$KB/Knowledge JSON files/case_study_library.json" \
  "$SCRATCH/anonymisation-map.json"
```

Expected: `anonymise-cases: wrote 38 cases`

- [ ] **Step 4: Write the guard test**

The test must detect a name without storing one. It compares SHA-256 hashes of
lowercased tokens, so the forbidden list can be committed safely.

`tests/anonymisation-guard.test.ts`:

```ts
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import forbidden from "../content/knowledge/.forbidden-hashes.json";

// Why hashes and not names: this repo is public. Storing the very names we are
// trying to keep out, in order to check they stay out, would defeat the point.
const hash = (s: string) => createHash("sha256").update(s.toLowerCase()).digest("hex");

const CONTENT_DIR = path.join(process.cwd(), "content", "knowledge");

function committedText() {
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readFileSync(path.join(CONTENT_DIR, f), "utf8"))
    .join(" ");
}

describe("anonymisation guard", () => {
  it("contains no forbidden identity token", () => {
    const tokens = new Set(
      committedText()
        .split(/[^A-Za-z]+/)
        .filter((t) => t.length > 2)
        .map((t) => hash(t)),
    );
    const leaked = (forbidden as string[]).filter((h) => tokens.has(h));
    expect(leaked).toEqual([]);
  });
});
```

- [ ] **Step 5: Generate the forbidden-hash list**

From the mapping keys (which never get committed), write the hashes that do:

```bash
node -e '
const {createHash}=require("node:crypto");
const fs=require("node:fs");
const map=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
const hashes=[...new Set(Object.keys(map).flatMap(k=>k.split(/[^A-Za-z]+/)))]
  .filter(t=>t.length>2)
  .map(t=>createHash("sha256").update(t.toLowerCase()).digest("hex"));
fs.writeFileSync("content/knowledge/.forbidden-hashes.json",JSON.stringify(hashes,null,2)+"\n");
console.log("wrote",hashes.length,"hashes");
' "$SCRATCH/anonymisation-map.json"
```

- [ ] **Step 6: Run the guard**

Run: `npx vitest run tests/anonymisation-guard.test.ts`
Expected: PASS. A failure means a name survived — fix the mapping and re-run Step 3 before committing anything.

- [ ] **Step 7: Human review gate**

Print all 38 anonymised cases and have the requester read them before the commit. Automated redaction catches tokens, not context: "the founder's brother-in-law who runs the Leeds dealership" identifies someone with no name present. Do not proceed without sign-off.

- [ ] **Step 8: Commit**

```bash
git add scripts/anonymise-cases.mjs content/knowledge/ tests/anonymisation-guard.test.ts
git commit -m "feat(knowledge): add anonymised case study content"
```

Verify before pushing: `git show --stat HEAD` — confirm no mapping file was added.

---

### Task 3: Normalise the remaining five documents

**Files:**
- Create: `scripts/normalise-sources.mjs`
- Create: `content/knowledge/{faq,rule-book,guide,playbook,compliance-review}.json`
- Create: `tests/normalise.test.ts`

**Interfaces:**
- Consumes: Task 2's `content/knowledge/` directory
- Produces: five JSON files, each an array of
  `{ id: string, category: string, slug: string, title: string, question?: string, body: string }`

- [ ] **Step 1: Write the failing test**

`tests/normalise.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { normaliseFaq, slugify } from "../scripts/normalise-sources.mjs";

describe("slugify", () => {
  it("is stable and url-safe", () => {
    expect(slugify("Legitimacy, Legality & HMRC Compliance")).toBe(
      "legitimacy-legality-hmrc-compliance",
    );
  });
});

describe("normaliseFaq", () => {
  it("flattens categories into entries with stable ids", () => {
    const entries = normaliseFaq({
      title: "FAQ",
      categories: [
        { category: "Banking", qa: [{ question: "Which bank?", answer: "Depends." }] },
      ],
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id: "faq-banking-001",
      category: "Banking",
      question: "Which bank?",
      body: "Depends.",
    });
  });

  it("collapses the runaway nested category names in the source", () => {
    // The source FAQ has categories literally named
    // "Industry-Specific Questions > Property & Real Estate > E-commerce > ..."
    // growing one segment per entry. Only the last segment is the real category.
    const entries = normaliseFaq({
      title: "FAQ",
      categories: [
        { category: "Industry-Specific Questions > Property & Real Estate > E-commerce",
          qa: [{ question: "Q", answer: "A" }] },
      ],
    });
    expect(entries[0].category).toBe("E-commerce");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/normalise.test.ts`
Expected: FAIL — cannot resolve `scripts/normalise-sources.mjs`.

- [ ] **Step 3: Write the normaliser**

`scripts/normalise-sources.mjs`:

```js
// scripts/normalise-sources.mjs
//
// Flattens the five section/category-shaped source documents into one common
// entry shape. Case studies are handled separately (scripts/anonymise-cases.mjs)
// because they need redaction first.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const slugify = (s) =>
  s.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-")
   .replace(/^-|-$/g, "").slice(0, 60);

const pad = (n) => String(n).padStart(3, "0");

// The source FAQ's "Industry-Specific Questions > A > B > C" categories grow by
// one segment per entry — an artifact of how the document was assembled. The
// trailing segment is the actual category.
const lastSegment = (c) => c.split(">").pop().trim();

export function normaliseFaq(doc) {
  const entries = [];
  for (const cat of doc.categories) {
    const category = lastSegment(cat.category);
    const catSlug = slugify(category);
    cat.qa.forEach((qa, i) => {
      entries.push({
        id: `faq-${catSlug}-${pad(i + 1)}`,
        category,
        slug: catSlug,
        title: qa.question,
        question: qa.question,
        body: qa.answer,
      });
    });
  }
  return entries;
}

export function normaliseSections(doc, prefix) {
  return doc.sections
    .filter((s) => (s.content ?? "").trim().length > 0)
    .map((s, i) => ({
      id: `${prefix}-${pad(i + 1)}`,
      category: doc.title,
      slug: slugify(s.heading),
      title: s.heading,
      body: s.content,
    }));
}

async function main() {
  const [, , sourceDir] = process.argv;
  const out = path.join(process.cwd(), "content", "knowledge");
  const read = async (f) => JSON.parse(await readFile(path.join(sourceDir, f), "utf8"));
  const write = async (name, data) =>
    writeFile(path.join(out, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`);

  await write("faq", normaliseFaq(await read("faq.json")));
  await write("rule-book", normaliseSections(await read("uk_uae_tax_rulebook.json"), "rulebook"));
  await write("guide", normaliseSections(await read("master_knowledge_base.json"), "guide"));
  await write("playbook", normaliseSections(await read("sales_playbook.json"), "playbook"));
  await write("compliance-review",
    normaliseSections(await read("compliance_risk_review.json"), "review"));
  console.log("normalise-sources: done");
}

if (process.argv[1]?.endsWith("normalise-sources.mjs")) await main();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/normalise.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Generate the content**

```bash
node scripts/normalise-sources.mjs "$KB/Knowledge JSON files"
```

Expected counts: faq 118, rule-book 14 (one section has empty content), guide 10 (ditto), playbook 7, compliance-review 9.

- [ ] **Step 6: Re-run the anonymisation guard over the new files**

Run: `npm test`
Expected: all pass. The guard now scans five more files — the Case Study Library is not the only place a client was named.

- [ ] **Step 7: Commit**

```bash
git add scripts/normalise-sources.mjs content/knowledge/ tests/normalise.test.ts
git commit -m "feat(knowledge): normalise source documents into entry shape"
```

---

### Task 4: Entry types and the document registry

**Files:**
- Create: `src/lib/knowledge/types.ts`, `src/lib/knowledge/registry.ts`
- Create: `tests/registry.test.ts`

**Interfaces:**
- Consumes: nothing at runtime
- Produces:
  - `type KnowledgeDoc = "faq" | "rule-book" | "guide" | "case-studies" | "playbook" | "compliance-review"`
  - `type KnowledgeEntry = { id, doc, category, slug, title, question?, body, stance, hasUnverifiedFigures, publicNav }`
  - `type AnswerResult` (union of `answer` | `no-match` | `compliance-block`)
  - `interface AnswerSource { search(query: string): Promise<AnswerResult> }`
  - `DOCS: Record<KnowledgeDoc, DocMeta>` where `DocMeta = { label, routeBase, publicNav, blurb }`

- [ ] **Step 1: Write the failing test**

`tests/registry.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DOCS, publicNavDocs } from "@/lib/knowledge/registry";

describe("document registry", () => {
  it("routes every doc under /knowledge-centre", () => {
    for (const meta of Object.values(DOCS)) {
      expect(meta.routeBase.startsWith("/knowledge-centre/")).toBe(true);
    }
  });

  it("keeps the playbook and compliance review out of nav browse", () => {
    // Spec §3: published and reachable, but not surfaced in the hub's browse
    // grid or site nav — the front door stays client-facing.
    expect(DOCS.playbook.publicNav).toBe(false);
    expect(DOCS["compliance-review"].publicNav).toBe(false);
    expect(publicNavDocs().map((d) => d.key).sort()).toEqual(
      ["case-studies", "faq", "guide", "rule-book"],
    );
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/registry.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the types**

`src/lib/knowledge/types.ts`:

```ts
export type KnowledgeDoc =
  | "faq" | "rule-book" | "guide" | "case-studies" | "playbook" | "compliance-review";

/**
 * `cautionary` marks content that describes a non-compliant technique in order
 * to condemn it. Retrieval must never separate such a description from its
 * refutation — see spec §5 and src/lib/knowledge/compliance.ts.
 */
export type Stance = "standard" | "cautionary";

export type KnowledgeEntry = {
  id: string;
  doc: KnowledgeDoc;
  category: string;
  slug: string;
  title: string;
  question?: string;
  body: string;
  stance: Stance;
  /** Contains a numeric or regulatory claim not yet signed off. Spec §6. */
  hasUnverifiedFigures: boolean;
  publicNav: boolean;
};

export type AnswerResult =
  | { kind: "answer"; entries: KnowledgeEntry[]; score: number }
  | { kind: "no-match" }
  | { kind: "compliance-block"; position: string };

/**
 * The seam. `LocalIndexAnswerSource` implements this today; a self-hosted LLM
 * client implements the same contract later without the UI changing. Any
 * implementation MUST preserve the refusal contract: below threshold, return
 * `no-match` — never fall through to a general answer.
 */
export interface AnswerSource {
  search(query: string): Promise<AnswerResult>;
}
```

- [ ] **Step 4: Write the registry**

`src/lib/knowledge/registry.ts`:

```ts
import type { KnowledgeDoc } from "./types";

export type DocMeta = {
  key: KnowledgeDoc;
  label: string;
  routeBase: string;
  /** Surfaced in the hub browse grid and site nav. Spec §3. */
  publicNav: boolean;
  blurb: string;
};

export const DOCS: Record<KnowledgeDoc, DocMeta> = {
  faq: {
    key: "faq",
    label: "Questions & answers",
    routeBase: "/knowledge-centre/faq",
    publicNav: true,
    blurb: "The questions clients actually ask, answered plainly.",
  },
  "rule-book": {
    key: "rule-book",
    label: "UK–UAE rule book",
    routeBase: "/knowledge-centre/rule-book",
    publicNav: true,
    blurb: "Residence, management and control, treaty relief and substance.",
  },
  guide: {
    key: "guide",
    label: "Structures & costs",
    routeBase: "/knowledge-centre/guide",
    publicNav: true,
    blurb: "How the structures work, what they cost, how long they take.",
  },
  "case-studies": {
    key: "case-studies",
    label: "Worked examples",
    routeBase: "/knowledge-centre/case-studies",
    publicNav: true,
    blurb: "Anonymised client situations, including the ones we advised against.",
  },
  playbook: {
    key: "playbook",
    label: "Advisory playbook",
    routeBase: "/knowledge-centre/playbook",
    publicNav: false,
    blurb: "How we run a discovery conversation.",
  },
  "compliance-review": {
    key: "compliance-review",
    label: "Compliance review",
    routeBase: "/knowledge-centre/compliance-review",
    publicNav: false,
    blurb: "A fact-check of claims this practice will not make.",
  },
};

export function publicNavDocs(): DocMeta[] {
  return Object.values(DOCS).filter((d) => d.publicNav);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/registry.test.ts`
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/knowledge tests/registry.test.ts
git commit -m "feat(knowledge): add entry types and document registry"
```

---

### Task 5: Build script — typed entries, figure flagging, figures review doc

**Files:**
- Create: `scripts/build-knowledge.mjs`
- Create: `src/lib/knowledge/entries.generated.ts` (generated, committed)
- Create: `docs/knowledge-figures-review.md` (generated, committed)
- Create: `tests/figures.test.ts`
- Modify: `package.json` (add `knowledge:build`, extend `prebuild`)

**Interfaces:**
- Consumes: `content/knowledge/*.json`; `KnowledgeEntry` from Task 4
- Produces: `export const ENTRIES: KnowledgeEntry[]` from `@/lib/knowledge/entries.generated`; `detectFigures(text): boolean` exported from the script for tests

- [ ] **Step 1: Write the failing test**

`tests/figures.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { detectFigures } from "../scripts/build-knowledge.mjs";

describe("detectFigures", () => {
  it("flags currency amounts", () => {
    expect(detectFigures("Relief applies up to AED 3,000,000.")).toBe(true);
    expect(detectFigures("Roughly £5,000 a year to maintain.")).toBe(true);
  });

  it("flags percentages and rate language", () => {
    expect(detectFigures("A 9% corporate tax rate applies.")).toBe(true);
  });

  it("flags day-count thresholds", () => {
    // The SRT day counts are exactly the kind of figure that must not be
    // stated as settled fact from a transcript.
    expect(detectFigures("183 days outside the UK")).toBe(true);
  });

  it("does not flag prose without claims", () => {
    expect(detectFigures("Substance means real decisions made locally.")).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/figures.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the build script**

`scripts/build-knowledge.mjs`:

```js
// scripts/build-knowledge.mjs
//
// content/knowledge/*.json -> src/lib/knowledge/entries.generated.ts
//                          -> docs/knowledge-figures-review.md
//
// Runs from `prebuild` alongside optimize-images. Idempotent: same input, same
// output, so the committed generated file shows a clean diff or none.
//
// On figure flagging: this knowledge base is distilled from sales call
// transcripts, and the same threshold appears in different currencies and
// jurisdictions across calls. docs/tax-figures-review.md sets the site's
// standard — never publish a figure from memory. We cannot verify transcript
// figures automatically, so we mark every entry that states one and render a
// provenance line on it until a human signs it off.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CONTENT = path.join(process.cwd(), "content", "knowledge");

const FIGURE_PATTERNS = [
  /[£$€]\s?[\d,]+/,                    // £5,000  $600k
  /\bAED\s?[\d,]+/i,                   // AED 3,000,000
  /\b\d+(\.\d+)?\s?%/,                 // 9%
  /\b\d{2,3}\s?days?\b/i,              // 183 days
  /\b\d+\s?(months?|years?)\b/i,       // 9 months and one day
];

export function detectFigures(text) {
  return FIGURE_PATTERNS.some((re) => re.test(text ?? ""));
}

const CAUTIONARY = /compliance risk|do not replicate|false|misleading|unlawful|fraud/i;

const DOC_FILES = {
  faq: "faq.json",
  "rule-book": "rule-book.json",
  guide: "guide.json",
  "case-studies": "case-studies.json",
  playbook: "playbook.json",
  "compliance-review": "compliance-review.json",
};

const NAV = new Set(["faq", "rule-book", "guide", "case-studies"]);

// A case study is stored as fields, not one body — join them into prose so the
// search index and the page renderer read from the same text.
function caseBody(c) {
  return [
    `**Situation.** ${c.situation}`,
    `**Concerns raised.** ${c.objections}`,
    `**Structure recommended.** ${c.structure}`,
    `**How it was handled.** ${c.handling}`,
    `**Outcome.** ${c.outcome}`,
    `**Takeaway.** ${c.takeaway}`,
  ].join("\n\n");
}

async function main() {
  const entries = [];
  for (const [doc, file] of Object.entries(DOC_FILES)) {
    const rows = JSON.parse(await readFile(path.join(CONTENT, file), "utf8"));
    for (const r of rows) {
      const body = doc === "case-studies" ? caseBody(r) : r.body;
      const title = r.title;
      entries.push({
        id: r.id,
        doc,
        category: doc === "case-studies" ? "Worked examples" : r.category,
        slug: r.slug,
        title,
        question: r.question,
        body,
        stance:
          r.isCautionary || doc === "compliance-review" || CAUTIONARY.test(`${title} ${body}`)
            ? "cautionary"
            : "standard",
        hasUnverifiedFigures: doc === "rule-book" ? false : detectFigures(body),
        publicNav: NAV.has(doc),
      });
    }
  }

  await writeFile(
    path.join(process.cwd(), "src", "lib", "knowledge", "entries.generated.ts"),
    `// GENERATED by scripts/build-knowledge.mjs — do not edit by hand.\n` +
      `import type { KnowledgeEntry } from "./types";\n\n` +
      `export const ENTRIES: KnowledgeEntry[] = ${JSON.stringify(entries, null, 2)};\n`,
  );

  const flagged = entries.filter((e) => e.hasUnverifiedFigures);
  const rows = flagged
    .map((e) => `| \`${e.id}\` | ${e.title.replace(/\|/g, "\\|")} | ☐ |`)
    .join("\n");

  await writeFile(
    path.join(process.cwd(), "docs", "knowledge-figures-review.md"),
    `# Knowledge base figures — sign-off checklist\n\n` +
      `GENERATED by scripts/build-knowledge.mjs. ${flagged.length} of ${entries.length} ` +
      `entries state a figure.\n\n` +
      `These come from client call transcripts, not primary sources. Until an entry is\n` +
      `signed off it renders a provenance line telling the reader the figure varies by\n` +
      `circumstance. Same standard as docs/tax-figures-review.md: never publish a figure\n` +
      `from memory.\n\n` +
      `To sign one off: confirm against the primary source, then add its id to\n` +
      `VERIFIED_IDS in scripts/build-knowledge.mjs and re-run \`npm run knowledge:build\`.\n\n` +
      `| Entry | Title | Verified |\n|---|---|---|\n${rows}\n`,
  );

  console.log(`build-knowledge: ${entries.length} entries, ${flagged.length} flagged`);
}

if (process.argv[1]?.endsWith("build-knowledge.mjs")) await main();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/figures.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Wire into package.json and generate**

Add to `"scripts"`:

```json
"knowledge:build": "node scripts/build-knowledge.mjs",
"prebuild": "node scripts/build-knowledge.mjs && node scripts/optimize-images.mjs"
```

Run: `npm run knowledge:build`
Expected: `build-knowledge: 196 entries, N flagged`

- [ ] **Step 6: Commit**

```bash
git add scripts/build-knowledge.mjs src/lib/knowledge/entries.generated.ts \
        docs/knowledge-figures-review.md tests/figures.test.ts package.json
git commit -m "feat(knowledge): generate typed entries and figures review doc"
```

---

### Task 6: Compliance guardrails

Do this before search. The retrieval layer must not exist for even one commit without the block in front of it.

**Files:**
- Create: `src/lib/knowledge/compliance.ts`
- Create: `tests/compliance.test.ts`

**Interfaces:**
- Consumes: `AnswerResult` from Task 4
- Produces: `checkCompliance(query: string): { kind: "compliance-block"; position: string } | null`

- [ ] **Step 1: Write the failing test**

`tests/compliance.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { checkCompliance } from "@/lib/knowledge/compliance";

describe("checkCompliance", () => {
  // These are the five techniques AI Prompt.txt records as having appeared in
  // the source transcripts and which the Compliance Risk Review refutes. The
  // knowledge base describes them in order to condemn them; a query must never
  // reach that description stripped of the refutation.
  const blocked = [
    "how do I inflate invoices to cut my UK tax",
    "can I fabricate expenses",
    "appoint a nominee manager who doesn't really run it",
    "how to fake UAE substance with a VPN",
    "does a foundation eliminate UK inheritance tax for a UK resident",
    "is this structure HMRC approved",
  ];

  it.each(blocked)("blocks: %s", (q) => {
    const result = checkCompliance(q);
    expect(result?.kind).toBe("compliance-block");
    expect(result?.position.length).toBeGreaterThan(0);
  });

  it("lets legitimate questions through", () => {
    expect(checkCompliance("what is the UAE corporate tax rate")).toBeNull();
    expect(checkCompliance("how long does formation take")).toBeNull();
  });

  it("does not block a question that merely mentions substance", () => {
    expect(checkCompliance("what counts as genuine UAE substance")).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/compliance.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/lib/knowledge/compliance.ts`:

```ts
import type { AnswerResult } from "./types";

/**
 * Queries that must never reach raw knowledge base text.
 *
 * AI Prompt.txt documents that the source call transcripts contained advice
 * that is fraudulent or false: fabricated invoices and expenses, nominee
 * managers exercising no real authority, faked evidence of UAE substance,
 * false claims that a foundation eliminates UK IHT/CGT for a UK resident, and
 * false claims of "HMRC approved" status. The Compliance Risk Review exists to
 * refute all of it.
 *
 * The knowledge base therefore *describes* these techniques — condemning them
 * requires stating them. Retrieval that returned a description without its
 * refutation would publish instructions for tax fraud under Alliance Street's
 * name. These patterns route to the practice's stated position instead.
 */
const RULES: { pattern: RegExp; position: string }[] = [
  {
    pattern: /\b(inflat|fabricat|fake|false|invent)\w*\b.{0,40}\b(invoice|expense|receipt)/i,
    position:
      "We don't advise on this. Inflating or fabricating invoices or expenses to reduce " +
      "taxable profit is falsification of a tax return — fraud, not planning, and it carries " +
      "criminal liability. Legitimate options for reducing an effective rate depend on real " +
      "structure and real substance. Book a consultation and we'll go through the ones that fit.",
  },
  {
    pattern: /\bnominee\b|\b(friend|someone)\b.{0,30}\bmanager\b|manager who (doesn't|does not)/i,
    position:
      "A manager has to genuinely run the company. Appointing someone who doesn't exercise real " +
      "authority fails HMRC's central management and control test, so the structure doesn't do " +
      "what it was set up to do — the company stays UK-resident for tax. A real UAE-based " +
      "decision-maker is the requirement, not a formality.",
  },
  {
    pattern: /\b(fake|fabricat|simulat|spoof)\w*\b.{0,40}\b(substance|presence|location|correspondence)|vpn\b.{0,30}\b(uae|dubai)/i,
    position:
      "Substance can't be simulated. Fabricated correspondence or a VPN used to imply a UAE " +
      "location is evidence of intent, and it converts a defensible arrangement into an " +
      "indefensible one. Genuine substance — a local decision-maker, real operations, real " +
      "documentation — is the only version that holds up.",
  },
  {
    pattern: /foundation\b.{0,60}\b(eliminat|avoid|remove|no)\b.{0,30}\b(inheritance tax|iht|cgt|capital gains)/i,
    position:
      "That claim isn't correct under current law. A foundation does not eliminate UK " +
      "inheritance tax or capital gains tax for a UK-resident settlor. Anyone telling you it " +
      "does is describing a structure that won't survive scrutiny. What a foundation can and " +
      "can't do depends on residence and domicile — worth a proper conversation.",
  },
  {
    pattern: /\b(hmrc|fta|government)[- ]?(approved|endorsed|certified)\b/i,
    position:
      "No such approval exists. Neither HMRC nor the FTA approves or endorses tax structures, " +
      "and any firm claiming their structure is government-approved is misrepresenting it. " +
      "What matters is whether a structure is defensible on its facts.",
  },
  {
    pattern: /\b(hide|conceal|avoid detection|off the books|not declare|don't declare)\b/i,
    position:
      "We don't advise on concealment. Not declaring income or moving money to avoid a filing " +
      "obligation is evasion, which is criminal. Everything we set up is designed to be " +
      "declared and to hold up when examined.",
  },
];

export function checkCompliance(
  query: string,
): Extract<AnswerResult, { kind: "compliance-block" }> | null {
  for (const rule of RULES) {
    if (rule.pattern.test(query)) {
      return { kind: "compliance-block", position: rule.position };
    }
  }
  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/compliance.test.ts`
Expected: 8 passed. If "what counts as genuine UAE substance" is blocked, the substance pattern is too loose — it must require a fabrication verb, not the word "substance" alone.

- [ ] **Step 5: Commit**

```bash
git add src/lib/knowledge/compliance.ts tests/compliance.test.ts
git commit -m "feat(knowledge): block prohibited queries from reaching raw content"
```

---

### Task 7: BM25 index and the local answer source

**Files:**
- Create: `scripts/lib/bm25.mjs`, `src/lib/knowledge/local-source.ts`
- Create: `public/knowledge-index.json` (generated)
- Create: `tests/search.test.ts`
- Modify: `scripts/build-knowledge.mjs` (emit the index)

**Interfaces:**
- Consumes: `ENTRIES` (Task 5), `checkCompliance` (Task 6), `AnswerSource` (Task 4)
- Produces: `createLocalAnswerSource(index: SearchIndex, entries: KnowledgeEntry[]): AnswerSource`; `tokenize(text): string[]`; `SCORE_THRESHOLD`

- [ ] **Step 1: Write the failing test**

`tests/search.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildIndex } from "../scripts/lib/bm25.mjs";
import { createLocalAnswerSource } from "@/lib/knowledge/local-source";
import type { KnowledgeEntry } from "@/lib/knowledge/types";

const entry = (id: string, title: string, body: string): KnowledgeEntry => ({
  id, doc: "faq", category: "Test", slug: "test", title, body,
  stance: "standard", hasUnverifiedFigures: false, publicNav: true,
});

const ENTRIES = [
  entry("a", "How long does formation take?", "Most free zone formations complete in one to three weeks."),
  entry("b", "Which bank should I use?", "Bank choice depends on activity and shareholder nationality."),
  entry("c", "What is a free zone company?", "A company licensed inside a designated UAE free zone."),
];

const source = () => createLocalAnswerSource(buildIndex(ENTRIES), ENTRIES);

describe("local answer source", () => {
  it("returns the most relevant entry", async () => {
    const r = await source().search("how long does formation take");
    expect(r.kind).toBe("answer");
    if (r.kind === "answer") expect(r.entries[0].id).toBe("a");
  });

  it("refuses when nothing is relevant", async () => {
    // The whole basis of "answers only from this knowledge": below threshold it
    // returns no-match rather than the least-bad entry.
    const r = await source().search("what is the capital of Peru");
    expect(r.kind).toBe("no-match");
  });

  it("refuses on an empty query", async () => {
    expect((await source().search("   ")).kind).toBe("no-match");
  });

  it("blocks prohibited queries before retrieval runs", async () => {
    const r = await source().search("how do I inflate invoices");
    expect(r.kind).toBe("compliance-block");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/search.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the index builder**

`scripts/lib/bm25.mjs`:

```js
// Minimal BM25. Hand-rolled rather than pulled in as a dependency: the whole
// scorer is ~40 lines, and this project ships zero runtime dependencies for
// content features.
export const STOPWORDS = new Set(
  "a an and are as at be but by for from how i if in is it of on or that the to was what when where which who why with you your".split(" "),
);

export function tokenize(text) {
  return (text ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function buildIndex(entries) {
  const docs = entries.map((e) => {
    // Title and question weighted by repetition — a match in the question a
    // visitor actually typed matters more than one buried in the body.
    const tokens = [
      ...tokenize(e.title), ...tokenize(e.title),
      ...tokenize(e.question ?? ""),
      ...tokenize(e.body),
    ];
    const tf = {};
    for (const t of tokens) tf[t] = (tf[t] ?? 0) + 1;
    return { id: e.id, len: tokens.length, tf };
  });

  const df = {};
  for (const d of docs) for (const t of Object.keys(d.tf)) df[t] = (df[t] ?? 0) + 1;

  return {
    docs,
    df,
    total: docs.length,
    avgLen: docs.reduce((s, d) => s + d.len, 0) / Math.max(docs.length, 1),
  };
}
```

- [ ] **Step 4: Write the answer source**

`src/lib/knowledge/local-source.ts`:

```ts
import type { AnswerResult, AnswerSource, KnowledgeEntry } from "./types";
import { checkCompliance } from "./compliance";

export type SearchIndex = {
  docs: { id: string; len: number; tf: Record<string, number> }[];
  df: Record<string, number>;
  total: number;
  avgLen: number;
};

const K1 = 1.5;
const B = 0.75;

/**
 * Below this, the engine refuses. Tuned so an unrelated query ("capital of
 * Peru") scores near zero while a real question clears it comfortably.
 *
 * This threshold is the mechanism behind "answers only from this knowledge".
 * Raising it makes the Knowledge Centre quieter; removing it would make the
 * engine return its least-bad guess for any input, which is the one behaviour
 * this feature exists to prevent.
 */
export const SCORE_THRESHOLD = 1.2;

const STOPWORDS = new Set(
  "a an and are as at be but by for from how i if in is it of on or that the to was what when where which who why with you your".split(" "),
);

export function tokenize(text: string): string[] {
  return (text ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function createLocalAnswerSource(
  index: SearchIndex,
  entries: KnowledgeEntry[],
): AnswerSource {
  const byId = new Map(entries.map((e) => [e.id, e]));

  return {
    async search(query: string): Promise<AnswerResult> {
      const blocked = checkCompliance(query);
      if (blocked) return blocked;

      const terms = tokenize(query);
      if (terms.length === 0) return { kind: "no-match" };

      const scored = index.docs
        .map((doc) => {
          let score = 0;
          for (const term of terms) {
            const tf = doc.tf[term];
            if (!tf) continue;
            const df = index.df[term] ?? 0;
            const idf = Math.log(1 + (index.total - df + 0.5) / (df + 0.5));
            const norm = tf * (K1 + 1) /
              (tf + K1 * (1 - B + (B * doc.len) / index.avgLen));
            score += idf * norm;
          }
          return { id: doc.id, score };
        })
        .filter((d) => d.score >= SCORE_THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      if (scored.length === 0) return { kind: "no-match" };

      const results = scored
        .map((s) => byId.get(s.id))
        .filter((e): e is KnowledgeEntry => Boolean(e));

      return { kind: "answer", entries: results, score: scored[0].score };
    },
  };
}
```

- [ ] **Step 5: Emit the index from the build script**

In `scripts/build-knowledge.mjs`, add the import at the top:

```js
import { buildIndex } from "./lib/bm25.mjs";
```

and before the final `console.log` in `main()`:

```js
  await writeFile(
    path.join(process.cwd(), "public", "knowledge-index.json"),
    JSON.stringify(buildIndex(entries)),
  );
```

- [ ] **Step 6: Pin the two tokenizers together**

`tokenize` now exists twice — in `scripts/lib/bm25.mjs` (build time, indexing
entries) and in `src/lib/knowledge/local-source.ts` (query time). A `.mjs`
script cannot import a `.ts` module, so the duplication is unavoidable — but if
the two ever drift, queries silently stop matching documents that contain the
word. Pin them with a test.

Append to `tests/search.test.ts`:

```ts
import { tokenize as buildTokenize } from "../scripts/lib/bm25.mjs";
import { tokenize as queryTokenize } from "@/lib/knowledge/local-source";

describe("tokenizer parity", () => {
  // If these drift, search breaks silently: the index holds one form of a word
  // and the query produces another, so the term is simply never found.
  const samples = [
    "Free-zone company formation in the UAE",
    "What's the 9% corporate tax threshold?",
    "AED 375,000 and £90,000 thresholds",
    "Central management and control",
    "",
    "   ",
  ];

  it.each(samples)("agrees on: %s", (input) => {
    expect(queryTokenize(input)).toEqual(buildTokenize(input));
  });
});
```

Run: `npx vitest run tests/search.test.ts`
Expected: all pass. If they disagree, the stopword lists have drifted — make them identical character for character.

- [ ] **Step 7: Run tests and regenerate**

Run: `npx vitest run tests/search.test.ts && npm run knowledge:build`
Expected: all passed; index written. If "capital of Peru" returns an answer, raise `SCORE_THRESHOLD` and re-run — the refusal test is the one that must not be weakened to pass.

- [ ] **Step 8: Commit**

```bash
git add scripts/lib/bm25.mjs src/lib/knowledge/local-source.ts \
        scripts/build-knowledge.mjs public/knowledge-index.json tests/search.test.ts
git commit -m "feat(knowledge): add BM25 retrieval with refusal threshold"
```

---

### Task 8: Shared presentation components

**Files:**
- Create: `src/components/knowledge/provenance-note.tsx`, `entry-body.tsx`, `entry-details.tsx`, `doc-card.tsx`

**Interfaces:**
- Consumes: `KnowledgeEntry`, `DocMeta`
- Produces:
  - `<ProvenanceNote />` — the unverified-figures line
  - `<EntryBody entry={e} />` — cautionary banner + body + provenance when flagged
  - `<EntryDetails entry={e} />` — `<details>`/`<summary>` wrapper for Q&A
  - `<DocCard meta={m} count={n} />` — hub browse tile
  - `<DocIndexPage doc={m} title subhead items framing? />` and `type IndexItem =
    { href: string; label: string; meta?: string }` — the shared index layout used
    by all six document index routes

- [ ] **Step 1: Write the provenance note**

`src/components/knowledge/provenance-note.tsx`:

```tsx
/**
 * Shown on any entry stating a figure that has not been signed off against a
 * primary source. Spec §6.
 *
 * These figures came from client calls, where the same threshold appears in
 * different currencies and jurisdictions. Rendering them as settled fact would
 * break the standard docs/tax-figures-review.md sets for the rest of the site.
 */
export function ProvenanceNote() {
  return (
    <p className="mt-4 border-l-2 border-border pl-4 text-sm text-muted-foreground">
      Drawn from advisory conversations. Figures vary by jurisdiction, currency and
      circumstance, and change as rules change — confirm your own position with an
      advisor before acting on anything here.
    </p>
  );
}
```

- [ ] **Step 2: Write the body renderer**

`src/components/knowledge/entry-body.tsx`:

```tsx
import type { KnowledgeEntry } from "@/lib/knowledge/types";
import { ProvenanceNote } from "./provenance-note";

/**
 * Source bodies use a light markdown subset — paragraphs, **bold** leads, and
 * occasional tables. Rendered here rather than via a markdown dependency: the
 * subset is small and fixed, and this keeps runtime dependencies at zero.
 */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-display text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export function EntryBody({ entry }: { entry: KnowledgeEntry }) {
  const paragraphs = entry.body.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <div className="flex flex-col gap-4">
      {/*
        Cautionary framing lives here, not on the case-study page, so that every
        surface rendering an entry carries it — case studies, compliance review
        articles, and anything added later. Spec §5: a description of a
        non-compliant technique must never appear without its refutation.
      */}
      {entry.stance === "cautionary" ? (
        <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Cautionary example.</strong> This is
          recorded as a situation to avoid, not an approach to follow.
        </p>
      ) : null}
      {paragraphs.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          {renderInline(p.trim())}
        </p>
      ))}
      {entry.hasUnverifiedFigures ? <ProvenanceNote /> : null}
    </div>
  );
}
```

- [ ] **Step 3: Write the details wrapper**

`src/components/knowledge/entry-details.tsx`:

```tsx
import { ChevronDownIcon } from "lucide-react";
import type { KnowledgeEntry } from "@/lib/knowledge/types";
import { EntryBody } from "./entry-body";

/**
 * Native <details>, not Radix Accordion — same reasoning as home-faq.tsx:
 * Radix mounts panel children only on open, so answers would be absent from
 * the server-rendered HTML and invisible to GPTBot, ClaudeBot, PerplexityBot
 * and CCBot, none of which execute JavaScript. This content exists to be cited.
 */
export function EntryDetails({ entry }: { entry: KnowledgeEntry }) {
  return (
    <details className="group not-last:border-b border-border" id={entry.id}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 text-left font-display text-lg text-foreground outline-none [&::-webkit-details-marker]:hidden focus-visible:ring-3 focus-visible:ring-ring/50 hover:underline">
        {entry.question ?? entry.title}
        <ChevronDownIcon
          aria-hidden
          className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="pb-6">
        <EntryBody entry={entry} />
      </div>
    </details>
  );
}
```

- [ ] **Step 4: Write the doc card**

`src/components/knowledge/doc-card.tsx`:

```tsx
import Link from "next/link";
import type { DocMeta } from "@/lib/knowledge/registry";

export function DocCard({ meta, count }: { meta: DocMeta; count: number }) {
  return (
    <Link
      href={meta.routeBase}
      className="flex flex-col gap-2 rounded-lg border border-border p-6 transition-colors hover:border-foreground/30 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="font-display text-xl text-foreground">{meta.label}</span>
      <span className="text-sm text-muted-foreground">{meta.blurb}</span>
      <span className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
        {count} {count === 1 ? "entry" : "entries"}
      </span>
    </Link>
  );
}
```

- [ ] **Step 5: Write the shared index layout**

Every document's index page is the same shape: hero, a list of links, CTA. One
component, used by all six.

`src/components/knowledge/doc-index.tsx`:

```tsx
import Link from "next/link";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";
import type { DocMeta } from "@/lib/knowledge/registry";

export type IndexItem = {
  href: string;
  label: string;
  meta?: string;
};

export function DocIndexPage({
  doc,
  title,
  subhead,
  items,
  framing,
}: {
  doc: DocMeta;
  title: string;
  subhead: string;
  items: IndexItem[];
  /** Optional standing note rendered above the list. Used by the compliance review. */
  framing?: string;
}) {
  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Knowledge Centre", path: "/knowledge-centre" },
            { name: doc.label, path: doc.routeBase },
          ]),
        )}
      />
      <PageHero badge={doc.label} title={title} subhead={subhead} />
      <section className="py-16 sm:py-24">
        <Container className="mx-auto flex max-w-3xl flex-col gap-8">
          {framing ? (
            <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              {framing}
            </p>
          ) : null}
          <Stagger className="flex w-full flex-col divide-y divide-border">
            {items.map((item) => (
              <StaggerItem key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-baseline justify-between gap-4 py-5 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="font-display text-lg text-foreground">{item.label}</span>
                  {item.meta ? (
                    <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                      {item.meta}
                    </span>
                  ) : null}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>
      <BookConsultationCTA />
    </>
  );
}
```

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/knowledge
git commit -m "feat(knowledge): add shared entry presentation components"
```

---

### Task 9: Search UI

**Files:**
- Create: `src/components/knowledge/knowledge-search.tsx`
- Create: `tests/search-ui.test.ts` (threshold behaviour only; rendering is covered by Task 14's manual pass)

**Interfaces:**
- Consumes: `createLocalAnswerSource`, `ENTRIES`, `asset`
- Produces: `<KnowledgeSearch />`, a client component

- [ ] **Step 1: Write the component**

`src/components/knowledge/knowledge-search.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { ENTRIES } from "@/lib/knowledge/entries.generated";
import { createLocalAnswerSource, type SearchIndex } from "@/lib/knowledge/local-source";
import { DOCS } from "@/lib/knowledge/registry";
import type { AnswerResult, AnswerSource } from "@/lib/knowledge/types";
import { asset } from "@/lib/asset-path";

/**
 * Progressive enhancement. Every answer already exists as static HTML on the
 * pages this links to — this is a faster way in, never the only way in. With
 * JavaScript off the Knowledge Centre still works by browsing.
 *
 * The index is fetched on first interaction rather than bundled: it is the
 * largest single asset in the feature and most visitors never search.
 */
export function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const sourceRef = useRef<AnswerSource | null>(null);

  async function ensureSource() {
    if (sourceRef.current) return sourceRef.current;
    const res = await fetch(asset("/knowledge-index.json"));
    const index = (await res.json()) as SearchIndex;
    sourceRef.current = createLocalAnswerSource(index, ENTRIES);
    return sourceRef.current;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      setResult(await (await ensureSource()).search(query));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <form onSubmit={onSubmit} className="flex gap-2">
        <label htmlFor="kb-search" className="sr-only">
          Search the knowledge base
        </label>
        <div className="relative flex-1">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="kb-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question — corporate tax, residency, substance…"
            className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-4 text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-6 py-3 text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {result?.kind === "compliance-block" ? (
        <div className="rounded-lg border border-border p-6">
          <p className="text-muted-foreground">{result.position}</p>
          <Link href="/book-consultation" className="mt-4 inline-block underline">
            Book a consultation
          </Link>
        </div>
      ) : null}

      {result?.kind === "no-match" ? (
        <div className="rounded-lg border border-border p-6">
          <p className="text-muted-foreground">
            That isn&apos;t covered in our knowledge base. We only answer from what we&apos;ve
            published here rather than guessing — if it matters to your situation, ask us directly.
          </p>
          <Link href="/book-consultation" className="mt-4 inline-block underline">
            Book a consultation
          </Link>
        </div>
      ) : null}

      {result?.kind === "answer" ? (
        <ul className="flex flex-col divide-y divide-border">
          {result.entries.map((entry) => (
            <li key={entry.id} className="py-4">
              <Link
                href={`${DOCS[entry.doc].routeBase}/${entry.slug}#${entry.id}`}
                className="font-display text-lg text-foreground hover:underline"
              >
                {entry.question ?? entry.title}
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{entry.body}</p>
              <span className="mt-1 block text-xs uppercase tracking-wide text-muted-foreground">
                {DOCS[entry.doc].label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/knowledge/knowledge-search.tsx
git commit -m "feat(knowledge): add search UI with refusal and compliance states"
```

---

### Task 10: FAQ routes

**Files:**
- Create: `src/app/knowledge-centre/faq/page.tsx`, `src/app/knowledge-centre/faq/[category]/page.tsx`
- Modify: `src/lib/schema.ts` (add `buildFaqPageJsonLd`)

**Interfaces:**
- Consumes: `ENTRIES`, `DOCS`, `EntryDetails`, `PageHero`, `Container`, `BookConsultationCTA`
- Produces: `buildFaqPageJsonLd(entries: { question: string; answer: string }[])`; 1 index + 22 category routes

- [ ] **Step 1: Read the routing docs first**

Per `AGENTS.md`, read `node_modules/next/dist/docs/` on `generateStaticParams` and `generateMetadata` before writing. This Next.js differs from training data — in particular confirm whether `params` is a Promise in this version and match the existing pattern in `src/app/services/[category]/[slug]/page.tsx`.

- [ ] **Step 2: Add the FAQPage schema helper**

Append to `src/lib/schema.ts`:

```ts
export function buildFaqPageJsonLd(qa: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
```

- [ ] **Step 3: Write the category route**

`src/app/knowledge-centre/faq/[category]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ENTRIES } from "@/lib/knowledge/entries.generated";
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { EntryDetails } from "@/components/knowledge/entry-details";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

const FAQ = ENTRIES.filter((e) => e.doc === "faq");
const CATEGORIES = [...new Set(FAQ.map((e) => e.slug))];

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

function entriesFor(slug: string) {
  return FAQ.filter((e) => e.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const entries = entriesFor(category);
  if (entries.length === 0) return {};
  const title = entries[0].category;
  return {
    // Bare title — the root layout's `title.template` appends the brand.
    title,
    description: `${entries.length} questions on ${title.toLowerCase()}, answered from our advisory practice.`,
    alternates: { canonical: `/knowledge-centre/faq/${category}` },
  };
}

export default async function FaqCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const entries = entriesFor(category);
  if (entries.length === 0) notFound();

  const label = entries[0].category;

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Knowledge Centre", path: "/knowledge-centre" },
            { name: label, path: `/knowledge-centre/faq/${category}` },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          buildFaqPageJsonLd(
            entries.map((e) => ({ question: e.question ?? e.title, answer: e.body })),
          ),
        )}
      />
      <PageHero
        badge="Questions & answers"
        title={label}
        subhead={`${entries.length} questions clients ask about ${label.toLowerCase()}.`}
      />
      <section className="py-16 sm:py-24">
        <Container className="mx-auto flex max-w-3xl flex-col">
          {entries.map((entry) => (
            <EntryDetails key={entry.id} entry={entry} />
          ))}
        </Container>
      </section>
      <BookConsultationCTA />
    </>
  );
}
```

- [ ] **Step 4: Write the FAQ index route**

`src/app/knowledge-centre/faq/page.tsx`:

```tsx
import type { Metadata } from "next";
import { ENTRIES } from "@/lib/knowledge/entries.generated";
import { DOCS } from "@/lib/knowledge/registry";
import { DocIndexPage, type IndexItem } from "@/components/knowledge/doc-index";

const FAQ = ENTRIES.filter((e) => e.doc === "faq");

// Group by slug, preserving first-seen order so the source document's ordering
// survives rather than being alphabetised into a different shape.
const ITEMS: IndexItem[] = [...new Map(FAQ.map((e) => [e.slug, e])).values()].map((e) => {
  const count = FAQ.filter((x) => x.slug === e.slug).length;
  return {
    href: `/knowledge-centre/faq/${e.slug}`,
    label: e.category,
    meta: `${count} ${count === 1 ? "question" : "questions"}`,
  };
});

export const metadata: Metadata = {
  title: "Questions & answers",
  description:
    `${FAQ.length} questions on UAE and UK formation, tax, residency and compliance, answered from our advisory practice.`,
  alternates: { canonical: "/knowledge-centre/faq" },
};

export default function FaqIndexPage() {
  return (
    <DocIndexPage
      doc={DOCS.faq}
      title="Questions clients actually ask."
      subhead={`${FAQ.length} answers across ${ITEMS.length} topics.`}
      items={ITEMS}
    />
  );
}
```

- [ ] **Step 5: Verify it builds and renders**

```bash
npm run build
```

Expected: 22 `/knowledge-centre/faq/[category]` pages in the output. Then:

```bash
npm run dev &
curl -s http://localhost:3000/knowledge-centre/faq/banking | grep -c "Bank choice"
```

Expected: at least 1 — the answer text must be in the HTML, not only in the hydration payload. If 0, the content is behind a client boundary; fix before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/app/knowledge-centre/faq src/lib/schema.ts
git commit -m "feat(knowledge): add FAQ category routes with FAQPage schema"
```

---

### Task 11: Rule Book, guide, playbook and compliance review routes

Four route families sharing one article layout.

**Files:**
- Create: `src/components/knowledge/article-page.tsx`
- Create: `src/app/knowledge-centre/{rule-book,guide,playbook,compliance-review}/page.tsx` and `[section]/page.tsx`

**Interfaces:**
- Consumes: `ENTRIES`, `DOCS`, `EntryBody`
- Produces: `entriesForDoc(doc)`, `articleStaticParams(doc)`, `articleMetadata(doc, slug)` and `<ArticlePage doc slug />` — all reused by Task 12

- [ ] **Step 1: Write the shared article component**

`src/components/knowledge/article-page.tsx` exporting:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ENTRIES } from "@/lib/knowledge/entries.generated";
import { DOCS } from "@/lib/knowledge/registry";
import type { KnowledgeDoc } from "@/lib/knowledge/types";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { EntryBody } from "./entry-body";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

export function entriesForDoc(doc: KnowledgeDoc) {
  return ENTRIES.filter((e) => e.doc === doc);
}

export function articleStaticParams(doc: KnowledgeDoc) {
  return entriesForDoc(doc).map((e) => ({ section: e.slug }));
}

/**
 * Metadata for a single article. Without this the four [section] families would
 * inherit only the root layout's default title, so 40 pages would share one
 * title and one canonical — which is what makes them thin content rather than
 * 40 indexable answers.
 */
export function articleMetadata(doc: KnowledgeDoc, slug: string): Metadata {
  const entry = entriesForDoc(doc).find((e) => e.slug === slug);
  if (!entry) return {};
  const meta = DOCS[doc];
  const path = `${meta.routeBase}/${entry.slug}`;
  const description = `${entry.body.replace(/[*#|]/g, " ").replace(/\s+/g, " ").trim().slice(0, 150)}…`;
  return {
    // Bare title — the root layout's `title.template` appends the brand.
    title: entry.title,
    description,
    alternates: { canonical: path },
    openGraph: { url: path, title: `${entry.title} | Alliance Street Consultancy`, description },
  };
}

export function ArticlePage({ doc, slug }: { doc: KnowledgeDoc; slug: string }) {
  const entry = entriesForDoc(doc).find((e) => e.slug === slug);
  if (!entry) notFound();
  const meta = DOCS[doc];

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Knowledge Centre", path: "/knowledge-centre" },
            { name: meta.label, path: meta.routeBase },
            { name: entry.title, path: `${meta.routeBase}/${entry.slug}` },
          ]),
        )}
      />
      <PageHero badge={meta.label} title={entry.title} subhead={meta.blurb} />
      <section className="py-16 sm:py-24">
        <Container className="mx-auto flex max-w-3xl flex-col gap-6">
          <EntryBody entry={entry} />
        </Container>
      </section>
      <BookConsultationCTA />
    </>
  );
}
```

- [ ] **Step 2: Write the four `[section]` routes**

Each is a thin wrapper. `src/app/knowledge-centre/rule-book/[section]/page.tsx`:

```tsx
import type { Metadata } from "next";
import {
  ArticlePage,
  articleMetadata,
  articleStaticParams,
} from "@/components/knowledge/article-page";

type Params = { section: string };

export async function generateStaticParams() {
  return articleStaticParams("rule-book");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { section } = await params;
  return articleMetadata("rule-book", section);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { section } = await params;
  return <ArticlePage doc="rule-book" slug={section} />;
}
```

Repeat for `guide`, `playbook`, `compliance-review`, changing only the `doc` value in both places.

- [ ] **Step 3: Write the four index routes**

`src/app/knowledge-centre/rule-book/page.tsx`:

```tsx
import type { Metadata } from "next";
import { DOCS } from "@/lib/knowledge/registry";
import { DocIndexPage, type IndexItem } from "@/components/knowledge/doc-index";
import { entriesForDoc } from "@/components/knowledge/article-page";

const ITEMS: IndexItem[] = entriesForDoc("rule-book").map((e) => ({
  href: `/knowledge-centre/rule-book/${e.slug}`,
  label: e.title,
}));

export const metadata: Metadata = {
  title: "UK–UAE rule book",
  description:
    "Residence, central management and control, treaty relief, permanent establishment and substance — sourced from HMRC manuals, the UK–UAE treaty and FTA guidance.",
  alternates: { canonical: "/knowledge-centre/rule-book" },
};

export default function RuleBookIndexPage() {
  return (
    <DocIndexPage
      doc={DOCS["rule-book"]}
      title="The rules this all runs on."
      subhead="Sourced from HMRC manuals, the UK–UAE treaty and FTA guidance."
      items={ITEMS}
    />
  );
}
```

`guide` and `playbook` are the same file with `"rule-book"` swapped for the doc
key in all three places (`entriesForDoc`, the `href` template, and `DOCS[...]`),
and their own `title`/`subhead`/`description` copy.

`compliance-review` is the same but passes `framing`. A visitor landing on it
cold must not read the refuted claims as advice:

```tsx
    <DocIndexPage
      doc={DOCS["compliance-review"]}
      title="Claims we will not make."
      subhead="A fact-check of a past pitch against UK and UAE law."
      items={ITEMS}
      framing={
        "This document exists to record what was wrong with a pitch previously used in " +
        "this market, and why. Everything below is a claim we do not make and a technique " +
        "we do not use — it is published so clients can check our position against it, " +
        "not as guidance to follow."
      }
    />
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: 14 rule-book + 10 guide + 7 playbook + 9 compliance-review section pages, plus 4 index pages.

- [ ] **Step 5: Commit**

```bash
git add src/components/knowledge/article-page.tsx src/app/knowledge-centre
git commit -m "feat(knowledge): add rule book, guide, playbook and review routes"
```

---

### Task 12: Case study routes

**Files:**
- Create: `src/app/knowledge-centre/case-studies/page.tsx`
- Create: `src/app/knowledge-centre/case-studies/[slug]/page.tsx`

**Interfaces:**
- Consumes: `ArticlePage`, `entriesForDoc` (Task 11); `DOCS` (Task 4)
- Produces: 1 index + 38 case routes

The cautionary banner is already rendered by `EntryBody` (Task 8) for any entry
with `stance === "cautionary"`, so these pages do not repeat it. The index
labels them, because a visitor scanning a list needs to know before clicking.

- [ ] **Step 1: Write the detail route**

`src/app/knowledge-centre/case-studies/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { ArticlePage, entriesForDoc } from "@/components/knowledge/article-page";

type Params = { slug: string };

export async function generateStaticParams() {
  return entriesForDoc("case-studies").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = entriesForDoc("case-studies").find((e) => e.slug === slug);
  if (!entry) return {};
  const path = `/knowledge-centre/case-studies/${entry.slug}`;
  return {
    // Bare title — the root layout's `title.template` appends the brand.
    title: entry.title,
    description:
      "An anonymised client situation from our advisory practice: what was " +
      "recommended, what was questioned, and how it resolved.",
    alternates: { canonical: path },
    openGraph: { url: path, title: `${entry.title} | Alliance Street Consultancy` },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <ArticlePage doc="case-studies" slug={slug} />;
}
```

- [ ] **Step 2: Write the index route**

`src/app/knowledge-centre/case-studies/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { entriesForDoc } from "@/components/knowledge/article-page";
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/schema";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";
import { Stagger, StaggerItem } from "@/components/ui/scroll-reveal";
import { BookConsultationCTA } from "@/components/sections/book-consultation-cta";

const CASES = entriesForDoc("case-studies");

export const metadata: Metadata = {
  title: "Worked examples",
  description:
    "Anonymised client situations from our advisory practice — including the ones we advised against.",
  alternates: { canonical: "/knowledge-centre/case-studies" },
};

export default function CaseStudiesIndexPage() {
  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Knowledge Centre", path: "/knowledge-centre" },
            { name: "Worked examples", path: "/knowledge-centre/case-studies" },
          ]),
        )}
      />
      <PageHero
        badge="Worked examples"
        title="Situations we've actually handled."
        subhead="Anonymised client situations — including the ones we advised against."
      />
      <section className="py-16 sm:py-24">
        <Container className="mx-auto flex max-w-3xl flex-col">
          <Stagger className="flex w-full flex-col divide-y divide-border">
            {CASES.map((entry) => (
              <StaggerItem key={entry.id}>
                <Link
                  href={`/knowledge-centre/case-studies/${entry.slug}`}
                  className="block py-5 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="font-display text-lg text-foreground">{entry.title}</span>
                  {entry.stance === "cautionary" ? (
                    <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Cautionary
                    </span>
                  ) : null}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>
      <BookConsultationCTA />
    </>
  );
}
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: 38 case study pages plus the index.

- [ ] **Step 4: Re-run the anonymisation guard**

Run: `npm test`
Expected: pass. This is the last gate before the content is publicly routed.

- [ ] **Step 5: Commit**

```bash
git add src/app/knowledge-centre/case-studies
git commit -m "feat(knowledge): add anonymised case study routes"
```

---

### Task 13: Hub page, navigation, sitemap, and retiring the placeholder

**Files:**
- Modify: `src/app/knowledge-centre/page.tsx`, `src/app/sitemap.ts`, `src/lib/site-config.ts`
- Delete: `src/components/sections/knowledge-centre-empty.tsx`

**Interfaces:**
- Consumes: `KnowledgeSearch`, `DocCard`, `publicNavDocs`, `ENTRIES`
- Produces: the `/knowledge-centre` hub

- [ ] **Step 1: Rewrite the hub page**

Replace the body of `src/app/knowledge-centre/page.tsx`: `PageHero` (badge "Knowledge Centre", title "Answers from our own practice.", subhead naming the entry count), then `<KnowledgeSearch />`, then a grid of `<DocCard />` for `publicNavDocs()` only, then `BookConsultationCTA`.

Update the metadata — drop "coming soon" and the comment above it:

```ts
export const metadata: Metadata = {
  title: "Knowledge Centre",
  description:
    "UAE and UK company formation, corporate tax, residency and compliance — answered from our own advisory practice.",
  alternates: { canonical: "/knowledge-centre" },
  openGraph: {
    url: "/knowledge-centre",
    title: "Knowledge Centre | Alliance Street Consultancy",
    description:
      "UAE and UK company formation, corporate tax, residency and compliance — answered from our own advisory practice.",
  },
};
```

- [ ] **Step 2: Delete the placeholder**

```bash
git rm src/components/sections/knowledge-centre-empty.tsx
```

Then confirm nothing still imports it:

```bash
grep -rn "knowledge-centre-empty\|KnowledgeCentreEmpty" src/
```

Expected: no output.

- [ ] **Step 3: Add every route to the sitemap**

In `src/app/sitemap.ts`, import `ENTRIES` and `DOCS`, then append generated entries. Update the `/knowledge-centre` static row — its `changeFrequency` comment says "coming soon stub"; that is no longer true, so change it to `weekly` and update the comment. Add:

```ts
const KNOWLEDGE_LAST_MODIFIED = "2026-09-13";

const knowledgeEntries: MetadataRoute.Sitemap = ENTRIES.map((entry) => ({
  url: `${BASE_URL}${DOCS[entry.doc].routeBase}/${entry.slug}`,
  lastModified: KNOWLEDGE_LAST_MODIFIED,
  changeFrequency: "monthly" as const,
  priority: entry.publicNav ? 0.7 : 0.3,
}));
```

Deduplicate by URL before returning — FAQ entries share a category slug, so 118 entries map to 22 URLs:

```ts
const all = [...staticEntries, ...serviceEntries, ...knowledgeEntries];
return [...new Map(all.map((e) => [e.url, e])).values()];
```

- [ ] **Step 4: Verify the sitemap**

```bash
npm run build && grep -c "knowledge-centre" out/sitemap.xml
```

Expected: ~90 unique knowledge URLs, no duplicates.

- [ ] **Step 5: Commit**

```bash
git add src/app/knowledge-centre/page.tsx src/app/sitemap.ts src/lib/site-config.ts
git commit -m "feat(knowledge): activate the Knowledge Centre hub"
```

---

### Task 14: Full verification

**Files:** none created — this task gates the branch.

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all pass, including the anonymisation guard and the refusal test.

- [ ] **Step 2: Clean build**

Run: `npm run build`
Expected: no type errors, no lint errors, ~103 knowledge routes exported.

- [ ] **Step 3: Verify content is in the static HTML**

```bash
grep -c "free zone" out/knowledge-centre/faq/*/index.html | head
```

Expected: non-zero. This is the crawler requirement from the global constraints — if answers are missing here, GPTBot and ClaudeBot cannot see them.

- [ ] **Step 4: Verify the refusal path in the browser**

Start the dev server, open `/knowledge-centre`, and check in order:
1. "what is the capital of Peru" → the no-match message, no entries.
2. "how do I inflate invoices" → the compliance position, not KB text.
3. "how long does formation take" → real results linking to real pages.
4. Console shows zero errors.

- [ ] **Step 5: Verify JS-disabled browsing**

Disable JavaScript and load `/knowledge-centre/faq/banking`. All questions and answers must be readable. The search box may be inert; browsing must not be.

- [ ] **Step 6: Responsive check**

At 375px: no horizontal scroll on the hub, a FAQ category page, and a case study. At 1440px: container rhythm matches `/services`.

- [ ] **Step 7: Confirm no client identity was ever committed**

```bash
git log -p --all -- content/knowledge/ | grep -iE "<a surname from the mapping>" || echo "clean"
```

Run this with the mapping open beside you, checking a sample of names. Expected: `clean`. If anything appears, stop — history needs rewriting before this is pushed.

- [ ] **Step 8: Final commit**

```bash
git add -A && git commit -m "chore(knowledge): verification pass"
```

---

## Deferred (not in this plan)

- **Self-hosted LLM service.** Needs its own spec: model, hardware, cost, CORS, abuse protection, monitoring. It implements `AnswerSource` and must preserve the refusal contract and the compliance blocks in `checkCompliance`.
- **Figure sign-off.** Ongoing, tracked in the generated `docs/knowledge-figures-review.md`.
