import type { Alert, Registry } from './types.ts';

/** Chain break (SA -> RS owner discontinuity) is NOT evaluable on this seed:
 *  every lineage has unrelated owners per survey and the seed has no historical deeds,
 *  so a chain-break rule would flag all lineages. See data/DATA_README.md. */
export const NOT_EVALUABLE = new Set(['chain_break_SA_to_RS_no_link_deed']);

export function evaluate(reg: Registry, alerts: Alert[]) {
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
  const flagged = new Set(alerts.filter((a) => a.severity !== 'info').map((a) => a.record));
  const fp = [...flagged].filter((id) => !labelled.has(id));
  return {
    labelled_anomalies: rows.length, evaluable: ev.length, detected: tp, recall: +(tp / ev.length).toFixed(3),
    deeds_total: reg.deeds.length, deeds_flagged: flagged.size, false_positive_deeds: fp,
    precision_on_deeds: +(1 - fp.length / flagged.size).toFixed(3), per_anomaly: rows,
  };
}
