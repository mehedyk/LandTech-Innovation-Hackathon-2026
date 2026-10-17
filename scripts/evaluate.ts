// Usage: node scripts/evaluate.ts   (Node >= 22.18, no dependencies)
import { readFileSync, writeFileSync } from 'node:fs';
import { analyze } from '../src/engine/rules.ts';
import { evaluate } from '../src/engine/evaluate.ts';
import type { Registry } from '../src/engine/types.ts';

const reg: Registry = JSON.parse(readFileSync(new URL('../data/seed_registry.json', import.meta.url), 'utf8'));
const alerts = analyze(reg);
const out = evaluate(reg, alerts);
writeFileSync(new URL('../data/eval_results.json', import.meta.url), JSON.stringify({ ...out, alerts }, null, 2));
console.table(out.per_anomaly.map((r) => ({ ...r, rules: r.rules.join(', ') })));
console.log({ recall: out.recall, precision_on_deeds: out.precision_on_deeds, deeds_flagged: out.deeds_flagged, of: out.deeds_total, false_positive_deeds: out.false_positive_deeds });
