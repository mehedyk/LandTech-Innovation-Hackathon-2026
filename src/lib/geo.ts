import geoJson from '../../data/parcel_geometry.json';

export type Pt = [number, number];
export type ParcelGeo = { mouza_id: string; rs: Pt[]; bs: Pt[]; label: Pt };
export type View = { x: number; y: number; w: number; h: number };
export const SHEET = (geoJson as unknown as { _meta: { sheet: { w: number; h: number } } })._meta.sheet;
const parcels = (geoJson as unknown as { parcels: Record<string, ParcelGeo> }).parcels;

export const geoOf = (lineage: string): ParcelGeo | undefined => parcels[lineage];

/** A square window on the mouza sheet around one parcel, so the map stays small and zoomed on the plot. */
export const viewOf = (lineage: string): View => {
  const g = parcels[lineage];
  if (!g) return { x: 0, y: 0, w: SHEET.w, h: SHEET.h };
  const xs = [...g.rs, ...g.bs].map((q) => q[0]);
  const ys = [...g.rs, ...g.bs].map((q) => q[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const size = Math.min(SHEET.h, Math.max(50, Math.max(maxX - minX, maxY - minY) * 1.8 + 6));
  const clamp = (v: number, hi: number) => Math.min(Math.max(v, 0), hi - size);
  return { x: clamp((minX + maxX) / 2 - size / 2, SHEET.w), y: clamp((minY + maxY) / 2 - size / 2, SHEET.h), w: size, h: size };
};
export const inView = (v: View, pts: Pt[]) => pts.some(([x, y]) => x >= v.x && x <= v.x + v.w && y >= v.y && y <= v.y + v.h);
export const neighboursOf = (lineage: string): [string, ParcelGeo][] => {
  const g = parcels[lineage];
  return g ? Object.entries(parcels).filter(([id, p]) => id !== lineage && p.mouza_id === g.mouza_id) : [];
};
/** Outline data for the downloadable reports. Neighbour ids are included only when `withIds` is true (officer report). */
export const reportMapOf = (lineage: string, withIds: boolean) => {
  const g = parcels[lineage];
  if (!g) return undefined;
  return {
    view: viewOf(lineage), rs: g.rs, bs: g.bs, label: g.label,
    neighbours: neighboursOf(lineage).filter(([, n]) => inView(viewOf(lineage), n.rs)).map(([id, n]) => ({ ...(withIds ? { id } : {}), rs: n.rs, label: n.label })),
  };
};
export const points = (pts: Pt[]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

