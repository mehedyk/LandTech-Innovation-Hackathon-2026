# Plan: Ardh Guard (LandTech 2026, P3)

## Decision
**Product:** an explainable *conflict-detection layer* that sits at two checkpoints, **before deed registration** and **before mutation approval**. It cross-checks the deed against the khatian chain (CS/SA/RS/BS) and mutation history, then flags a case for a human officer with plain-language reasons. It never decides ownership.

**Why this and not "another registry":** our literature search found blockchain registries are crowded and near-identical, while Bangladesh-specific, pre-transaction, explainable fraud screening is thin. It also complements existing e-services instead of replacing them.

**Changed since the first draft:** the checks now live in a dependency-free TypeScript engine (`src/engine`) instead of DB triggers. The seed data has fractional shares and survey lineages, the engine runs in the browser (demo works offline) and it is testable with one command: `npm run eval`. Supabase is only for saving officer decisions. The old SQL is kept in `supabase/archive/`, unchanged.

## v1 scope
**Must (this is the demo)**
1. Engine + benchmark (**done**).
2. **Check a deed** form: enter a deed, get an instant verdict (clear / review / block) with reasons.
3. **Alert inbox** for officers: filter by checkpoint and severity; every alert shows its reason and evidence.
4. **Case view:** the CS → SA → RS → BS chain, deeds and mutations on one timeline.
5. Officer decision: confirm hold / dismiss / escalate (Supabase, with a localStorage fallback).
6. **Benchmark page:** results table with the caveats written on the page.
7. **Roadmap & Limitations page** inside the app (this is what cost you marks last time).

**Should:** simulated owner notification ("a transfer was attempted on your plot"); dispute-hold state.
**Won't:** blockchain, OCR, ML scoring, real data, citizen portal.

## Timeline (deadline Sun 18 Oct, 11:59 PM; target submit **by 6 PM**)
| When | Klinger | Jobayer |
|---|---|---|
| Sat evening | Vite + React + Tailwind scaffold, wire engine, Alert inbox | Message both mentors; read core sources; draft concept note from `CONCEPT_NOTE_OUTLINE.md` |
| Sun 9 AM–1 PM | Check-a-deed, Case view, Benchmark + Roadmap pages, deploy to Netlify | Concept note to 3 pages with architecture diagram; collect screenshots |
| Sun 1–4 PM | Full animated README (swap in screenshots/GIFs) | Demo-video script; README sections (AI tools, data, changelog) |
| Sun 4–6 PM | Push public repo; final bug pass | Record and trim video to 90 s or less; export PDF |
| **Sun 6 PM** | **Submit and mark FINAL** | Check the platform shows it as final |

Everything after 6 PM is buffer. Do not plan to use it.

## 90-second demo
0–10 s problem (same land, different offices, nobody cross-checks) · 10–35 s check a deed → blocked, with the reason · 35–55 s inbox + case timeline · 55–75 s benchmark with honest caveats · 75–90 s safeguards (human review) + roadmap.

## Rules checklist (from the rulebook)
- [ ] Public GitHub repo, real commit history, never rewritten
- [ ] README: how to run, data used, AI tools used
- [ ] Dummy data only; no scraping; no PDFs from papers in the repo
- [ ] Both of you can explain every file
- [ ] Concept note PDF: **3 pages** (rulebook) even though the email says 4
- [ ] Video 90 s or less; live link optional but do it

## Risks
- UI time is the real constraint. If Sunday slips, cut "Should" items first, never the Roadmap/Limitations page or the video.
- Benchmark numbers look perfect because the rules were written with the generator's anomalies in mind. Present them as a regression test, never as accuracy.
- The mentoring session was Fri 8 PM. If either of you has notes from the RAJUK / a2i judges, send them: they are worth more than any paper.
