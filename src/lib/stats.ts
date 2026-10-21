// Numbers for the dashboards. Everything is computed from the registry and the engine's alerts: nothing is invented.
import { evaluate } from '../engine/evaluate.ts';
import type { Alert, Checkpoint, RuleId } from '../engine/types.ts';
import type { Decision } from './decisions.ts';
import { SEVERITY, baseAlerts, chainOf, parcelOf, seed } from './registry.ts';

export const alertKey = (a: Alert) => `${a.record}:${a.rule}`;

export const alertsFor = (cp: Checkpoint | null): Alert[] => (cp ? baseAlerts.filter((a) => a.checkpoint === cp) : baseAlerts);

export function countBy<T>(items: T[], key: (x: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const i of items) out[key(i)] = (out[key(i)] ?? 0) + 1;
  return out;
}

/** Alerts per rule, most frequent first. */
export const byRule = (alerts: Alert[]): { rule: RuleId; n: number; hold: boolean }[] =>
  Object.entries(countBy(alerts, (a) => a.rule))
    .map(([rule, n]) => ({ rule: rule as RuleId, n, hold: alerts.some((a) => a.rule === rule && a.severity === 'block') }))
    .sort((a, b) => b.n - a.n);

/** Not-yet-decided alerts, serious ones first. */
export const queue = (alerts: Alert[], decisions: Record<string, Decision>): Alert[] =>
  alerts
    .filter((a) => !decisions[alertKey(a)])
    .sort((a, b) => SEVERITY[a.severity].order - SEVERITY[b.severity].order || a.lineage.localeCompare(b.lineage));

export const decidedCount = (alerts: Alert[], decisions: Record<string, Decision>) => alerts.filter((a) => decisions[alertKey(a)]).length;

/** Deeds with at least one alert of a given set. */
export const flaggedDeeds = (alerts: Alert[]) => new Set(alerts.filter((a) => a.severity !== 'info').map((a) => a.record)).size;

export const mutationCounts = () => countBy(seed.mutations, (m) => m.status);

export const khasParcels = () => seed.parcel_lineages.filter((p) => chainOf(p.lineage).at(-1)?.land_class === 'khas').length;

/** Serious (hold or review) alerts per mouza. */
export function byMouza(alerts: Alert[]): { mouza: string; n: number; hold: number }[] {
  const rows = new Map<string, { n: number; hold: number }>();
  for (const a of alerts) {
    if (a.severity === 'info') continue;
    const id = parcelOf(a.lineage)?.mouza_id ?? '?';
    const r = rows.get(id) ?? { n: 0, hold: 0 };
    r.n += 1;
    if (a.severity === 'block') r.hold += 1;
    rows.set(id, r);
  }
  return [...rows].map(([mouza, r]) => ({ mouza, ...r })).sort((a, b) => b.n - a.n);
}

export const benchmark = () => evaluate(seed, baseAlerts);
