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
- Light and dark themes; CSV export of alerts and benchmark; in-app benchmark, how-it-works, roadmap and limits pages.

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
