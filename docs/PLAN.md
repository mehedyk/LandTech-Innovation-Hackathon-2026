# Plan: Ardh Guard (LandTech 2026, P3)

Background for the choice of P3: blockchain land-title proposals for Bangladesh exist [6], while checks for conflicts before a transaction is accepted are what reform work asks for [3] and what our own scoping searches found thin [11].

**Team:** Jobayer (registered team leader, @MJZ-Hossen) + S.M. Mehedy Kawser (@mehedyk). We work together; no fixed split.
**Judges' advice:** to be selected for Round 2, show at least the **idea, the concept and a working front end**, and show **what we will do next**.
**Dates [1]:** Round 1 deadline **Sun 18 Oct, 11:59 PM** (target submit by **6 PM**) · Final tentatively **24 Oct**, Knowledge Tower, DIU.

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

**Status:** done. Live at https://land-tech-innovation-hackathon-2026.vercel.app/. Since Round 1 the interface was redesigned from the mockups in `design/potential-designs/` (light and dark themes, two-tier header, Kalpurush for Bangla; the phone bottom tab bar was later replaced by a hamburger drawer, see Phase 1b) and gained the full audit view and downloads (HTML, JSON, print to PDF, CSV). The rules engine, data and results did not change.

## Phase 1b: Sign-in, role dashboards and navigation (the "v2 shell", added after Round 1)
**Why:** the first screens had a "View as" switch and a Both mode, one full-width map of rectangles and no way to tell the offices apart. The interface needed to show *who is using it* and give each office its own starting point, without touching the rules engine.

**What was built**
1. **Sign-in** (`#/login`) with four demo accounts, one per actor, shown on the page: citizen/buyer, sub-registrar, AC Land officer, admin/auditor. A **sign-up page is written out but not active** (submitting shows a notice and stores nothing).
2. **One dashboard per role**, same forest green and gold, more modern shapes (leaf-cornered cards, hexagon icons, ring and bar charts, a small flag-disc accent). Every number is computed from the registry and the rules (`src/lib/stats.ts`); none is invented.
3. **Role scoping.** Sub-registrar: dashboard, check a deed, alerts for the *pre-registration* checkpoint, parcels. AC Land officer: dashboard, alerts for the *pre-mutation* checkpoint, parcels. Admin/auditor: everything, **read-only**, plus the benchmark and the side-by-side view (the old Both view, kept for judges). Citizen: dashboard and check before you buy. Only the two offices can record decisions.
4. **Navigation:** a bar with a "More" menu and a user menu on wide screens, and a hamburger drawer below 1280 px (replaces the phone bottom tab bar). The drawer closes on Esc or a click outside, keeps Tab inside, and returns focus.
5. **Parcel map:** small (about 21 rem), zoomed on the plot, made of irregular rounded shapes from an area-weighted Voronoi layout (`data/gen_geometry.py`). The road rectangle was dropped. Reports use the same window.
6. Fixed a duplicate string key (`rep.idNote`) that broke `npm run build`.

**How the role split was decided.** The sub-registrar's office registers the deed after checking the record of rights in the AC (Land) database; the registration details and a copy then go to the AC (Land) office, which completes the mutation (an e-mutation case is opened from the registration copy, with no separate application) [news reports, 2020; procedures may have changed: [The Business Standard](https://www.tbsnews.net/bangladesh/mutation-application-no-longer-needed-land-office-171619), [The Financial Express](https://old.thefinancialexpress.com.bd/national/land-mutation-to-be-completed-within-eight-days-of-registration-1604929836)]. The engine already tags each alert as *pre-registration* or *pre-mutation*, so each office simply sees its own. The sub-registrar also gets parcels because alerts link to the parcel record. The auditor decides nothing, so the oversight role cannot change the outcome it reviews.

**Still demo-only (do not present as real):** the four passwords are public and nothing is checked on a server; roles are a front-end filter; decisions are stored in the browser only. Real sign-in, per-office accounts, server-side roles and the hash-chained audit log stay in Phase 4 and Phase 6.

**Status:** done. Checked in a browser at 1366, 1280 and 390 px, in light and dark, in Bangla and English; `npm run build` and `npm test` pass. README screenshots were regenerated with `scripts/make-media.py` (it now signs in as the demo auditor). **Not regenerated:** the PDF deck and concept notes (`Ardh-pitch-deck.*.pdf`, `docs/concept-note/*`) and `public/deck`; see `SUBMISSION_CHECKLIST.md`.

## Phase 2: In-product documentation (Sunday late morning)
This is what cost marks last time, so it lives *in the app*, not only in the README.
- **Roadmap page:** v1 → v1.1 → v2 with the "what we will do next" list (below).
- **Limitations page:** dummy data, tiny benchmark, no chain-break evaluation, no Bangla name matching.
- **How it works page:** architecture diagram, the 8 rules with plain-language examples, the two checkpoints.
- **Data & AI page:** exactly what data and which AI tools were used (mirrors the README).

**Phase 2 status:** done. The app has How it works (flow, two checkpoints, all 8 checks with examples), Roadmap and limits, and Data and AI used (inside Roadmap and limits). Engine tests: `npm test`.

## Phase 3: Submission pack
**Status:** done for Round 1. After the v2 shell the README screenshots and `public/deck/img/check*.png` were regenerated; the PDF deck and concept notes still show the old interface. Re-check the pack after the redesign: regenerate screenshots, deck images and the concept note figure from a real build (`scripts/make-media.py`, `scripts/build-concept-note.py`), and tick `SUBMISSION_CHECKLIST.md`.
 (Sunday 1–6 PM)
| Item | Notes |
|---|---|
| Concept note PDF | **3 pages** (rulebook [1]; the email says 4, so ask in Telegram). Use `CONCEPT_NOTE_OUTLINE.md` |
| Public repo + full README | Animated header, architecture diagram, screenshots/GIFs, how to run, **data used**, **AI tools used**, roadmap |
| Demo video ≤ 90 s | Script below |
| Live link | The Vercel URL (optional per rulebook [1], do it anyway) |
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
   - **A "missing or stale data" outcome** beside clear and flag, so a case with a missing or late source goes to manual verification instead of reading as clear.
   - **Done after Round 1 (dummy data):** parcel map sketch with RS and BS outlines, simulated fingerprint step, locked NID box, and a side-by-side officer and citizen screen (the Both view, now admin-only). **Done (v2 shell):** demo sign-in for four roles, role dashboards, hamburger navigation, small irregular parcel map (Phase 1b).
   - **Left out of the redesign on purpose, buildable on dummy data now:** price check against a published mouza rate table; division, district, upazila and mouza filters and a deed-number search; text-size and high-contrast controls; an installable offline mode (the data is static JSON, so this is cheap).
4. Add the P1 idea as a clearly labelled *future* module, not a promise.

## Phase 5: Final day
Laptop + offline fallback (the app runs from static JSON), phone hotspot, a screen recording as backup, both of you able to explain every file.

---

## Phase 6: After the hackathon (pilot track)
These were shown in the portal mockups but need a data source, a legal basis or formal authority first. Detail, owners to confirm and exit criteria are in [`INTEGRATION.md`](INTEGRATION.md) [21][22][23]. None is promised for the final.

| Item | Why it waits | First step |
|---|---|---|
| Vested and abandoned property, court injunction, bank mortgage, heirship certificate, land development tax | Needs a source from its owning office; five of the portal's seven mandatory checks | Ask each office what can be queried by plot |
| Real cadastral map (a made-up sketch exists) | Needs plot geometry from the survey authority | Confirm availability and licence |
| Real NID match and photos (a locked placeholder exists) | Needs a legal basis, consent and an Election Commission agreement; the EC applies strict partner controls [23] | Decide whether any check truly needs it; legal review |
| Real fingerprint match (a simulated demo exists) | Biometric, sensitive data [22] | Not planned |
| Digital notice or stay, official seal and QR certificate, government header and helpline | Needs formal authority and a digital-signature framework | Not before an agreement |
| Integration gateway, shadow mode at one sub-registry and AC Land office | Needs a written agreement and security review | Draft the agreement scope |
| Real sign-in, server-side roles, saved decisions, audit log (a front-end demo sign-in with four roles exists, Phase 1b) | Our own work, no outside dependency | Supabase, as in Phase 4 |

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
The written rulebook [1] says: dummy data only; **no real land records; no scraping or bulk-downloading from government websites**. Breaking the data rules means immediate disqualification.
- Safe: our synthetic data; public, non-personal information (form layouts, fee schedules, statistics, published papers) **credited under "Data used" in the README**.
- Anything beyond that (real records, scraped data) needs the organizers' **written** approval, and then it must be documented in the README like everything else. The FAQ itself says only a fully anonymized document can be approved.
- We do not leave data sources out of the README or the reports: the rulebook requires listing the data used, and a hidden source is a false-information risk.

## Risks
- The demo sign-in could be read as real security. The sign-in page, the footer, the README and the limits page all say it is a demo gate; keep it that way and never reuse these passwords anywhere.
- Time: if Sunday slips, cut "Should" items first, never the live link, the Roadmap/Limitations pages or the video.
- Benchmark numbers look perfect because the rules were written with the seed in mind. Present as a regression test.
- Verify every citation before it goes in the concept note.

<!-- refs:start -->
## References

[1] LandTech Innovation Hackathon 2026 Rule Book, version 1.2. Department of CSE and CSE-TECH, Daffodil International University. [LandTech Innovation Hackathon 2026 Rule Book (v1.2)](https://landtech.diu.edu.bd/landtech)  
[3] Ayatullah, M. (2024). Feni University Journal, 3(1), 211-222. [Essentiality of Reforms of the Registration Act 1908: E-Registration Perspective](https://doi.org/10.3329/fuj.v3i1.86557)  
[6] Alam, K. M., Rahman, J. M. A., Tasnim, A. and Akther, A. (2022). Journal of King Saud University - Computer and Information Sciences, 34, 3096-3110. [A Blockchain-based Land Title Management System for Bangladesh](https://doi.org/10.1016/j.jksuci.2020.10.011)  
[11] Consensus (2026). AI-generated literature search reports used for scoping (P3 gap analysis; CS, SA, RS, BS chain; e-services). [Consensus: AI research assistant](https://consensus.app)  
[21] The Business Standard (2020). Coordinated land registration, mutation to benefit over 1 crore people: Land secretary. [Coordinated land registration, mutation to benefit over 1 crore people: Land secretary](https://www.tbsnews.net/bangladesh/coordinated-land-registration-mutation-benefit-over-1-crore-people-land-secretary-156184)  
[22] The Daily Star (2025). Bangladesh's Personal Data Protection Ordinance 2025: key takeaways. [Bangladesh's Personal Data Protection Ordinance 2025: key takeaways](https://www.thedailystar.net/tech-startup/news/bangladeshs-personal-data-protection-ordinance-2025-key-takeaways-4015401)  
[23] The Business Standard (2023). EC to monitor partner organisations to protect NID data. [EC to monitor partner organisations to protect NID data](https://www.tbsnews.net/node/664882)  

### Other project references

- [2] [Errors in the Land Record of Rights (Khatiyan) and the Remedial Procedure in Bangladesh: An Analysis of Existing Regulatory Framework and Future Reforms](https://doi.org/10.55327/jaash.v10i2.335)
- [4] [The Prospect of Integrated Land Administration and Management System (ILAMS) for Improving Land Related Service Delivery in Bangladesh](https://doi.org/10.36609/bjpa.v30i2.360)
- [5] [Citizens' Perspective on Land E-Mutation at Upazila Land Offices in Mymensingh](https://doi.org/10.34104/ajssls.023.02910305)
- [7] [Digitizing Land Governance in Bangladesh: A Qualitative Study of Urban and Rural Citizens' Experiences with the Digital Land Record Management System](https://doi.org/10.36481/jsp.v01.i01.3vmg5j09)
- [8] [The Impact of E-services on People's Empowerment: An Investigation into E-mutation Service of Bangladesh](https://doi.org/10.53808/KUS.2024.21.02.1177-ss)
- [9] [Digitalization of the Land Record System in Bangladesh: Prospects and Challenges](https://ssrn.com/abstract=5012153)
- [10] [Digitising land records seen as a paradigm shift](https://observerbd.com/news/555055)
- [12] [Claude (Anthropic)](https://www.anthropic.com/claude)
- [13] [React](https://react.dev)
- [14] [Vite](https://vite.dev)
- [15] [Tailwind CSS](https://tailwindcss.com)
- [16] [Vercel](https://vercel.com)
- [17] [Supabase](https://supabase.com)
- [18] [Hugging Face](https://huggingface.co)
- [19] [Ardh Guard: live prototype](https://land-tech-innovation-hackathon-2026.vercel.app/)
- [20] [Ardh Guard: pitch deck](https://land-tech-innovation-hackathon-2026.vercel.app/deck/)

Numbers are the same in every file. Full list with notes on what we read: [`docs/REFERENCES.md`](REFERENCES.md).
<!-- refs:end -->
