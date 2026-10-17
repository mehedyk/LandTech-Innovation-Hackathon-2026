import seedJson from '../../data/seed_registry.json';
import { analyze } from '../engine/rules.ts';
import type { Khatian, Registry, RuleId, Severity } from '../engine/types.ts';

export type Mouza = { mouza_id: string; name: string; upazila: string; district: string };
export type Seed = Registry & { mouzas: Mouza[] };

export const seed = seedJson as unknown as Seed;
export const AS_OF = '2026-10-17';

export const khatianByUid = new Map(seed.khatians.map((k) => [k.khatian_uid, k]));
export const deedByUid = new Map(seed.deeds.map((d) => [d.deed_uid, d]));
const plotToLineage = new Map(seed.khatians.map((k) => [`${k.mouza_id}|${k.survey}|${k.plot_no}`, k.lineage]));

export const mouzaOf = (id: string) => seed.mouzas.find((m) => m.mouza_id === id);
export const parcelOf = (lineage: string) => seed.parcel_lineages.find((p) => p.lineage === lineage);
export const chainOf = (lineage: string): Khatian[] => {
  const p = parcelOf(lineage);
  return p ? [p.cs, p.sa, p.rs, p.bs].map((u) => khatianByUid.get(u) as Khatian) : [];
};
export const lineageOfDeed = (d: { mouza_id: string; schedule_survey: string; schedule_plot_no: string }) =>
  plotToLineage.get(`${d.mouza_id}|${d.schedule_survey}|${d.schedule_plot_no}`);
export const mutationsOf = (deedUid: string) => seed.mutations.filter((m) => m.deed_uid === deedUid);

export const baseAlerts = analyze(seed, AS_OF);

export const RULES: Record<RuleId, { title: string; plain: string }> = {
  INVALID_QR_OR_SIGNATURE: { title: 'Document looks altered', plain: 'The QR code or signature does not match the record.' },
  OVERLAPPING_SALE: { title: 'Land sold more than once', plain: 'The same seller has already sold part of this parcel, and the total is more than they own.' },
  SHARE_OVERRUN: { title: 'Selling more than the seller owns', plain: 'The deed claims more land than the seller\u2019s share in the latest record.' },
  KHAS_CONFLICT: { title: 'Government (khas) land', plain: 'The latest record shows this plot as khas or government land.' },
  SELLER_NOT_RECORDED_OWNER: { title: 'Seller is not on the record', plain: 'The seller does not appear as an owner in the latest khatian.' },
  MUTATION_AREA_MISMATCH: { title: 'Mutation does not match the deed', plain: 'The mutation changed a different area than the deed transfers.' },
  REGISTERED_NOT_MUTATED: { title: 'Deed never mutated', plain: 'The deed was registered but the record of rights still shows the old owner.' },
  REJECTED_THEN_RESUBMITTED: { title: 'Mutation resubmitted after rejection', plain: 'A rejected mutation was filed again. Worth a look, not fraud on its own.' },
};
export const SEVERITY: Record<Severity, { label: string; order: number }> = {
  block: { label: 'Hold', order: 0 }, review: { label: 'Review', order: 1 }, info: { label: 'Note', order: 2 },
};
export const CHECKPOINT_LABEL = { 'pre-registration': 'Before registration', 'pre-mutation': 'Before mutation' } as const;
