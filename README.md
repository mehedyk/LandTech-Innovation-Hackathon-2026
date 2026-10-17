<p align="center">
  <img src="assets/logo.svg" alt="Ardh" width="520">
</p>

<p align="center">
  <b>LandTech Innovation Hackathon 2026</b> · Track: Digital Land Records, Verification & Digitization<br>
  Problem <b>P3 — Catch Fraud & Double-Selling</b> · Team <b>Ardh</b> · Daffodil International University
</p>

---

## The problem
Many land disputes in Bangladesh start with fake deeds, the same land sold twice, and records (deed, khatian, mutation) that don't match each other. Each office sees only its own record, so fraud slips through the gaps.

## What Ardh does
Ardh cross-checks a deed against the live ownership record **before** it is accepted, and explains every decision.

- **Double-sale detection** — blocks a sale when the seller's available share is already committed to an earlier, un-mutated deed.
- **Fake-seller detection** — blocks deeds where the seller has no recorded holding on the parcel.
- **Area & mismatch checks** — flags deeds that claim more area than the parcel has, and mutations on blocked deeds.
- **Explainable risk score** — every flag carries a plain-language reason (low / medium / high).
- **Deed fingerprint + public verification** — SHA-256 fingerprint per deed; anyone can verify it, no personal data exposed.
- **Tamper-evident audit log** — append-only, hash-chained; `verify_audit_chain()` proves nothing was edited.

> Status: Round 1 prototype. See [Roadmap](#roadmap-v1--v2) and [Limitations](#limitations).

## Tech stack
React · Vite · TypeScript · Tailwind CSS · Supabase (Postgres, Row Level Security)

## Run it
```bash
# 1. Database (Supabase SQL editor, or psql). Safe to re-run: no DROP / CASCADE.
#    Run in order:
#    supabase/migrations/0001_init.sql
#    supabase/seed.sql            # dummy data + 4 demo scenarios

# 2. App
cp .env.example .env             # add your Supabase URL + anon key
npm install
npm run dev
```
Demo scenarios in `seed.sql`: legitimate sale, **double sale**, **fake seller**, **oversized area claim**.

## Data
**Dummy data only.** All names, plots and deed numbers are fictional. No NID, phone numbers, real names or real land records are used, and nothing is scraped from government websites.

## AI tools used
- Claude (Anthropic) — planning, SQL schema drafting, README/logo generation. All code was reviewed and can be explained by the team.
- _TODO: add any others (e.g. ChatGPT, Copilot) before submitting._

## Roadmap (v1 → v2)
| Version | Scope |
|---|---|
| **v1 (Round 1)** | Fraud engine, fingerprint verification, audit chain, officer dashboard, citizen check |
| **v1.1 (Final)** | _TODO: list changes made after Round 1_ |
| **v2** | Bangla OCR intake (P1), role-based officers, name fuzzy matching (Bangla), bank collateral double-mortgage check, integration with the national land portal under a formal agreement |

## Limitations
- Works on dummy data; real deployment needs an agreement with the Ministry of Land / DLRS.
- v1 name matching is exact-ID based; Bangla spelling variants are a v2 item.
- v1 access control is "signed-in officer"; fine-grained roles come in v2.

## Team
| | |
|---|---|
| **S.M. Mehedy Kawser** (Team Leader) | [@mehedyk](https://github.com/mehedyk) |
| **Jobayer** | _TODO: GitHub link_ |
| Faculty mentor | Zannatul Mawa Koli |
| Industry mentor | MD. Tahamid Hassan Sadib (CSE-TECH) |

## License
_TODO: choose (the organizers encourage open source, e.g. MIT)._
