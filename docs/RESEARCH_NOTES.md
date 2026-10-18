# Research notes: what we learned and what we built because of it

*Findings come from the papers in `SOURCES.md`, opened and checked, with the AI-generated Consensus reports [11] used only for scoping.*

## What the sources say (each one opened and checked)
1. Khatians carry **known kinds of errors**: clerical mistakes, bona fide mistakes by officers, errors from inheritance and from sub-division of holdings, so one record cannot be taken at face value [2]. (We do **not** claim a khatian is "not conclusive proof of ownership": the paper does not say that.)
2. Records, registration and management of land run through **three detached authorities under two ministries**, which creates possibilities of miscoordination and information errors [4].
3. Reform work asks for **inter-checking between Registering Officers and Assistant Commissioners (Land) before registration**, and a **property conveyance alert** to owners; it also notes that an ownership-change record from a sub-registry to the central database may not be updated for up to two years [3].
4. E-mutation reduced time, cost and visits, but coordination problems and inaccurate survey records remain in the land system [5]; rural users report low digital literacy, poor connectivity and reliance on intermediaries, and issues remain with mutation [7]. Background on e-mutation: [8].
5. Land is a major source of conflict: more than 70 per cent of civil disputes arise from land-related conflicts, according to Ministry of Law figures **as reported in a newspaper article of 23 November 2025** [10]. Say "reported", because it is a secondary source.
6. Blockchain land-title systems for Bangladesh already exist in the literature [6]. They store and secure titles. Ardh Guard is different: it checks a deed against the record **before** the transaction is accepted. In our own scoping searches, pre-transaction, explainable screening looked thin [11]; that is a scoping impression, not a systematic review.
7. Not opened by us, so **not claimed**: safeguard studies cited by the Consensus report (Karusala et al. 2024; Huggins 2021) and the OCR result for khatians (Hasan et al. 2026) [11]. See [`REFERENCES.md`](REFERENCES.md).

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

<!-- refs:start -->
## References

[2] Raziv, M. M. H., Jalil, M. A., Mia, M. T. and Mahmud, F. U. (2024). Journal of Asian and African Social Science and Humanities, 10(2), 31-44. [Errors in the Land Record of Rights (Khatiyan) and the Remedial Procedure in Bangladesh: An Analysis of Existing Regulatory Framework and Future Reforms](https://doi.org/10.55327/jaash.v10i2.335)  
[3] Ayatullah, M. (2024). Feni University Journal, 3(1), 211-222. [Essentiality of Reforms of the Registration Act 1908: E-Registration Perspective](https://doi.org/10.3329/fuj.v3i1.86557)  
[4] Emam, J. (2022). Bangladesh Journal of Public Administration, 30(2), 47-62. [The Prospect of Integrated Land Administration and Management System (ILAMS) for Improving Land Related Service Delivery in Bangladesh](https://doi.org/10.36609/bjpa.v30i2.360)  
[5] Begum, S. (2023). Asian Journal of Social Sciences and Legal Studies, 5(6), 291-305. [Citizens' Perspective on Land E-Mutation at Upazila Land Offices in Mymensingh](https://doi.org/10.34104/ajssls.023.02910305)  
[6] Alam, K. M., Rahman, J. M. A., Tasnim, A. and Akther, A. (2022). Journal of King Saud University - Computer and Information Sciences, 34, 3096-3110. [A Blockchain-based Land Title Management System for Bangladesh](https://doi.org/10.1016/j.jksuci.2020.10.011)  
[7] Debnath, A., Reza, S., Islam, M. R. and Rahman, M. A. (2026). Journal of Society and Progress, 1(1), 71-86. [Digitizing Land Governance in Bangladesh: A Qualitative Study of Urban and Rural Citizens' Experiences with the Digital Land Record Management System](https://doi.org/10.36481/jsp.v01.i01.3vmg5j09)  
[8] Ali, M. Y., Pasha, G. M., Jahan, K. and Paul, P. (2024). Khulna University Studies, 21(2). [The Impact of E-services on People's Empowerment: An Investigation into E-mutation Service of Bangladesh](https://doi.org/10.53808/KUS.2024.21.02.1177-ss)  
[10] Ahana, S. I. (2025, 23 November). The Daily Observer. [Digitising land records seen as a paradigm shift](https://observerbd.com/news/555055)  
[11] Consensus (2026). AI-generated literature search reports used for scoping (P3 gap analysis; CS, SA, RS, BS chain; e-services). [Consensus: AI research assistant](https://consensus.app)  

### Other project references

- [1] [LandTech Innovation Hackathon 2026 Rule Book (v1.2)](https://landtech.diu.edu.bd/landtech)
- [9] [Digitalization of the Land Record System in Bangladesh: Prospects and Challenges](https://ssrn.com/abstract=5012153)
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
