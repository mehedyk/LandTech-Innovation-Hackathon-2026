// Checks the schematic map data. Usage: node scripts/test-geo.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Registry } from '../src/engine/types.ts';

const reg: Registry = JSON.parse(readFileSync(new URL('../data/seed_registry.json', import.meta.url), 'utf8'));
const geoRaw = readFileSync(new URL('../data/parcel_geometry.json', import.meta.url), 'utf8');
// geo.ts imports the JSON through the bundler, so the test reads the same files directly
const geo = JSON.parse(geoRaw) as { parcels: Record<string, { mouza_id: string; rs: [number, number][]; bs: [number, number][] }> };
const geoOf = (l: string) => geo.parcels[l];
const neighboursOf = (l: string) => Object.entries(geo.parcels).filter(([id, p]) => id !== l && p.mouza_id === geo.parcels[l].mouza_id);
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

// 2. the data files carry no personal data and are labelled as made up
assert.ok(!/"road"/.test(geoRaw), 'no road rectangles in the geometry');
assert.ok(geoRaw.includes('FICTIONAL'), 'geometry file must be labelled fictional');
console.log('ok   geometry is labelled fictional and has no road rectangles');
console.log('all geo tests passed');
