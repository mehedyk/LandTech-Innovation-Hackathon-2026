> Full drafts and the finished PDFs now exist: `docs/concept-note/` (Markdown source and `Ardh-concept-note.bn.pdf` / `.en.pdf`). This outline stays as the checklist.

# Concept note outline: Team Ardh (PDF, **max 3 pages** [1])

> Rulebook [1]: 3 pages. The organizers' email says 4. Stay at 3 until they confirm.

**Page 1: Problem and why it matters**
- Chosen problem: **P3, Catch Fraud & Double-Selling** [1].
- Gap: records, registration and management are run by separate authorities [4]; khatians carry known kinds of errors [2]; reform work asks for inter-checking before registration [3].
- Why it matters: more than 70 per cent of civil disputes arise from land-related conflicts, as reported from Ministry of Law figures [10].
- Who uses it: Sub-Registrar (primary), AC Land office, citizens and buyers; banks and courts later.

**Page 2: Solution, architecture, stack**
- Flow: request, Ardh Guard compares, alert with reasons, officer decides. Two checkpoints.
- Stack: TypeScript engine, React [13], Vite [14], Tailwind CSS [15], Vercel [16].
- Prior art contrast: blockchain land titles [6] store titles; Ardh Guard checks conflicts before a transaction.
- Evaluation, honestly: a regression test on dummy data, not accuracy.

**Page 3: Nationwide path, next steps, team**
- Pilot at one sub-registry and its AC Land office, read-only and in shadow mode first (plan: `INTEGRATION.md` [21][22][23]); later checks (mortgage, court case, vested property, land tax) need sources from their owners; Supabase [17] for decisions and audit; AI items are plans (pretrained models, for example via Hugging Face [18]).
- Limitations. Team and mentors. References.

- The screenshot in the note must come from the redesigned audit view (`check-en.png`); regenerate after any visual change.

**Before exporting:** [ ] names P3 in paragraph 1 · [ ] architecture diagram · [ ] AI tools listed · [ ] exactly 3 pages [1] · [ ] every inline [n] checked against `REFERENCES.md`

<!-- refs:start -->
## References

[1] LandTech Innovation Hackathon 2026 Rule Book, version 1.2. Department of CSE and CSE-TECH, Daffodil International University. [LandTech Innovation Hackathon 2026 Rule Book (v1.2)](https://landtech.diu.edu.bd/landtech)  
[2] Raziv, M. M. H., Jalil, M. A., Mia, M. T. and Mahmud, F. U. (2024). Journal of Asian and African Social Science and Humanities, 10(2), 31-44. [Errors in the Land Record of Rights (Khatiyan) and the Remedial Procedure in Bangladesh: An Analysis of Existing Regulatory Framework and Future Reforms](https://doi.org/10.55327/jaash.v10i2.335)  
[3] Ayatullah, M. (2024). Feni University Journal, 3(1), 211-222. [Essentiality of Reforms of the Registration Act 1908: E-Registration Perspective](https://doi.org/10.3329/fuj.v3i1.86557)  
[4] Emam, J. (2022). Bangladesh Journal of Public Administration, 30(2), 47-62. [The Prospect of Integrated Land Administration and Management System (ILAMS) for Improving Land Related Service Delivery in Bangladesh](https://doi.org/10.36609/bjpa.v30i2.360)  
[6] Alam, K. M., Rahman, J. M. A., Tasnim, A. and Akther, A. (2022). Journal of King Saud University - Computer and Information Sciences, 34, 3096-3110. [A Blockchain-based Land Title Management System for Bangladesh](https://doi.org/10.1016/j.jksuci.2020.10.011)  
[10] Ahana, S. I. (2025, 23 November). The Daily Observer. [Digitising land records seen as a paradigm shift](https://observerbd.com/news/555055)  
[13] React: the library for web and native user interfaces. [React](https://react.dev)  
[14] Vite: next generation frontend tooling. [Vite](https://vite.dev)  
[15] Tailwind CSS: a utility-first CSS framework. [Tailwind CSS](https://tailwindcss.com)  
[16] Vercel: hosting platform for the live prototype. [Vercel](https://vercel.com)  
[17] Supabase: Postgres development platform (planned for saving decisions and the audit trail). [Supabase](https://supabase.com)  
[18] Hugging Face: platform for pretrained models (planned source for roadmap AI features). [Hugging Face](https://huggingface.co)  
[21] The Business Standard (2020). Coordinated land registration, mutation to benefit over 1 crore people: Land secretary. [Coordinated land registration, mutation to benefit over 1 crore people: Land secretary](https://www.tbsnews.net/bangladesh/coordinated-land-registration-mutation-benefit-over-1-crore-people-land-secretary-156184)  
[22] The Daily Star (2025). Bangladesh's Personal Data Protection Ordinance 2025: key takeaways. [Bangladesh's Personal Data Protection Ordinance 2025: key takeaways](https://www.thedailystar.net/tech-startup/news/bangladeshs-personal-data-protection-ordinance-2025-key-takeaways-4015401)  
[23] The Business Standard (2023). EC to monitor partner organisations to protect NID data. [EC to monitor partner organisations to protect NID data](https://www.tbsnews.net/node/664882)  

### Other project references

- [5] [Citizens' Perspective on Land E-Mutation at Upazila Land Offices in Mymensingh](https://doi.org/10.34104/ajssls.023.02910305)
- [7] [Digitizing Land Governance in Bangladesh: A Qualitative Study of Urban and Rural Citizens' Experiences with the Digital Land Record Management System](https://doi.org/10.36481/jsp.v01.i01.3vmg5j09)
- [8] [The Impact of E-services on People's Empowerment: An Investigation into E-mutation Service of Bangladesh](https://doi.org/10.53808/KUS.2024.21.02.1177-ss)
- [9] [Digitalization of the Land Record System in Bangladesh: Prospects and Challenges](https://ssrn.com/abstract=5012153)
- [11] [Consensus: AI research assistant](https://consensus.app)
- [12] [Claude (Anthropic)](https://www.anthropic.com/claude)
- [19] [Ardh Guard: live prototype](https://land-tech-innovation-hackathon-2026.vercel.app/)
- [20] [Ardh Guard: pitch deck](https://land-tech-innovation-hackathon-2026.vercel.app/deck/)

Numbers are the same in every file. Full list with notes on what we read: [`docs/REFERENCES.md`](REFERENCES.md).
<!-- refs:end -->
