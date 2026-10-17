import { analyze } from '../engine/rules.ts';
import type { Alert, Deed } from '../engine/types.ts';
import { AS_OF, khatianByUid, parcelOf, seed } from './registry.ts';

export type Params = { lineage: string; seller: string; area: string; date: string; qr: boolean; sig: boolean; buyer: string };
export const startParams: Params = { lineage: 'L06', seller: 'owner:0', area: '30', date: AS_OF, qr: true, sig: true, buyer: '' };

export type CheckResult = { ok: true; alerts: Alert[] } | { ok: false; error: 'area' | 'parcel' };

/** Runs the engine on a hypothetical new deed. `seller` is `owner:<index>` (latest-record owner) or `other` (not on record). */
export function runCheck(p: Params, buyerFallback = 'Buyer'): CheckResult {
  const area = Number(p.area);
  if (!(area > 0)) return { ok: false, error: 'area' };
  const parcel = parcelOf(p.lineage);
  if (!parcel) return { ok: false, error: 'parcel' };
  const latest = khatianByUid.get(parcel.bs)!;
  const owner = p.seller.startsWith('owner:') ? latest.owners[Number(p.seller.slice(6))] : undefined;
  const deed: Deed = {
    deed_uid: 'NEW-CHECK', deed_no: '(new)', registration_date: p.date, sub_registry: 'Demo SRO', mouza_id: parcel.mouza_id,
    seller: owner?.name ?? 'Unrecorded seller', seller_party_id: owner?.party_id ?? 'P-UNRECORDED',
    buyer: p.buyer || buyerFallback, buyer_party_id: 'P-NEW-BUYER', schedule_survey: 'BS', schedule_plot_no: latest.plot_no,
    area_sold_dec: area, share_sold: 'n/a', qr_valid: p.qr, signature_consistent: p.sig,
  };
  return { ok: true, alerts: analyze({ ...seed, deeds: [...seed.deeds, deed] }, p.date).filter((a) => a.record === 'NEW-CHECK') };
}

/** Matches a typed seller name to an owner in the latest record (case-insensitive). Returns `owner:<i>` or `other`. */
export function sellerFromName(lineage: string, name: string): string {
  const parcel = parcelOf(lineage);
  const latest = parcel ? khatianByUid.get(parcel.bs) : undefined;
  const i = latest?.owners.findIndex((o) => o.name.trim().toLowerCase() === name.trim().toLowerCase()) ?? -1;
  return i >= 0 ? `owner:${i}` : 'other';
}
