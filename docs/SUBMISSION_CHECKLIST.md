# Round 1 submission checklist (deadline Sun 18 Oct, 11:59 PM [1]; target 6 PM)

## Now
- [ ] **After the redesign:** run `npm install && npm test && npm run build` once (not possible where the redesign was made), then open the preview and look at every page in light, dark and on a phone
- [ ] Regenerate screenshots with `scripts/make-media.py` from the real build, then rebuild the deck images and the concept note (`scripts/build-concept-note.py`, still 3 pages)
- [ ] Download each report (HTML, JSON, print to PDF, alerts CSV, benchmark CSV, parcel HTML) on a phone and a laptop; open the CSVs in Excel to check Bangla text
- [ ] Both view: on a laptop the officer and citizen frames sit side by side, on a phone they stack; every tab shows an Officer or Citizen tag
- [ ] Parcel map shows on Check, Buy and parcel pages; RS, BS and both buttons work; the NID box opens and its field and button stay disabled; the fingerprint button shows a result and nothing in the reports mentions it
- [ ] Kalpurush loads (Network tab) and Latin text stays in Inter
- [ ] Live site [19] works on a phone and a laptop (click all six examples): https://land-tech-innovation-hackathon-2026.vercel.app/
- [ ] Public GitHub repo has the latest code, README and `docs/media`
- [ ] Data question sent in writing to the organizers; both mentors messaged
- [ ] Platform panel: confirm the team leader name matches the README and concept note (Jobayer)

## Write
- [ ] Concept note, **3 pages**, PDF [1]: built in `docs/concept-note/` (`Ardh-concept-note.bn.pdf` and `.en.pdf`, 3 pages each, with linked references). Upload one; ask your mentors which language. Open each linked source once before you submit.
- [x] README TODOs filled: AI tools, changes since Round 1, license (MIT; confirm the team agrees; the Kalpurush font stays under SIL OFL 1.0, see `public/fonts/README.md`)
- [ ] Short deck: done as an interactive page at `/deck/` and as PDFs in `docs/deck/` (8 slides, Bangla and English). Read the speaker notes (press N) and rehearse once. Final round rule: 5 minutes pitch + live demo, then 3 minutes of questions.

## Record
- [ ] Demo video, 90 s or less (`VIDEO_SCRIPT.md`), captions on

## Submit (platform form)
- [ ] Title and abstract
- [ ] Problem: **P3, Catch Fraud & Double-Selling**
- [ ] Solution and tech stack
- [ ] Links: repository, live site, video, deck, concept note
- [ ] **Mark it FINAL.** A draft is not judged.
- [ ] Reopen the submission and confirm it shows as final

## Later (not for Round 1)
- [ ] Read `INTEGRATION.md` and agree which items go in the final pitch as plans; check the data-protection law status with a lawyer before any pilot talk

## Both of you
- [ ] Each can explain `src/engine/rules.ts` line by line (about 100 lines). The rulebook disqualifies code you cannot explain [1].
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

Numbers are the same in every file. Full list with notes on what we read: [`docs/REFERENCES.md`](REFERENCES.md).
<!-- refs:end -->
