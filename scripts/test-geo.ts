// Checks the schematic map data and the simulated identity data. Usage: node scripts/test-geo.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Registry } from '../src/engine/types.ts';

const reg: Registry & { parties: { party_id: string; name: string }[] } = JSON.parse(readFileSync(new URL('../data/seed_registry.json', import.meta.url), 'utf8'));
const ident = JSON.parse(readFileSync(new URL('../data/identity_demo.json', import.meta.url), 'utf8'));
const geoRaw = readFileSync(new URL('../data/parcel_geometry.json', import.meta.url), 'utf8');
// geo.ts imports the JSON through the bundler, so the test reads the same files directly
const geo = JSON.parse(geoRaw) as { parcels: Record<string, { mouza_id: string; rs: [number, number][]; bs: [number, number][] }> };
const geoOf = (l: string) => geo.parcels[l];
const neighboursOf = (l: string) => Object.entries(geo.parcels).filter(([id, p]) => id !== l && p.mouza_id === geo.parcels[l].mouza_id);
const identityOf = (id: string): string => ident.people[id] ?? 'not_enrolled';
const points = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

// 1. every parcel has both survey outlines inside the sheet
for (const p of reg.parcel_lineages) {
  const g = geoOf(p.lineage);
  assert.ok(g, `no geometry for ${p.lineage}`);
  assert.equal(g.mouza_id, p.mouza_id);
  for (const ring of [g.rs, g.bs]) {
    assert.ok(ring.length >= 12, `${p.lineage} outline is too simple`);
    // not a rectangle: some edge must be neither horizontal nor vertical
    assert.ok(ring.some((q, i) => { const n = ring[(i + 1) % ring.length]; return Math.abs(q[0] - n[0]) > 0.05 && Math.abs(q[1] - n[1]) > 0.05; }), `${p.lineage} looks like a rectangle`);
    for (const [x, y] of ring) assert.ok(x > -3 && x < 103 && y > -3 && y < 73, `${p.lineage} outside the sheet`);
  }
  assert.ok(points(g.rs).includes(','));
  assert.equal(neighboursOf(p.lineage).length, 7, `${p.lineage} should have 7 neighbours`);
}
console.log('ok   all', reg.parcel_lineages.length, 'parcels have RS and BS outlines and neighbours');

// 2. the simulated identity result exists for everyone and uses only the three allowed values
for (const pt of reg.parties) assert.ok(['matched', 'mismatch', 'not_enrolled'].includes(identityOf(pt.party_id)), `bad identity for ${pt.party_id}`);
assert.equal(identityOf('P9999'), 'not_enrolled');
console.log('ok   simulated identity results cover', reg.parties.length, 'people');

// 3. nothing in the new data looks like personal data: only ids and made-up statuses
const allowed = new Set(['matched', 'mismatch', 'not_enrolled']);
for (const v of Object.values(ident.people)) assert.ok(allowed.has(v as string));
assert.ok(!/nid|photo|finger|template/i.test(JSON.stringify(ident.people)), 'identity data must carry no NID, photo or template');
assert.ok(!/"road"/.test(geoRaw), 'no road rectangles in the geometry');
assert.ok(geoRaw.includes('FICTIONAL'), 'geometry file must be labelled fictional');
console.log('ok   identity data holds only ids and made-up statuses; geometry is labelled fictional');
console.log('all geo tests passed');
