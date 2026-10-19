// Usage: node scripts/test-report.ts   (Node >= 22.18)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze } from '../src/engine/rules.ts';
import type { Registry } from '../src/engine/types.ts';
import { checkReportHtml, checkReportJson, parcelReportHtml, type ReportInput } from '../src/lib/report.ts';
import { PRE_REG, checkRows, passedCount, reportId, toCsv, worstOf } from '../src/lib/summary.ts';

const reg: Registry & { mouzas: { mouza_id: string; name: string; upazila: string; district: string }[] } = JSON.parse(readFileSync(new URL('../data/seed_registry.json', import.meta.url), 'utf8'));
const alerts = analyze(reg, '2026-10-17');

// 1. checkRows: a flagged rule is "flag", every other pre-registration check "pass"
const dbl = alerts.filter((a) => a.rule === 'OVERLAPPING_SALE');
assert.ok(dbl.length > 0, 'seed has a double sale');
const rows = checkRows(dbl);
assert.equal(rows.length, PRE_REG.length);
assert.equal(rows.find((r) => r.rule === 'OVERLAPPING_SALE')?.status, 'flag');
assert.equal(passedCount(rows), PRE_REG.length - 1);
assert.equal(worstOf(dbl), 'block');
assert.equal(worstOf([]), null);
assert.equal(passedCount(checkRows([])), PRE_REG.length);
console.log('ok   check rows, passed count, worst severity');

// 2. report id: stable for the same inputs, different for different inputs, readable shape
const a = reportId(['L06', 'owner:0', '30', '2026-10-17', '', true, true, '2026-10-17']);
assert.equal(a, reportId(['L06', 'owner:0', '30', '2026-10-17', '', true, true, '2026-10-17']));
assert.notEqual(a, reportId(['L06', 'owner:0', '31', '2026-10-17', '', true, true, '2026-10-17']));
assert.match(a, /^ARDH-[0-9A-F]{8}$/);
console.log('ok   report id is stable and distinct');

// 3. CSV: BOM, quoting, Bangla survives
const csv = toCsv([['a', 'b,c', 'he said "hi"'], ['দলিল', 'x\ny', 1]]);
assert.ok(csv.startsWith('﻿'));
assert.ok(csv.includes('"b,c"') && csv.includes('"he said ""hi"""') && csv.includes('"x\ny"') && csv.includes('দলিল'));
console.log('ok   csv quoting and Bangla');

// 4. reports
const parcel = reg.parcel_lineages.find((p) => p.lineage === dbl[0].lineage)!;
const kh = (uid: string) => reg.khatians.find((k) => k.khatian_uid === uid)!;
const chain = [parcel.cs, parcel.sa, parcel.rs, parcel.bs].map(kh);
const m = reg.mouzas.find((x) => x.mouza_id === parcel.mouza_id)!;
const otherOwner = chain.at(-1)!.owners[0].name;
const base = (lang: 'bn' | 'en', mode: 'officer' | 'citizen'): ReportInput => ({
  lang, mode, id: 'ARDH-TEST0001', asOf: '2026-10-17', generated: '2026-10-18 10:00',
  parcel: { id: parcel.lineage, mouza: m.name, upazila: m.upazila, district: m.district, area: parcel.area_dec },
  chain, trail: chain.map((k) => ({ survey: k.survey, year: k.survey_year, share: null })),
  seller: { name: '<script>alert(1)</script>', share: null }, buyer: 'Some Buyer', areaSold: 12.5, date: '2026-10-17', qr: true, sig: false, alerts: dbl,
});
for (const lang of ['bn', 'en'] as const) {
  const html = checkReportHtml(base(lang, 'officer'));
  assert.ok(html.startsWith('<!doctype html>') && html.includes(`lang="${lang}"`) && html.includes('ARDH-TEST0001'));
  assert.ok(!html.includes('<script>alert'), 'seller name is escaped');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!/\{\w+\}/.test(html), `unresolved placeholder in ${lang} report`);
  if (lang === 'bn') assert.ok(/[ঀ-৿]/.test(html), 'Bangla report has Bangla text');
  const json = JSON.parse(checkReportJson(base(lang, 'officer')));
  assert.equal(json.report_id, 'ARDH-TEST0001');
  assert.equal(json.checks.length, PRE_REG.length);
  assert.equal(json.verdict.level, 'block');
  assert.ok(json.record_chain.length === 4);
}
// the buyer's report must not carry other people's details
const cit = checkReportHtml(base('en', 'citizen'));
assert.ok(!cit.includes(otherOwner), 'citizen report leaks an owner name');
assert.ok(!cit.includes('Some Buyer'), 'citizen report carries the buyer name');
assert.ok(!/D\d{4}/.test(cit), 'citizen report leaks a deed id');
assert.ok(!JSON.parse(checkReportJson(base('en', 'citizen'))).record_chain);
const parcelHtml = parcelReportHtml({ lang: 'en', generated: 'x', asOf: '2026-10-17', parcel: base('en', 'officer').parcel, chain, deeds: [] });
assert.ok(parcelHtml.includes(`Parcel ${parcel.lineage}`));
console.log('ok   reports build in both languages, escape input, and the buyer report leaks nothing');
console.log('all report tests passed');
