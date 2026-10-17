# Concept Note Outline — Team Ardh (PDF, max 3 pages)

> Rulebook says **3 pages**; the organizers' email says 4. Stay at 3 until they confirm.
> Facts marked (verify) need a source link before you cite them.

**Page 1 — Problem & why it matters**
- Chosen problem: **P3 — Catch Fraud & Double-Selling** (Track: Digital Land Records, Verification & Digitization)
- The gap: deed, khatian, registration and mutation sit in separate places, and nobody cross-checks them before a sale is accepted.
- Why it matters in Bangladesh: land conflicts drive most civil disputes (Law Ministry figure reported by Observer BD, June 2026, "over 70%" — verify); e-mutation and QR khatians exist, but discrepancies in survey records remain (BRAC BIGD study).
- Who uses it: Sub-Registry officers (primary), AC Land offices, banks (double mortgage), citizens ("check before you buy"), courts (record trail).

**Page 2 — Solution, architecture, tech stack**
- One diagram: Deed submitted → Fraud engine (seller holding, pending sales, area) → Status (registered / flagged / blocked) → Mutation approval updates live holdings → Audit chain.
- Key design choices: DB-level checks (Postgres triggers + row locks on the parcel) so two simultaneous sales cannot both pass; holdings change only via `approve_mutation()`; append-only hash-chained audit log; fingerprint verification exposes no personal data.
- Stack: React, Vite, TypeScript, Tailwind, Supabase (Postgres + RLS).
- Data: dummy only; no NID, no real records, no scraping.

**Page 3 — Features, nationwide use, roadmap, team**
- Main features (6 bullets from the README).
- Nationwide path: pilot at one Sub-Registry office → integrate with the national land portal under a formal agreement → district rollout; bank/court read-only access.
- Roadmap v1 → v2 and Limitations (honest; judges marked you down for missing this before).
- Team: Mehedy (leader), Jobayer, faculty mentor Zannatul Mawa Koli, industry mentor MD. Tahamid Hassan Sadib.

**Before exporting**
- [ ] Name the problem as **P3** in the first paragraph
- [ ] Architecture diagram included
- [ ] AI tools listed
- [ ] Exactly 3 pages
