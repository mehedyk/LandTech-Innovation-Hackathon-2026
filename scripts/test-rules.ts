// Usage: node scripts/test-rules.ts   (Node >= 22.18)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze } from '../src/engine/rules.ts';
import type { Registry } from '../src/engine/types.ts';

const reg: Registry = JSON.parse(readFileSync(new URL('../data/seed_registry.json', import.meta.url), 'utf8'));
const K = new Map(reg.khatians.map((k) => [k.khatian_uid, k]));

function newDeed(lineage: string, ownerIdx: number | null, area: number, qr = true, sig = true) {
  const p = reg.parcel_lineages.find((x) => x.lineage === lineage)!;
  const bs = K.get(p.bs)!;
  const o = ownerIdx == null ? undefined : bs.owners[ownerIdx];
  const deed = {
    deed_uid: 'NEW', deed_no: '(new)', registration_date: '2026-10-17', sub_registry: 'test', mouza_id: p.mouza_id,
    seller: o?.name ?? 'Unrecorded', seller_party_id: o?.party_id ?? 'P-X', buyer: 'B', buyer_party_id: 'P-B',
    schedule_survey: 'BS', schedule_plot_no: bs.plot_no, area_sold_dec: area, share_sold: 'n/a', qr_valid: qr, signature_consistent: sig,
  };
  return analyze({ ...reg, deeds: [...reg.deeds, deed] }, '2026-10-17').filter((a) => a.record === 'NEW').map((a) => a.rule);
}

const cases: [string, string[], string[]][] = [
  ['clean sale', newDeed('L06', 0, 30), []],
  ['sold twice', newDeed('L02', 0, 250), ['OVERLAPPING_SALE']],
  ['share overrun', newDeed('L17', 0, 50), ['SHARE_OVERRUN']],
  ['seller not on record', newDeed('L17', null, 10), ['SELLER_NOT_RECORDED_OWNER']],
  ['khas land', newDeed('L20', null, 50), ['KHAS_CONFLICT']],
  ['forged qr', newDeed('L17', 0, 30, false, false), ['INVALID_QR_OR_SIGNATURE']],
];
for (const [name, got, want] of cases) { assert.deepEqual(got, want, name); console.log('ok  ', name); }

// planted anomalies in the seed must each raise an alert on their records
const alerts = analyze(reg, '2026-10-17');
const must: Record<string, string> = { L03: 'MUTATION_AREA_MISMATCH', L05: 'OVERLAPPING_SALE', L12: 'SHARE_OVERRUN', L14: 'REGISTERED_NOT_MUTATED', L20: 'KHAS_CONFLICT', L22: 'INVALID_QR_OR_SIGNATURE' };
for (const [lineage, rule] of Object.entries(must)) {
  assert.ok(alerts.some((a) => a.lineage === lineage && a.rule === rule), `${lineage} ${rule}`);
  console.log('ok  ', lineage, rule);
}
console.log('all tests passed');
