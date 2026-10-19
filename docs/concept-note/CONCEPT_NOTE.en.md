# Ardh Guard: explainable conflict checks for land deeds, before registration and before mutation

Team Ardh · LandTech Innovation Hackathon 2026 · Track: Digital Land Records, Verification & Digitization · Problem P3: Catch Fraud & Double-Selling [1]

Live prototype [19] · Pitch deck [20] · Code: public GitHub repository, linked on the submission form

## 1. The problem and why it matters

A land transaction in Bangladesh passes through offices that do not share one live view of the record. Records, registration and management of land run through three detached authorities under two ministries, which creates possibilities of miscoordination and information errors [4]. The khatian is the core record, yet it carries known kinds of errors: clerical mistakes, mistakes by officers, and errors from inheritance and sub-division [2]. Reform work therefore asks for inter-checking between registering officers and Assistant Commissioners (Land) before registration, and for alerts to owners when a transfer is attempted [3].

> **70%+** of civil disputes arise from land-related conflicts, according to Ministry of Law figures reported in the press [10]

**What slips through today:** The same share sold twice · a seller who sells more than they own · a deed for land the record shows as khas · a mutation that changes a different area than the deed.

Digital services have eased access: e-mutation cut citizens’ time, cost and visits, but coordination problems and inaccurate survey records remain [5], and rural users still face low digital literacy, poor connectivity and dependence on intermediaries [7]. Blockchain land-title proposals for Bangladesh store and secure titles [6]; they do not screen a deed for conflicts before it is accepted. In our own scoping searches [11] that pre-transaction, explainable step looked thin (a scoping impression, not a systematic review).

**Who uses it:** the Sub-Registrar (primary), AC Land officers (mutation), and citizens and buyers. Banks and courts later.

## 2. Our solution: Ardh Guard

**Ardh Guard** is an explainable conflict-detection layer with two checkpoints: **before registration** and **before mutation**. It compares a deed with the record chain (CS, SA, RS and BS khatians), the seller’s earlier deeds and the mutation history, and flags the case for a human officer **with plain-language reasons**. It never decides ownership. Every check is a readable rule, so an officer can explain a refusal to a citizen.

- Land sold more than once
- Selling more than the seller owns
- Government (khas) land
- Seller not on the record
- Document looks altered (QR, signature)
- Mutation does not match the deed
- Deed never mutated
- Mutation resubmitted after rejection

## 3. How it works

_Figure 1: Figure 1. How a check flows._  Request arrives → Ardh Guard compares → Alert with reasons → Officer decides

- **Engine:** pure TypeScript functions. Input: the registry (deeds, khatian chain, mutations). Output: alerts with structured reasons, which the interface phrases in Bangla or English.
- **Interface:** React [13], Vite [14] and Tailwind CSS [15], hosted on Vercel [16]. Bangla by default with an English toggle; views for citizen / buyer, officer / admin, or both.
- **Data:** a fictional registry (3 mouzas, 24 parcels, 96 khatians, 25 deeds, 23 mutation cases, 9 planted anomalies). No real people, NID numbers, phone numbers or land records, and nothing scraped, as the rule book requires [1].
- **Evaluation:** the rules caught 8 of 8 testable planted anomalies and raised no alerts outside them. This is a **regression test, not accuracy**: the data is small and the rules were written knowing it.

## 4. Main features

- Check a deed before registration: a full audit view with the verdict, the checks that passed or failed, the record chain and a downloadable report (HTML, JSON, PDF).
- Alert inbox for officers: confirm hold, dismiss or escalate.
- Parcel pages: the CS, SA, RS, BS chain, deeds and mutations together.
- Citizen “check before you buy” page that shows nothing about other people’s deeds.
- Bangla (default) and English; citizen, officer and both views.
- Parcel map with RS and BS outlines (made-up sketch), a simulated fingerprint step and a locked NID box; officer and citizen views side by side; light and dark themes; CSV export of alerts and benchmark; in-app benchmark, how-it-works, roadmap and limits pages.

## 5. Using it across the country

1. **Pilot:** One sub-registry office and its AC Land office, under a formal data-sharing agreement, read-only and in shadow mode first, with every source agreed by its owner.
2. **Scale:** Upazila by upazila, then district. The engine runs in the browser and needs little infrastructure.
3. **Prerequisite:** Clean, linked parcel history. Resolving plots across surveys is the hardest open question, and we say so.
4. **Governance:** Officers keep every decision. Sign-in, roles and an audit trail come before any real use.

## 6. What we will do next

**v1.1 · final round**

- Coherent-chain test data and a chain-break rule
- Owner alerts, dispute hold, saved decisions with an audit trail (Supabase [17]), sign-in and roles
- Bangla name matching; a “missing or stale data” outcome; a “messy but innocent” benchmark for false alarms
- AI: Bangla and English case summaries from a pretrained language model, reviewed by the officer

**v2 · after the hackathon**

- Plot resolution across surveys; a pilot
- AI: Bangla OCR (pretrained) to read scanned khatians and deeds, with officer confirmation
- AI: machine-learning risk ranking after the rules, once realistic data exists, keeping the rules and reasons
- Mortgage, court-case, vested-property and land-tax checks, each needing a source from its owner
- Cadastral map; identity checks only with a legal basis and consent, never biometrics

> AI items are plans; pretrained models would come from platforms such as Hugging Face [18]. No AI model runs in the prototype today.

**Limitations:** dummy data only; small benchmark; chain-break detection untested; exact name matching; the role switch is a demo control, not access control; mortgage, court, vested-property and tax checks are not built.

## 7. Team and tools

**Jobayer** (Team Leader, @MJZ-Hossen) · **S.M. Mehedy Kawser** (@mehedyk) · Faculty mentor: Zannatul Mawa Koli · Industry mentor: MD. Tahamid Hassan Sadib (CSE-TECH). **AI tools used:** Claude [12] for planning and drafting code and documents; Consensus [11] for scoping searches.

<!-- refs:start -->
## References

[1] LandTech Innovation Hackathon 2026 Rule Book, version 1.2. Department of CSE and CSE-TECH, Daffodil International University. [LandTech Innovation Hackathon 2026 Rule Book (v1.2)](https://landtech.diu.edu.bd/landtech)  
[2] Raziv, M. M. H., Jalil, M. A., Mia, M. T. and Mahmud, F. U. (2024). Journal of Asian and African Social Science and Humanities, 10(2), 31-44. [Errors in the Land Record of Rights (Khatiyan) and the Remedial Procedure in Bangladesh: An Analysis of Existing Regulatory Framework and Future Reforms](https://doi.org/10.55327/jaash.v10i2.335)  
[3] Ayatullah, M. (2024). Feni University Journal, 3(1), 211-222. [Essentiality of Reforms of the Registration Act 1908: E-Registration Perspective](https://doi.org/10.3329/fuj.v3i1.86557)  
[4] Emam, J. (2022). Bangladesh Journal of Public Administration, 30(2), 47-62. [The Prospect of Integrated Land Administration and Management System (ILAMS) for Improving Land Related Service Delivery in Bangladesh](https://doi.org/10.36609/bjpa.v30i2.360)  
[5] Begum, S. (2023). Asian Journal of Social Sciences and Legal Studies, 5(6), 291-305. [Citizens' Perspective on Land E-Mutation at Upazila Land Offices in Mymensingh](https://doi.org/10.34104/ajssls.023.02910305)  
[6] Alam, K. M., Rahman, J. M. A., Tasnim, A. and Akther, A. (2022). Journal of King Saud University - Computer and Information Sciences, 34, 3096-3110. [A Blockchain-based Land Title Management System for Bangladesh](https://doi.org/10.1016/j.jksuci.2020.10.011)  
[7] Debnath, A., Reza, S., Islam, M. R. and Rahman, M. A. (2026). Journal of Society and Progress, 1(1), 71-86. [Digitizing Land Governance in Bangladesh: A Qualitative Study of Urban and Rural Citizens' Experiences with the Digital Land Record Management System](https://doi.org/10.36481/jsp.v01.i01.3vmg5j09)  
[10] Ahana, S. I. (2025, 23 November). The Daily Observer. [Digitising land records seen as a paradigm shift](https://observerbd.com/news/555055)  
[11] Consensus (2026). AI-generated literature search reports used for scoping (P3 gap analysis; CS, SA, RS, BS chain; e-services). [Consensus: AI research assistant](https://consensus.app)  
[12] Anthropic. Claude, used for planning and for drafting code and documents. [Claude (Anthropic)](https://www.anthropic.com/claude)  
[13] React: the library for web and native user interfaces. [React](https://react.dev)  
[14] Vite: next generation frontend tooling. [Vite](https://vite.dev)  
[15] Tailwind CSS: a utility-first CSS framework. [Tailwind CSS](https://tailwindcss.com)  
[16] Vercel: hosting platform for the live prototype. [Vercel](https://vercel.com)  
[17] Supabase: Postgres development platform (planned for saving decisions and the audit trail). [Supabase](https://supabase.com)  
[18] Hugging Face: platform for pretrained models (planned source for roadmap AI features). [Hugging Face](https://huggingface.co)  
[19] Team Ardh (2026). Ardh Guard live prototype. [Ardh Guard: live prototype](https://land-tech-innovation-hackathon-2026.vercel.app/)  
[20] Team Ardh (2026). Ardh Guard pitch deck, interactive and bilingual. [Ardh Guard: pitch deck](https://land-tech-innovation-hackathon-2026.vercel.app/deck/)  

### Other project references

- [8] [The Impact of E-services on People's Empowerment: An Investigation into E-mutation Service of Bangladesh](https://doi.org/10.53808/KUS.2024.21.02.1177-ss)
- [9] [Digitalization of the Land Record System in Bangladesh: Prospects and Challenges](https://ssrn.com/abstract=5012153)
- [21] [Coordinated land registration, mutation to benefit over 1 crore people: Land secretary](https://www.tbsnews.net/bangladesh/coordinated-land-registration-mutation-benefit-over-1-crore-people-land-secretary-156184)
- [22] [Bangladesh's Personal Data Protection Ordinance 2025: key takeaways](https://www.thedailystar.net/tech-startup/news/bangladeshs-personal-data-protection-ordinance-2025-key-takeaways-4015401)
- [23] [EC to monitor partner organisations to protect NID data](https://www.tbsnews.net/node/664882)

Numbers are the same in every file. Full list with notes on what we read: [`docs/REFERENCES.md`](../REFERENCES.md).
<!-- refs:end -->
