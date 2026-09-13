# Knowledge Centre — design

**Status:** approved design, not yet implemented
**Date:** 2026-09-13

Replaces the `/knowledge-centre` placeholder (`KnowledgeCentreEmpty`) with a
real, searchable knowledge base built from the Fast Track to Zero Tax knowledge
package (`v.3.zip`, six source documents).

## Goals

1. Publish the knowledge package as crawlable static content.
2. Answer visitor questions **only** from that package — never from anything else.
3. Do so without adding a server, an outside API, or a monthly bill.
4. Leave a clean seam for a self-hosted LLM to take over answering later.

## Non-goals

- Any third-party LLM or API call. Explicitly excluded by the requester.
- A CMS. Content is committed and versioned with the code.
- Standing up the self-hosted inference service. Designed for, not built here.

---

## 1. Source material

Six documents, 198 discrete entries, distilled from 103 real client call transcripts.

| Document | Units | Public treatment |
|---|---|---|
| FAQ & Objection Handling | 118 Q&A across 22 categories | Front door |
| UK–UAE Tax Compliance Rule Book | 15 sections | Front door |
| Master Knowledge Base | 11 sections | Front door |
| Case Study Library | 38 cases | Front door, **anonymised** |
| Sales Playbook | 7 sections | Published, not in nav |
| Compliance Risk Review | 9 sections | Published, not in nav |

### 1.1 Anonymisation (blocking, do first)

The Case Study Library names real clients alongside their financial affairs —
full names, company names, portfolio values, turnover. There is no consent for
publication.

**This repository is public.** Anonymisation therefore happens **once, offline,
before anything is committed**. Raw named data must never enter git: a commit
that is later "fixed" leaves the names in history permanently, and the history
is world-readable.

Rules:
- Personal names → role descriptors ("a UK property developer").
- Company names → sector descriptors ("a decorative lighting importer").
- Exact financials → banded ("turnover around £270k" → "mid-six-figure turnover")
  where the exact figure plus sector would re-identify.
- Locations narrower than country → dropped.
- Commercial substance — structure recommended, objection, outcome, takeaway —
  is preserved in full. The point is to keep the lesson, lose the identity.

The anonymised set is reviewed by the requester before it goes live.

---

## 2. Content pipeline

```
content/knowledge/*.json        committed, already anonymised
  → scripts/build-knowledge.mjs (build-time)
    → src/lib/knowledge/*.generated.ts   typed entries, imported by pages
    → public/knowledge-index.json        search index, fetched on demand
    → docs/knowledge-figures-review.md   figures needing human sign-off
```

Generated files are committed so the build is reproducible and reviewable in
diffs. The script is idempotent.

### 2.1 Entry model

```ts
type KnowledgeEntry = {
  id: string;                  // stable: "faq-legitimacy-003"
  doc: KnowledgeDoc;           // faq | rulebook | guide | case | playbook | review
  category: string;
  slug: string;
  title: string;
  question?: string;           // FAQ-shaped entries
  body: string;                // markdown
  stance: "standard" | "cautionary";
  hasUnverifiedFigures: boolean;
  publicNav: boolean;          // false for playbook + review
};
```

`stance: "cautionary"` marks content that *describes a non-compliant technique
in order to condemn it*. See §5.

---

## 3. Routes

All statically exported. All content present in the server-rendered HTML —
following the precedent set in `home-faq.tsx`: the AI crawlers this content most
needs to reach (GPTBot, ClaudeBot, PerplexityBot, CCBot) do not execute
JavaScript, so nothing load-bearing may depend on hydration.

| Route | Pages | Notes |
|---|---|---|
| `/knowledge-centre` | 1 | Hub: search + browse |
| `/knowledge-centre/faq/[category]` | 22 | `<details>` per Q&A, FAQPage JSON-LD |
| `/knowledge-centre/rule-book/[section]` | 15 | Article JSON-LD |
| `/knowledge-centre/guide/[section]` | 11 | Article JSON-LD |
| `/knowledge-centre/case-studies/[slug]` | 38 | Anonymised |
| `/knowledge-centre/playbook/[section]` | 7 | Not in nav or hub browse |
| `/knowledge-centre/compliance-review/[section]` | 9 | Not in nav or hub browse |

~103 new pages. Every page ends in the shared `BookConsultationCTA`.

"Not in nav or hub browse" means: reachable by direct link and by search,
excluded from the hub's browse grid and from site navigation. Still indexable —
the requester chose publication, this only keeps the Knowledge Centre's front
door client-facing.

---

## 4. The answer engine

One interface, two implementations over time. This is the seam that makes the
self-hosted LLM a later config change rather than a rebuild.

```ts
interface AnswerSource {
  search(query: string): Promise<AnswerResult>;
}

type AnswerResult =
  | { kind: "answer"; entries: KnowledgeEntry[]; score: number }
  | { kind: "no-match" }                    // below threshold → refuse
  | { kind: "compliance-block"; position: string };  // see §5
```

**Now — `LocalIndexAnswerSource`.** BM25 over the build-time index, run in the
browser. The index JSON is fetched on first interaction, not bundled, so it
costs nothing on initial page load. Returns stored entry text verbatim.

**Later — `RemoteLlmAnswerSource`.** Points at a self-hosted Ollama endpoint.
Same interface, same refusal contract, same compliance blocks. Swapping is a
config change.

**The refusal contract.** Below the relevance threshold the engine returns
`no-match` and the UI says the question is not covered in the knowledge base and
offers a consultation. It never falls through to a general answer. With the
local index this is a property of the system — there is no model present that
*could* invent an answer. That property must be preserved by any future
implementation; it is the whole basis of "answers only from this knowledge."

---

## 5. Compliance guardrails

`AI Prompt.txt` documents that the source transcripts contained advice that is
fraudulent or false: fabricated invoices and expenses, nominee managers who
exercise no real authority, fabricated evidence of UAE substance, false claims
that a structure eliminates UK IHT/CGT for a UK resident, and false claims of
"HMRC approved" status. The Compliance Risk Review exists to refute these.

The risk: those techniques are *described* in the KB so they can be condemned.
Retrieval that returns a description stripped of its refutation would publish
instructions for tax fraud under Alliance Street's name.

Three mitigations:

1. **Inseparable framing.** `stance: "cautionary"` entries always render with
   their refutation attached. The description and the verdict are one unit in
   the index; they cannot be retrieved apart.
2. **Query routing.** Queries matching the prohibited patterns above return
   `compliance-block` with the practice's stated position and a route to a
   consultation — not raw KB text.
3. **No cautionary precedent.** Case studies labelled "Compliance Risk — Do Not
   Replicate" are excluded from "similar situations" surfacing. They exist as
   warnings, never as precedent.

---

## 6. Figures and provenance

The site's existing standard (`docs/tax-figures-review.md`): *"Never write a
figure from memory. If it isn't in `sources`, it doesn't go on the page."*

The KB cannot meet that standard as-is — it is transcript-derived, and its own
prompt file records that Small Business Relief appears variously as "£600k /
$600k / €696–800k / AED 3m". These are artifacts of different calls, currencies
and jurisdictions, not competing statements of law.

Resolution:

- The build script flags every entry containing a numeric or regulatory claim
  and emits `docs/knowledge-figures-review.md` in the same format as the
  existing checklist.
- Flagged entries render a provenance line: drawn from advisory conversations,
  varies by circumstance, confirm your specifics on a call. This is precisely
  what `AI Prompt.txt` instructs — state the variance rather than pick a number.
- Sign-off moves entries off the flagged list over time.
- Where the Rule Book cites a primary source (HMRC manuals, the UK–UAE treaty,
  FTA guidance), that citation is rendered. Those figures are the sourced ones.

Sourced Rule Book figures and conversational FAQ figures are visually distinct.
A reader must be able to tell which is which.

---

## 7. Presentation

Existing primitives only — no new dependencies, no new visual language:
`PageHero`, `Container`, `SectionHeading`, `Stagger`/`StaggerItem`,
`AmbientGlow`, `Card`, `BookConsultationCTA`.

Q&A uses native `<details>`/`<summary>`, matching `home-faq.tsx` — content stays
in the markup while collapsed, works with no JS, correct semantics for free.

Search is progressive enhancement: the browse experience is complete static
HTML, and the search box layers on top. With JS disabled the Knowledge Centre
still works.

`KnowledgeCentreEmpty` is deleted. `/knowledge-centre` metadata loses "coming
soon".

---

## 8. Testing

- Build script: unit tests on normalisation, slug stability, figure detection,
  and the anonymisation rules.
- **Anonymisation guard: a test that fails if any known personal or company name
  from the raw source appears anywhere in committed content.** Runs in CI.
- Retrieval: known queries return expected entries; below-threshold queries
  return `no-match`; each prohibited pattern in §5 returns `compliance-block`.
- Routes: all ~103 render, zero console errors, answers present in server HTML
  with JS disabled.
- `npm run build` clean — types, lint, and all static params.
- 375px: no horizontal scroll. 1440px: matches established container rhythm.

## 9. Done when

- [ ] Case studies anonymised, reviewed by requester, raw names never committed
- [ ] All six documents published across ~103 static routes
- [ ] Every answer present in server-rendered HTML
- [ ] Search returns only KB content; below threshold it refuses
- [ ] All §5 prohibited patterns return the compliance position
- [ ] `docs/knowledge-figures-review.md` generated; flagged entries show provenance
- [ ] Playbook and Risk Review excluded from nav and hub browse
- [ ] Anonymisation guard test passing in CI
- [ ] `npm run build` clean; hub reachable from nav

## 10. Deferred

- Self-hosted LLM service (model, hardware, cost, abuse protection) — separate
  spec. `AnswerSource` is the seam it plugs into.
- Human sign-off of flagged figures — ongoing, tracked in the generated doc.
