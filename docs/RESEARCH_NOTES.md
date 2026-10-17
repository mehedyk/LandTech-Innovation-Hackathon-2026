# Research notes: what we learned and what we built because of it

*Findings come from the AI-generated Consensus reports and the papers in `SOURCES.md`. Verify each reference before citing.*

## What the sources say
1. Khatian is essential but **not conclusive proof of ownership**, so fraud screening cannot trust one document (Raziv et al., 2024; Safiullah, 2021).
2. Records, registration and management sit in **separate authorities** with limited coordination, which delays mutation and weakens title checks (Emam/Imam, 2023).
3. Existing e-services help access and transparency but have **not solved disputes**; many only digitize printing or archiving (Consensus e-services report).
4. In our literature search, blockchain registries are crowded, while **pre-transaction, explainable, Bangladesh-specific fraud screening** is thin (Consensus P3 report).
5. Reform papers call for **inter-checking between Sub-Registrar and AC Land**, property alerts and automatic e-mutation links (Ayatullah, 2026).
6. Safeguards matter more than clever models: **human review, contestability, owner alerts, dispute hold, phased pilot** (P3 report, citing Karusala et al., 2024; Huggins, 2021).
7. OCR on legacy khatians is unreliable today (Hasan et al., 2026, via the P3 report; unverified), so we do not claim to solve P1.

## Rule ↔ evidence ↔ seed label
| Rule | Catches | Seed anomaly |
|---|---|---|
| `OVERLAPPING_SALE` | Same seller sells more than their holding across deeds (double sale) | L05, L09 |
| `SHARE_OVERRUN` | Deed claims more than the seller's recorded share | L12, L09 |
| `KHAS_CONFLICT` | Plot is khas/government in the latest record | L20 |
| `SELLER_NOT_RECORDED_OWNER` | Seller absent from the latest khatian | (none in seed; unit-test it) |
| `INVALID_QR_OR_SIGNATURE` | Forged or altered document | L22 |
| `MUTATION_AREA_MISMATCH` | Mutation changed a different area than the deed | L03 |
| `REGISTERED_NOT_MUTATED` | Record of rights still shows the old owner | L14 |
| `REJECTED_THEN_RESUBMITTED` | Workflow signal for human review | L07 |
| *(chain break)* | Owner discontinuity across surveys with no link deed | L17, **not evaluable** (see `data/DATA_README.md`) |

## Benchmark result (run `npm run eval`)
8 of 8 evaluable anomalies detected; 8 of 25 deeds flagged, none outside the labels.
**Do not present this as accuracy.** The seed is small and synthetic, and the rules were written knowing how it was generated. It is a regression test that the rules do what we designed them to do.

## Honest open questions
- Can clean, linked, legally usable parcel-history data be assembled for real pre-registration use? (The P3 report names this as the biggest open question.)
- Plot renumbering, splits and merges across surveys need real lineage resolution; our seed hands us a `lineage` id.
- Name matching for Bangla spelling variants is not handled in v1.
