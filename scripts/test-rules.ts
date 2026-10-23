// Usage: node scripts/test-rules.ts   (Node >= 22.18)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze, parseShare } from '../src/engine/rules.ts';
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

// ---- messy but innocent, and unreadable input (built on a parcel that has no deeds in the seed) ----
const lineageByPlot = new Map(reg.khatians.map((k) => [`${k.mouza_id}|${k.survey}|${k.plot_no}`, k.lineage]));
const usedLineages = new Set(reg.deeds.map((d) => lineageByPlot.get(`${d.mouza_id}|${d.schedule_survey}|${d.schedule_plot_no}`)));
const free = reg.parcel_lineages.find((p) => !usedLineages.has(p.lineage) && K.get(p.bs)!.land_class !== 'khas')!;
const fbs = K.get(free.bs)!;
const owner = fbs.owners[0];
const A = parseShare(owner.share) * free.area_dec; // what this owner holds, in decimals
let n = 0;
const mk = (o: Record<string, unknown>) => ({
  deed_uid: `T${++n}`, deed_no: `T-${n}`, registration_date: '2026-10-01', sub_registry: 'test', mouza_id: free.mouza_id,
  seller: owner.name, seller_party_id: owner.party_id, buyer: 'B', buyer_party_id: 'P-B', schedule_survey: 'BS', schedule_plot_no: fbs.plot_no,
  area_sold_dec: 1, share_sold: 'n/a', qr_valid: true, signature_consistent: true, ...o,
});
const mut = (deed: string, status: 'approved' | 'pending' | 'rejected') => ({
  mutation_case: `M-${deed}`, deed_uid: deed, status, applied_on: '2026-10-02', decided_on: status === 'pending' ? null : '2026-10-09',
  area_mutated_dec: status === 'approved' ? 1 : null, note: status === 'rejected' ? 'test' : '',
});
const run = (deeds: ReturnType<typeof mk>[], muts: ReturnType<typeof mut>[] = []) =>
  analyze({ ...reg, deeds: [...reg.deeds, ...deeds] as Registry['deeds'], mutations: [...reg.mutations, ...muts] }, '2026-10-17');
const got = (a: ReturnType<typeof run>, uid: string) => a.filter((x) => x.record === uid).map((x) => `${x.rule}:${x.severity}`).sort();

// resale before mutation: A sells to B, B resells (mutation of the first sale not decided yet) -> Review, not Hold
{
  const d1 = mk({ buyer: 'Buyer X', buyer_party_id: 'P-BX', area_sold_dec: A / 2 });
  const d2 = mk({ seller: 'Buyer X', seller_party_id: 'P-BX', buyer: 'Buyer Y', buyer_party_id: 'P-BY', area_sold_dec: A / 4, registration_date: '2026-10-10' });
  const a = run([d1, d2], [mut(d1.deed_uid, 'pending')]);
  assert.deepEqual(got(a, d2.deed_uid).filter((x) => x.startsWith('SELLER')), ['SELLER_NOT_RECORDED_OWNER:review'], 'resale before mutation is a review');
  assert.equal(a.find((x) => x.record === d2.deed_uid && x.rule === 'SELLER_NOT_RECORDED_OWNER')!.params.via, d1.deed_no);
  console.log('ok   resale before mutation -> review');
  // ... but reselling more than was bought is still a hold
  const d3 = mk({ seller: 'Buyer X', seller_party_id: 'P-BX', buyer: 'Buyer Y', buyer_party_id: 'P-BY', area_sold_dec: A, registration_date: '2026-10-10' });
  assert.ok(got(run([d1, d3], [mut(d1.deed_uid, 'pending')]), d3.deed_uid).includes('SELLER_NOT_RECORDED_OWNER:block'), 'resale of more than was bought is held');
  // ... and so is a resale when the buyer's own mutation was rejected, or when nobody ever sold to them
  assert.ok(got(run([d1, d2], [mut(d1.deed_uid, 'rejected')]), d2.deed_uid).includes('SELLER_NOT_RECORDED_OWNER:block'), 'rejected purchase is held');
  const stranger = mk({ seller: 'Nobody', seller_party_id: 'P-NOBODY', area_sold_dec: 1 });
  assert.ok(got(run([stranger]), stranger.deed_uid).includes('SELLER_NOT_RECORDED_OWNER:block'), 'unknown seller is held');
  console.log('ok   resale limits: over-resale, rejected purchase, stranger -> hold');
}

// a rejected mutation does not cancel a registered deed: the second sale is still an overlapping sale
{
  const d1 = mk({ area_sold_dec: A * 0.9, registration_date: '2026-09-01' });
  const d2 = mk({ area_sold_dec: A * 0.9, registration_date: '2026-10-05' });
  const withRejected = got(run([d1, d2], [mut(d1.deed_uid, 'rejected')]), d2.deed_uid);
  assert.ok(withRejected.includes('OVERLAPPING_SALE:block'), 'overlap survives a rejected mutation');
  const r = run([d1, d2], [mut(d1.deed_uid, 'rejected')]).find((x) => x.record === d2.deed_uid && x.rule === 'OVERLAPPING_SALE')!;
  assert.equal(r.params.rejected, d1.deed_no);
  assert.ok(got(run([d1, d2]), d2.deed_uid).includes('OVERLAPPING_SALE:block'), 'and it fires the same way with no mutation case');
  console.log('ok   rejected mutation still counts as sold');
}

// two honest sales that fit inside what the seller owns stay clear
{
  const d1 = mk({ area_sold_dec: A * 0.3, registration_date: '2026-09-01' });
  const d2 = mk({ area_sold_dec: A * 0.3, registration_date: '2026-10-05' });
  const a = run([d1, d2], [mut(d1.deed_uid, 'approved'), mut(d2.deed_uid, 'pending')]);
  assert.ok(!a.some((x) => x.record === d2.deed_uid && x.severity !== 'info'), 'two small sales are clear');
  console.log('ok   two honest sales stay clear');
}

// input gate: unreadable input is never clear
{
  const flagged = (d: ReturnType<typeof mk>, rule = 'DATA_NOT_VERIFIABLE') => got(run([d]), d.deed_uid).includes(`${rule}:review`);
  assert.ok(flagged(mk({ schedule_plot_no: '99999' })), 'unknown plot');
  assert.deepEqual(got(run([mk({ schedule_plot_no: '99999', deed_uid: 'G1' })]), 'G1'), ['DATA_NOT_VERIFIABLE:review'], 'unknown plot stops the other checks');
  assert.ok(flagged(mk({ area_sold_dec: -5 })), 'negative area');
  assert.ok(flagged(mk({ area_sold_dec: 0 })), 'zero area');
  assert.ok(flagged(mk({ area_sold_dec: Number.NaN })), 'NaN area');
  assert.ok(flagged(mk({ registration_date: 'garbage' })), 'invalid date');
  assert.ok(flagged(mk({ registration_date: '' })), 'empty date');
  assert.ok(flagged(mk({ registration_date: '2030-01-01' })), 'date after the check date');
  const x = mk({ deed_no: 'DUP-1' }), y = mk({ deed_no: 'DUP-1' });
  assert.ok(got(run([x, y]), y.deed_uid).includes('DATA_NOT_VERIFIABLE:review'), 'duplicate deed number');
  const ok = mk({ area_sold_dec: 1 });
  assert.ok(!got(run([ok]), ok.deed_uid).some((r) => r.startsWith('DATA_NOT_VERIFIABLE')), 'a normal deed passes the gate');
  assert.ok(!analyze(reg, '2026-10-17').some((a) => a.rule === 'DATA_NOT_VERIFIABLE'), 'the seed raises no input alerts');
  console.log('ok   input gate: unknown plot, bad area, bad date, future date, duplicate number');
}
console.log('all tests passed');
