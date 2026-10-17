# Seed data (DUMMY)

Fictional registry: 3 mouzas, 24 parcel lineages, 96 khatians (CS/SA/RS/BS), 25 deeds, 23 mutation cases, 9 labelled anomalies.
Generated deterministically by `gen_seed.py` (seed 20261017). Regenerate with `OUT=./data python gen_seed.py`.
No real people, NID numbers, phone numbers or land records.

## Known limitations (read before quoting any result)
1. **Chain break is not evaluable.** In this seed every lineage has different owners in CS, SA, RS and BS, and there are no historical deeds explaining the changes. A chain-break rule would flag all 24 lineages, so L17 (the labelled chain break) is excluded from evaluation. Fix: regenerate the seed so normal lineages have coherent ownership transitions.
2. **Tiny and synthetic.** 25 deeds, 9 anomalies. Results show the rules behave as designed. They are not evidence of real-world accuracy.
3. **Rules were written with knowledge of the generator.** Treat the benchmark as a regression test.
4. Plot numbers differ between surveys; the seed gives each parcel a `lineage` id. In reality, resolving a plot across surveys (splits, merges, renumbering) is the hard part and is a v2 item.
