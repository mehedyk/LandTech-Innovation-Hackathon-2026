import geoJson from '../../data/parcel_geometry.json';
import identJson from '../../data/identity_demo.json';

export type Pt = [number, number];
export type ParcelGeo = { mouza_id: string; rs: Pt[]; bs: Pt[]; label: Pt };
export type MouzaGeo = { road: { x: number; y: number; w: number; h: number } };
export const SHEET = (geoJson as unknown as { _meta: { sheet: { w: number; h: number } } })._meta.sheet;
const parcels = (geoJson as unknown as { parcels: Record<string, ParcelGeo> }).parcels;
const mouzas = (geoJson as unknown as { mouzas: Record<string, MouzaGeo> }).mouzas;

export const geoOf = (lineage: string): ParcelGeo | undefined => parcels[lineage];
export const roadOf = (mouzaId: string) => mouzas[mouzaId]?.road;
export const neighboursOf = (lineage: string): [string, ParcelGeo][] => {
  const g = parcels[lineage];
  return g ? Object.entries(parcels).filter(([id, p]) => id !== lineage && p.mouza_id === g.mouza_id) : [];
};
/** Outline data for the downloadable reports. Neighbour ids are included only when `withIds` is true (officer report). */
export const reportMapOf = (lineage: string, withIds: boolean) => {
  const g = parcels[lineage];
  if (!g) return undefined;
  return {
    sheet: SHEET, road: roadOf(g.mouza_id), rs: g.rs, bs: g.bs, label: g.label,
    neighbours: neighboursOf(lineage).map(([id, n]) => ({ ...(withIds ? { id } : {}), rs: n.rs, label: n.label })),
  };
};
export const points = (pts: Pt[]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

/** Made-up result for the simulated fingerprint step. Not a biometric, not stored anywhere. */
export type IdentityResult = 'matched' | 'mismatch' | 'not_enrolled';
const people = (identJson as unknown as { people: Record<string, IdentityResult> }).people;
export const identityOf = (partyId: string): IdentityResult => people[partyId] ?? 'not_enrolled';
