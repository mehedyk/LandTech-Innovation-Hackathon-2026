# Concept note outline: Team Ardh (PDF, **max 3 pages**)

> Rulebook: 3 pages. The organizers' email says 4. Stay at 3 until they confirm.

**Page 1: Problem and why it matters**
- Chosen problem: **P3, Catch Fraud & Double-Selling** (Track: Digital Land Records, Verification & Digitization).
- Gap: deed, khatian chain and mutation are held by different offices; nobody cross-checks them before a sale or mutation is accepted. Khatian alone is not conclusive proof of ownership.
- Why it matters: use the sourced facts from `RESEARCH_NOTES.md` (open each DOI first).
- Who uses it: Sub-Registrar (primary), AC Land office (mutation), banks, courts, citizens (read-only later).

**Page 2: Solution, architecture, stack**
- Diagram: Deed or mutation request → **Ardh Guard engine** (rules over deed + khatian chain + mutation history) → Alert with reasons → Officer decision (confirm hold / dismiss / escalate) → Audit.
- Two checkpoints: pre-registration, pre-mutation.
- Design choices: explainable rules, human-in-the-loop, never decides ownership, dummy data only.
- Stack: TypeScript engine, React + Vite + Tailwind, Supabase (decisions and audit).

**Page 3: Features, evaluation, nationwide path, roadmap, team**
- Features: check-a-deed, alert inbox, case timeline, benchmark, in-app roadmap and limitations.
- Evaluation: labelled synthetic benchmark; honest caveats.
- Path: pilot at one sub-registry office and its AC Land office → inter-office data sharing under a formal agreement → district rollout.
- Roadmap v1 → v2 (OCR intake for P1, Bangla name matching, lineage resolution, ML ranking after rules, owner alerts) and Limitations.
- Team: S.M. Mehedy Kawser (leader), Jobayer; faculty mentor Zannatul Mawa Koli; industry mentor MD. Tahamid Hassan Sadib.

**Before exporting:** [ ] names P3 in paragraph 1 · [ ] architecture diagram · [ ] AI tools listed · [ ] exactly 3 pages · [ ] every citation opened and checked
