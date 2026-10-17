// Usage: node scripts/test-i18n.ts   (Node >= 22.18)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze } from '../src/engine/rules.ts';
import type { Registry, RuleId } from '../src/engine/types.ts';
import { describe, describeCitizen } from '../src/lib/alerts.ts';
import { S, format, toBn } from '../src/lib/strings.ts';

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
const bengali = /[\u0980-\u09FF]/;

// 1. every key has both languages, same placeholders
// 'chip.mut' is only placeholders: its Bangla comes from the status word at runtime
for (const [key, [bn, en]] of Object.entries(S)) {
  assert.ok(bn.trim() && en.trim(), `empty string for ${key}`);
  assert.equal(placeholders(bn), placeholders(en), `placeholders differ for ${key}`);
  assert.ok(bengali.test(bn) || key === 'share.n/a' || key === 'chip.mut', `Bangla text for ${key} has no Bangla letters`);
}
console.log('ok   all', Object.keys(S).length, 'keys have matching Bangla and English');

// 2. coverage: every rule and every seeded anomaly has copy
const reg: Registry = JSON.parse(readFileSync(new URL('../data/seed_registry.json', import.meta.url), 'utf8'));
const rules: RuleId[] = ['INVALID_QR_OR_SIGNATURE', 'SELLER_NOT_RECORDED_OWNER', 'KHAS_CONFLICT', 'SHARE_OVERRUN', 'OVERLAPPING_SALE', 'MUTATION_AREA_MISMATCH', 'REGISTERED_NOT_MUTATED', 'REJECTED_THEN_RESUBMITTED'];
for (const r of rules) for (const k of [`rule.${r}.title`, `rule.${r}.plain`, `msg.${r}`, `how.ex.${r}`]) assert.ok(S[k], `missing ${k}`);
for (const a of new Set(reg.anomaly_labels.map((l) => l.anomaly))) assert.ok(S[`anom.${a}`], `missing anom.${a}`);
console.log('ok   every rule and planted anomaly has copy');

// 3. every real alert renders in both languages with no unresolved placeholder
const alerts = analyze(reg, '2026-10-17');
for (const a of alerts) {
  for (const lang of ['bn', 'en'] as const) {
    const text = describe(a, lang);
    assert.ok(!/\{\w+\}/.test(text), `unresolved placeholder: ${a.rule} ${lang}: ${text}`);
    if (lang === 'bn') assert.ok(bengali.test(text), `no Bangla in ${a.rule}`);
  }
  assert.ok(!/\{\w+\}/.test(describeCitizen(a, 'bn')));
}
console.log('ok   all', alerts.length, 'alerts render in Bangla and English');

// 4. numbers and ids
assert.equal(toBn('2012'), '২০১২');
assert.equal(format('bn', 'cases.row', { id: 'L05', mouza: 'Demo', area: 12.5 }), 'L05 · Demo · ১২.৫ শতাংশ');
assert.equal(format('en', 'cases.row', { id: 'L05', mouza: 'Demo', area: 12.5 }), 'L05 · Demo · 12.5 dec');
// citizen text must not leak names or other people's deed numbers
const leak = alerts.find((a) => a.rule === 'OVERLAPPING_SALE')!;
const cit = describeCitizen(leak, 'en');
assert.ok(!cit.includes(String(leak.params.seller)) && !cit.includes(String(leak.params.deeds)), 'citizen text leaks details');
console.log('ok   digits, ids, citizen privacy');
console.log('all i18n tests passed');
