<p align="center"><img src="assets/logo.svg" alt="Ardh" width="520"></p>

<p align="center">
  <b>LandTech Innovation Hackathon 2026</b> · Track: Digital Land Records, Verification & Digitization<br>
  Problem <b>P3: Catch Fraud & Double-Selling</b> · Team <b>Ardh</b> · Daffodil International University
</p>

---

## The problem
Deeds, khatians (CS/SA/RS/BS) and mutations are held by different offices, and nobody cross-checks them before a sale or mutation is accepted. Khatian alone is not conclusive proof of ownership, so the same land can be sold twice and fake sellers slip through.

## What Ardh Guard does
An explainable **conflict-detection layer** at two checkpoints: **before registration** and **before mutation**. It flags a case for a human officer with plain-language reasons. It never decides ownership.

| Rule | Catches |
|---|---|
| Overlapping sale | Same seller sells more than they hold (double sale) |
| Share overrun | Deed claims more than the seller's recorded share |
| Khas conflict | Plot is government land in the latest record |
| Seller not recorded owner | Seller absent from the latest khatian |
| Invalid QR / signature | Altered or forged document |
| Mutation area mismatch | Mutation changed a different area than the deed |
| Registered, not mutated | Record of rights still shows the old owner |

> **Status:** Phase 1 done: engine, labelled benchmark and a working web front end (Check a deed, Alerts, Parcels, Benchmark, Roadmap and limits).

## Run it
```bash
npm install
npm run dev          # web app, no backend needed (runs on the dummy data in /data)
npm run build        # typecheck + production build
npm run eval         # engine benchmark in the terminal (Node >= 22.18)
```
Result on the dummy benchmark: 8/8 evaluable anomalies detected, 0 false positives on 25 deeds. This is a **regression test on small synthetic data**, not a measure of real-world accuracy. See `data/DATA_README.md`.

## Tech stack
TypeScript rules engine · React · Vite · Tailwind CSS · Supabase (officer decisions only)

## Data
**Dummy data only.** All names, plots and deed numbers are fictional (`data/`). No NID, phone numbers or real land records; nothing is scraped from government sites.

## AI tools used
- Claude (Anthropic): planning, rules-engine and schema drafting, documentation. Everything was reviewed and can be explained by the team.
- Consensus.app: literature search reports (see `docs/SOURCES.md`).
- _TODO: add any others._

## Roadmap (v1 → v2)
| Version | Scope |
|---|---|
| **v1 (Round 1)** | Engine, check-a-deed, alert inbox, case timeline, benchmark, roadmap page |
| **v1.1 (Final)** | _TODO: list changes made after Round 1_ |
| **v2** | Coherent-chain seed + chain-break rule, Bangla name matching, plot-lineage resolution, owner alerts, ML ranking after rules, OCR intake (P1), real-data pilot under a formal agreement |

## Limitations
- Dummy data; real use needs an agreement with the land authorities.
- Chain-break detection is not evaluated yet (the seed lacks coherent chains).
- No Bangla spelling-variant matching; no plot renumbering or split/merge resolution.
- Rules were written knowing the seed's anomalies.

## Docs
[`docs/PLAN.md`](docs/PLAN.md) · [`docs/RESEARCH_NOTES.md`](docs/RESEARCH_NOTES.md) · [`docs/SOURCES.md`](docs/SOURCES.md) · [`docs/CONCEPT_NOTE_OUTLINE.md`](docs/CONCEPT_NOTE_OUTLINE.md)

## Team
| | |
|---|---|
| **Jobayer** (Team Leader) | [@MJZ-Hossen](https://github.com/MJZ-Hossen) |
| **S.M. Mehedy Kawser** | [@mehedyk](https://github.com/mehedyk) |
| Faculty mentor | Zannatul Mawa Koli |
| Industry mentor | MD. Tahamid Hassan Sadib (CSE-TECH) |

## License
_TODO: choose (the organizers encourage open source, e.g. MIT)._
