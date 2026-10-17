// Usage: node scripts/evaluate.ts   (Node >= 22.18, no dependencies)
import { readFileSync, writeFileSync } from 'node:fs';
import { analyze } from '../src/engine/rules.ts';
import type { Registry } from '../src/engine/types.ts';

const reg: Registry = JSON.parse(readFileSync(new URL('../data/seed_registry.json', import.meta.url), 'utf8'));
const alerts = analyze(reg);

// Chain break (SA -> RS owner discontinuity) is NOT evaluable on this seed:
// every lineage has unrelated owners per survey and the seed has no historical deeds,
// so a chain-break rule would flag all lineages. See docs/RESEARCH_NOTES.md.
const NOT_EVALUABLE = new Set(['chain_break_SA_to_RS_no_link_deed']);

const labelled = new Set(reg.anomaly_labels.flatMap((l) => l.records));
const rows = reg.anomaly_labels.map((l) => {
  const hits = alerts.filter((a) => l.records.includes(a.record));
  return {
    lineage: l.lineage, anomaly: l.anomaly, area: l.problem_area, evaluable: !NOT_EVALUABLE.has(l.anomaly),
    detected: hits.length > 0, rules: [...new Set(hits.map((h) => h.rule))],
  };
});
const ev = rows.filter((r) => r.evaluable);
const tp = ev.filter((r) => r.detected).length;

const actionable = alerts.filter((a) => a.severity !== 'info');
const flaggedDeeds = new Set(actionable.map((a) => a.record));
const fp = [...flaggedDeeds].filter((id) => !labelled.has(id));
const out = {
  labelled_anomalies: rows.length, evaluable: ev.length, detected: tp, recall: +(tp / ev.length).toFixed(3),
  deeds_total: reg.deeds.length, deeds_flagged: flaggedDeeds.size, false_positive_deeds: fp,
  precision_on_deeds: +(1 - fp.length / flaggedDeeds.size).toFixed(3),
  per_anomaly: rows, alerts,
};
writeFileSync(new URL('../data/eval_results.json', import.meta.url), JSON.stringify(out, null, 2));
console.table(rows.map((r) => ({ ...r, rules: r.rules.join(', ') })));
console.log({ recall: out.recall, precision_on_deeds: out.precision_on_deeds, deeds_flagged: out.deeds_flagged, of: out.deeds_total, false_positive_deeds: fp });
