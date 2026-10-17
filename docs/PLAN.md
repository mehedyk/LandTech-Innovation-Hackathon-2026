# Plan: Ardh Guard (LandTech 2026, P3)

**Team:** Jobayer (registered team leader, @MJZ-Hossen) + S.M. Mehedy Kawser (@mehedyk). We work together; no fixed split.
**Judges' advice:** to be selected for Round 2, show at least the **idea, the concept and a working front end**, and show **what we will do next**.
**Dates:** Round 1 deadline **Sun 18 Oct, 11:59 PM** (target submit by **6 PM**) · Final tentatively **24 Oct**, Knowledge Tower, DIU.

## The product in one line
An explainable conflict-detection layer that checks a deed against the khatian chain (CS/SA/RS/BS) and mutation history **before registration** and **before mutation**, and flags the case to a human officer with plain-language reasons. It never decides ownership.

---

## Phase 0: Foundations (Saturday evening, about 1 hour)
1. Confirm in the platform panel which account holds the team, and that the leader name in the README, concept note and platform all match (Jobayer).
2. Create the **public GitHub repo** under Jobayer's account; add Mehedy as collaborator. Push `ardh-landtech-v3` as the first commit. Never rewrite history.
3. Message both mentors (faculty and industry) with one concrete question each.
4. **Data policy:** see the section below. If the judges said we may use online data, get it **in writing** from csetech@diu.edu.bd or the Telegram group today.
5. Install Node 22+, create the Vercel account (sign in with GitHub).

**Done when:** repo is public, README renders with the logo, both of you can run `node scripts/evaluate.ts`.

## Phase 1: Front-end skeleton and live link (Saturday night, then Sunday morning)
1. `npm create vite@latest` (React + TypeScript), add Tailwind. Move `src/engine` in as is.
2. Import `data/seed_registry.json` directly, so the app works with **no backend**.
3. Pages, in this order: **Check a deed** (form → verdict with reasons) → **Alert inbox** (filters by checkpoint/severity) → **Case view** (CS→SA→RS→BS chain + deeds + mutations timeline) → **Benchmark** (results table with the caveats written on the page) → **Roadmap & Limitations**.
4. **Deploy to Vercel now**, not at the end (steps below). Every later push redeploys.

**Done when:** a stranger can open the live link and run the "double sale" demo in 30 seconds.

## Phase 2: In-product documentation (Sunday late morning)
This is what cost marks last time, so it lives *in the app*, not only in the README.
- **Roadmap page:** v1 → v1.1 → v2 with the "what we will do next" list (below).
- **Limitations page:** dummy data, tiny benchmark, no chain-break evaluation, no Bangla name matching.
- **How it works page:** architecture diagram, the 8 rules with plain-language examples, the two checkpoints.
- **Data & AI page:** exactly what data and which AI tools were used (mirrors the README).

## Phase 3: Submission pack (Sunday 1–6 PM)
| Item | Notes |
|---|---|
| Concept note PDF | **3 pages** (rulebook; the email says 4, so ask in Telegram). Use `CONCEPT_NOTE_OUTLINE.md` |
| Public repo + full README | Animated header, architecture diagram, screenshots/GIFs, how to run, **data used**, **AI tools used**, roadmap |
| Demo video ≤ 90 s | Script below |
| Live link | The Vercel URL (optional per rulebook, do it anyway) |
| Short deck (6–8 slides) | The platform email lists a slide deck; the final needs one (≤ 10 slides PDF) anyway |
| Platform form | Title, abstract, problem (P3), solution, stack, links. Save draft often, then **mark it FINAL** |

**Video script (90 s):** 0–10 problem · 10–35 check a deed → blocked with reason · 35–55 inbox + case timeline · 55–75 benchmark with honest caveats · 75–90 roadmap and safeguards.

## Phase 4: If selected (before the final)
You pay 100 BDT within 3 days of the announcement. Then, in this order:
1. Rehearse the **5-minute pitch + live demo** and the 3-minute Q&A. Only the two of you present; both must attend in person. Bangla or English.
2. Finish the deck (≤ 10 slides PDF) and upload the updated code link; list changes in the README ("v1.1").
3. Improvements, highest value first:
   - Regenerate the seed with **coherent ownership chains**, add and evaluate the **chain-break rule**.
   - **Owner alert** simulation ("a transfer was attempted on your plot") and **dispute hold** state.
   - **Supabase** for officer decisions plus the hash-chained audit log (reuse `supabase/archive/0001_prototype_schema.sql`, which was tested).
   - **Bangla name matching** (spelling variants).
   - A tougher benchmark slice: "messy but innocent" cases (spelling variants, delayed mutation, splits) to measure false positives.
4. Add the P1 idea as a clearly labelled *future* module, not a promise.

## Phase 5: Final day
Laptop + offline fallback (the app runs from static JSON), phone hotspot, a screen recording as backup, both of you able to explain every file.

---

## Deploying to Vercel
1. Push the repo to GitHub.
2. vercel.com → **Add New → Project** → import the repo. Framework: Vite (auto-detected). Build `npm run build`, output `dist`.
3. `vercel.json` (already in the repo) makes page refreshes work for the single-page app.
4. Only if you add Supabase later: Project Settings → Environment Variables → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. Every push to `main` redeploys; every branch gets a preview URL. The free Hobby plan is fine for this.

## Do we need to train an AI model? Do we need Hugging Face?
**No, not for Round 1 or the final.** The rules engine is the core, and the judges asked for idea, concept and front end. Hugging Face is only needed if you host or download a model; you don't.

If you still want an AI element, in order of honesty:
1. **Plain-language case summaries from a pretrained LLM** called from a Vercel serverless function (keeps the API key off the browser). Optional; list it in the README.
2. **ML ranking after the rules** (e.g. isolation forest in Python). Only worth it after we generate thousands of realistic synthetic records. A model trained on data we generated mostly learns our generator, so present it as a pipeline demo, **never as accuracy**. This is a v2 item.
3. **OCR intake (P1):** our research report says multimodal LLMs fail badly on RS khatians (unverified). Do not promise this.
Vercel can't run heavy models. If you ever do host one, it lives on a Hugging Face Space or Inference API and the front end calls it.

## Data policy (important)
The written rulebook says: dummy data only; **no real land records; no scraping or bulk-downloading from government websites**. Breaking the data rules means immediate disqualification.
- Safe: our synthetic data; public, non-personal information (form layouts, fee schedules, statistics, published papers) **credited under "Data used" in the README**.
- Anything beyond that (real records, scraped data) needs the organizers' **written** approval, and then it must be documented in the README like everything else. The FAQ itself says only a fully anonymized document can be approved.
- We do not leave data sources out of the README or the reports: the rulebook requires listing the data used, and a hidden source is a false-information risk.

## Risks
- Time: if Sunday slips, cut "Should" items first, never the live link, the Roadmap/Limitations pages or the video.
- Benchmark numbers look perfect because the rules were written with the seed in mind. Present as a regression test.
- Verify every citation before it goes in the concept note.
