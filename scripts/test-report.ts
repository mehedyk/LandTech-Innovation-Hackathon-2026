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

// 3b. CSV injection (CWE-1236): text cells that start with a formula character get a leading quote; real numbers do not
const inj = toCsv([['=HYPERLINK("http://x","y")', '+1', '-1', '@SUM(A1)', '\tx', 'safe'], [-5, 3]]);
assert.ok(inj.includes(`"'=HYPERLINK(""http://x"",""y"")"`) && inj.includes(",'+1,") && inj.includes(",'-1,") && inj.includes(",'@SUM(A1),") && inj.includes("'\tx"));
assert.ok(inj.includes('safe') && inj.includes('\r\n-5,3'));
console.log('ok   csv formula injection neutralised');

// 3c. saved decisions: bad shapes are dropped, good ones kept
const { sanitize } = await import('../src/lib/decisions.ts');
assert.deepEqual(sanitize(null), {});
assert.deepEqual(sanitize([1, 2]), {});
assert.deepEqual(sanitize('x'), {});
assert.deepEqual(sanitize({ a: 'hold', b: 'nope', c: 5, d: 'escalate' }), { a: 'hold', d: 'escalate' });
console.log('ok   saved decisions are validated');

// 4. reports
const parcel = reg.parcel_lineages.find((p) => p.lineage === dbl[0].lineage)!;
const kh = (uid: string) => reg.khatians.find((k) => k.khatian_uid === uid)!;
const chain = [parcel.cs, parcel.sa, parcel.rs, parcel.bs].map(kh);
const m = reg.mouzas.find((x) => x.mouza_id === parcel.mouza_id)!;
const otherOwner = chain.at(-1)!.owners[0].name;
const base = (lang: 'bn' | 'en', mode: 'officer' | 'citizen'): ReportInput => ({
  lang, mode, id: 'ARDH-TEST0001', asOf: '2026-10-17', generated: '2026-10-18 10:00',
  parcel: { id: parcel.lineage, mouza: m.name, upazila: m.upazila, district: m.district, area: parcel.area_dec },
  chain,
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
// 5. the map in the reports (there is no identity or fingerprint step in the app)
const sq = (x: number, y: number): [number, number][] => [[x, y], [x + 10, y], [x + 10, y + 10], [x, y + 10]];
const withMap = (mode: 'officer' | 'citizen', ids: boolean): ReportInput => ({
  ...base('en', mode),
  map: { view: { x: 0, y: 0, w: 50, h: 50 }, rs: sq(0, 0), bs: sq(0.5, 0.5), label: [5, 5], neighbours: [{ ...(ids ? { id: 'L99' } : {}), rs: sq(20, 0), label: [25, 5] }] },
});
const offMap = checkReportHtml(withMap('officer', true));
assert.ok(offMap.includes('<svg') && offMap.includes('L99') && offMap.includes('Parcel map'), 'officer report has the map with neighbour ids');
const citMap = checkReportHtml(withMap('citizen', false));
assert.ok(citMap.includes('<svg') && !citMap.includes('L99'), 'citizen map has no neighbour ids');
for (const html of [offMap, citMap]) assert.ok(!/fingerprint|biometric|identity check/i.test(html), 'no fingerprint or identity step in any report');
const jOff = JSON.parse(checkReportJson(withMap('officer', true)));
assert.equal(jOff.parcel_map.schematic, true);
assert.ok(!('identity_check_simulated' in jOff), 'no identity step in the JSON report');
const jCit = JSON.parse(checkReportJson(withMap('citizen', false)));
assert.ok(jCit.parcel_map && !JSON.stringify(jCit.parcel_map).includes('L99'));
for (const lang of ['bn', 'en'] as const) assert.ok(!/\{\w+\}/.test(checkReportHtml({ ...withMap('officer', true), lang })));
console.log('ok   reports carry the map; the buyer map has no neighbour ids; no identity step anywhere');
// 6. the buyer report says only "on the current record": no share, no earlier surveys, no other owners
{
  const cit = checkReportHtml({ ...base('en', 'citizen'), seller: { name: 'Typed Name', share: '1/2' }, chain: [] });
  assert.ok(cit.includes('on the current record'), 'citizen report states the seller is on the current record');
  assert.ok(!cit.includes('1/2') && !/CS ·|SA ·|RS ·|BS ·/.test(cit) && !cit.includes('Where this name appears'), 'citizen report carries no share and no survey-by-survey history');
  console.log('ok   buyer report shows only whether the seller is on the current record');
}
console.log('ok   reports build in both languages, escape input, and the buyer report leaks nothing');
// 6. hostile input (regression for the security audit): every name field is escaped, the CSP meta is present,
//    and the font URL cannot break out of the stylesheet
const hostile = [`"><img src=x onerror=alert(1)>`, `'><svg/onload=alert(1)>`, `</style><script>alert(1)</script>`, `</title><script>alert(1)</script>`, `&#60;script&#62;`];
for (const pl of hostile) for (const mode of ['officer', 'citizen'] as const) for (const lang of ['en', 'bn'] as const) {
  const html = checkReportHtml({ ...base(lang, mode), seller: { name: pl, share: null }, buyer: pl, fontUrl: `http://x/f.ttf');}body{background:url(//evil)}/*` });
  assert.ok(html.includes('http-equiv="Content-Security-Policy"') && html.includes("default-src 'none'"), 'report CSP meta missing');
  assert.ok(!/<(img|svg|script)\b[^>]*(onerror|onload|alert)/i.test(html.replace(/<script>[^<]*<\/script>/g, '')), `unescaped: ${pl}`);
  assert.ok(!html.includes('</style><script>') && !html.includes('</title><script>') && !html.includes('//evil'), `breakout: ${pl}`);
  JSON.parse(checkReportJson({ ...base(lang, mode), seller: { name: pl, share: null }, buyer: pl }));
}
assert.ok(checkReportHtml({ ...base('en', 'officer'), fontUrl: 'https://app.example/fonts/Kalpurush.ttf' }).includes("font-src https://app.example;"));
console.log('ok   hostile names and font URL cannot break out of the report; CSP meta present');
console.log('all report tests passed');
