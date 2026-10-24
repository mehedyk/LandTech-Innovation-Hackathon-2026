# Final round checklist (tentatively Sat 24 Oct, Knowledge Tower, DIU)

Round 1 (deadline Sun 18 Oct) is closed, so the old Round 1 list was replaced by this one. Final-round rule: **5 minutes pitch + live demo, then 3 minutes of questions**. Only the two of you present, both in person, Bangla or English [1].

## Tonight
- [x] `npm install && npm test && npm run build` pass on the pre-final update (nine checks, input check, resale-before-mutation, rejected-mutation fix, citizen page change, fingerprint step removed)
- [ ] Push the update to GitHub so Vercel redeploys, then open the live site [19] on a phone and a laptop
- [ ] On the live site, click all six examples on **Check a deed** and all six on **Check before you buy**; confirm the citizen page shows no name until you tap an example, and shows only "Seller on the current record: Yes/No"
- [ ] Open `#/signup`: the "Not working" badge and banner show, and the button says it does not work
- [ ] `#/split` (admin/auditor only): both sides follow the same parcel
- [ ] On your own phone, tap **Print / PDF** on a check result: the report opens in a new tab and the print or share sheet appears; choose Save as PDF. If your browser blocks the tab, allow pop-ups for the site or use the HTML download
- [ ] Download the officer report and the buyer report once each; the buyer report has the map, no neighbour ids, no share and no survey history
- [ ] Rebuild the PDFs you will use (`python3 scripts/build-concept-note.py`; the deck PDFs from `/deck/`) so they say "8 of 9 planted" and have no fingerprint step
- [ ] Phone hotspot, laptop on charge, a screen recording as backup (the app also runs from static JSON, so it works offline)
- [ ] Confirm the team leader name on the platform matches the README and concept note (Jobayer)

## Say these before a judge asks
- **No AI model runs in the app.** The checks are plain rules, so every alert can be explained to a citizen. AI is on the roadmap, always with officer review.
- **Benchmark: 8 of the 9 planted anomalies.** The ninth, a chain break, cannot be tested on this seed, so we do not count it. The rules were written knowing the data: it is a regression test, not accuracy.
- **The tolerances are our assumptions** (0.5% on area, 2% on mutation, 180 days for a stale deed), not land-office rules.
- **Unreadable input is never "clear".** The input check sends it to an officer as "not verified".
- **A resale before mutation is a Review, not a Hold**, one hop only. **A deed whose mutation was rejected still counts as sold**, because registration and mutation are separate steps. Whether that is exactly right in law is a question for the land office.
- **Sign-in is a demo gate** (public passwords, checked in the browser). The sign-up page does not work and says so.
- **The citizen page relies on a typed name.** It only says whether the seller is on the current record. A real version ties each check to the buyer's own deed draft, logs it and rate-limits it.
- **No biometrics.** The NID box is locked because the hackathon rules forbid NID data.

## Likely questions, honest short answers
- *Is this just if-statements?* Yes, on purpose: explainable rules first, a model only where rules cannot do the job (OCR, ranking), and always with an officer deciding.
- *Your benchmark is 100%.* Because we wrote the rules knowing the data. We say so on the page. The ninth case is excluded, and a messy-but-innocent slice is on the roadmap (a few such cases are tested today).
- *What about misspelled names?* Names are matched exactly today; Bangla name matching is on the roadmap.
- *Where does the data come from?* Today a made-up registry. A pilot would read from the land office systems in shadow mode (see `INTEGRATION.md`).
- *Can anyone look up who owns what?* On this demo, a typed name only says on/off the current record; see the citizen-page note above.

## Both of you
- [ ] Each can explain `src/engine/rules.ts` (about 135 lines) line by line, including the input gate, the one-hop resale logic and why rejected mutations still count. The rulebook disqualifies code you cannot explain [1].
- [ ] Run `npm run eval` and `npm test` once together and read the output aloud
- [ ] Rehearse the 5-minute pitch twice with a timer, once in Bangla and once in English
- [ ] Commit history is real and untouched (never delete or rewrite it)

<!-- refs:start -->
## References

[1] LandTech Innovation Hackathon 2026 Rule Book, version 1.2. Department of CSE and CSE-TECH, Daffodil International University. [LandTech Innovation Hackathon 2026 Rule Book (v1.2)](https://landtech.diu.edu.bd/landtech)  
[19] Team Ardh (2026). Ardh Guard live prototype. [Ardh Guard: live prototype](https://land-tech-innovation-hackathon-2026.vercel.app/)  

### Other project references

- [2] [Errors in the Land Record of Rights (Khatiyan) and the Remedial Procedure in Bangladesh: An Analysis of Existing Regulatory Framework and Future Reforms](https://doi.org/10.55327/jaash.v10i2.335)
- [3] [Essentiality of Reforms of the Registration Act 1908: E-Registration Perspective](https://doi.org/10.3329/fuj.v3i1.86557)
- [4] [The Prospect of Integrated Land Administration and Management System (ILAMS) for Improving Land Related Service Delivery in Bangladesh](https://doi.org/10.36609/bjpa.v30i2.360)
- [5] [Citizens' Perspective on Land E-Mutation at Upazila Land Offices in Mymensingh](https://doi.org/10.34104/ajssls.023.02910305)
- [6] [A Blockchain-based Land Title Management System for Bangladesh](https://doi.org/10.1016/j.jksuci.2020.10.011)
- [7] [Digitizing Land Governance in Bangladesh: A Qualitative Study of Urban and Rural Citizens' Experiences with the Digital Land Record Management System](https://doi.org/10.36481/jsp.v01.i01.3vmg5j09)
- [8] [The Impact of E-services on People's Empowerment: An Investigation into E-mutation Service of Bangladesh](https://doi.org/10.53808/KUS.2024.21.02.1177-ss)
- [9] [Digitalization of the Land Record System in Bangladesh: Prospects and Challenges](https://ssrn.com/abstract=5012153)
- [10] [Digitising land records seen as a paradigm shift](https://observerbd.com/news/555055)
- [11] [Consensus: AI research assistant](https://consensus.app)
- [12] [Claude (Anthropic)](https://www.anthropic.com/claude)
- [13] [React](https://react.dev)
- [14] [Vite](https://vite.dev)
- [15] [Tailwind CSS](https://tailwindcss.com)
- [16] [Vercel](https://vercel.com)
- [17] [Supabase](https://supabase.com)
- [18] [Hugging Face](https://huggingface.co)
- [20] [Ardh Guard: pitch deck](https://land-tech-innovation-hackathon-2026.vercel.app/deck/)
- [21] [Coordinated land registration, mutation to benefit over 1 crore people: Land secretary](https://www.tbsnews.net/bangladesh/coordinated-land-registration-mutation-benefit-over-1-crore-people-land-secretary-156184)
- [22] [Bangladesh's Personal Data Protection Ordinance 2025: key takeaways](https://www.thedailystar.net/tech-startup/news/bangladeshs-personal-data-protection-ordinance-2025-key-takeaways-4015401)
- [23] [EC to monitor partner organisations to protect NID data](https://www.tbsnews.net/node/664882)
- [24] [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [25] [HTTP Security Response Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [26] [Clickjacking Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)
- [27] [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [28] [CSV Injection](https://community.owasp.org/attacks/CSV_Injection)
- [29] [CWE-1236: Improper Neutralization of Formula Elements in a CSV File](https://cwe.mitre.org/data/definitions/1236.html)
- [30] [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [31] [CREATE FUNCTION (PostgreSQL documentation)](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [32] [Env Variables and Modes | Vite](https://vite.dev/guide/env-and-mode)
- [33] [Jack-in-the-box: An Empirical Study of JavaScript Bundling on the Web and its Security Implications](https://doi.org/10.1145/3576915.3623140)
- [34] [Where We Stand (or Fall): An Analysis of CSRF Defenses in Web Frameworks](https://doi.org/10.1145/3471621.3471846)
- [35] [Secrets That Survive Everything: Runtime Credential Exposure in Production Web Applications](https://doi.org/10.1109/access.2026.3734984)

Numbers are the same in every file. Full list with notes on what we read: [`docs/REFERENCES.md`](REFERENCES.md).
<!-- refs:end -->
