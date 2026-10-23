import type { Alert, Checkpoint, Deed, Khatian, Registry, RuleId, Severity } from './types.ts';

const TOL = 0.005;       // 0.5% tolerance on area comparisons
const STALE_DAYS = 180;  // a deed with no mutation after this long is "stale"

export const parseShare = (s: string): number => {
  if (s === 'full') return 1;
  const [a, b] = s.split('/').map(Number);
  return b ? a / b : a;
};
const days = (a: string, b: string) => (Date.parse(a) - Date.parse(b)) / 86_400_000;

/**
 * Pure function: registry in, explainable alerts out.
 * It never decides ownership. It only flags a case for a human officer, with reasons.
 */
export function analyze(reg: Registry, asOf = '2026-10-17'): Alert[] {
  const kByUid = new Map(reg.khatians.map((k) => [k.khatian_uid, k]));
  const lineageOfPlot = new Map<string, string>();
  for (const k of reg.khatians) lineageOfPlot.set(`${k.mouza_id}|${k.survey}|${k.plot_no}`, k.lineage);
  const parcel = new Map(reg.parcel_lineages.map((p) => [p.lineage, p]));
  const mutsOf = (d: string) => reg.mutations.filter((m) => m.deed_uid === d);
  const lineageOfDeed = (e: Deed) => lineageOfPlot.get(`${e.mouza_id}|${e.schedule_survey}|${e.schedule_plot_no}`);
  const alerts: Alert[] = [];
  const add = (rule: RuleId, severity: Severity, checkpoint: Checkpoint, d: Deed, lineage: string,
               message: string, evidence: string[] = [], params: Record<string, string | number> = {}) =>
    alerts.push({ rule, severity, checkpoint, record: d.deed_uid, lineage, message, evidence: [d.deed_uid, ...evidence], params });

  const deeds = [...reg.deeds].sort((a, b) => a.registration_date.localeCompare(b.registration_date));
  for (const d of deeds) {
    const lineage = lineageOfDeed(d);

    // 0. Input gate: a deed we cannot read properly is never reported as clear. It goes to an officer as "not verified".
    //    Hard problems (unknown plot, unusable area, unusable date) stop the other checks, because their results would mean nothing.
    //    Soft problems (a date after the check date, a deed number already in use) are added, and the other checks still run.
    const badArea = !Number.isFinite(d.area_sold_dec) || d.area_sold_dec <= 0;
    const badDate = Number.isNaN(Date.parse(d.registration_date));
    const gate = {
      plot: !lineage, area: badArea, date: badDate,
      future: !badDate && days(d.registration_date, asOf) > 0,
      dup: reg.deeds.some((e) => e.deed_uid !== d.deed_uid && e.deed_no === d.deed_no && e.sub_registry === d.sub_registry),
    };
    if (Object.values(gate).some(Boolean))
      add('DATA_NOT_VERIFIABLE', 'review', 'pre-registration', d, lineage ?? '',
        `Deed ${d.deed_no} could not be fully verified: ${[
          gate.plot && 'its plot is not in the record', gate.area && 'the area sold is not a positive number',
          gate.date && 'the registration date is missing or invalid', gate.future && 'the registration date is after the check date',
          gate.dup && 'another deed already uses this deed number'].filter(Boolean).join('; ')}. Treat it as not checked.`, [],
        { deed: d.deed_no, plot: +gate.plot, area: +gate.area, date: +gate.date, future: +gate.future, dup: +gate.dup });
    if (!lineage || badArea || badDate) continue;
    const p = parcel.get(lineage)!;
    const latest = kByUid.get(p.bs) as Khatian;  // most recent survey record = recorded owners
    const muts = mutsOf(d.deed_uid);

    // 1. Authenticity (P2-style): QR and signature
    if (!d.qr_valid || !d.signature_consistent) {
      const parts = [!d.qr_valid && 'QR code does not verify', !d.signature_consistent && 'signature is inconsistent with the earlier record'];
      add('INVALID_QR_OR_SIGNATURE', 'block', 'pre-registration', d, lineage, `Deed ${d.deed_no}: ${parts.filter(Boolean).join(' and ')}.`, [],
        { deed: d.deed_no, qr: d.qr_valid ? 0 : 1, sig: d.signature_consistent ? 0 : 1 });
    }

    // 2. Khas / government land
    const govt = latest.land_class === 'khas' || latest.owners.some((o) => /government|khas/i.test(o.name));
    if (govt)
      add('KHAS_CONFLICT', 'block', 'pre-registration', d, lineage,
        `Latest record (${latest.khatian_uid}, ${latest.survey}) shows this plot as khas/government land, but ${d.seller} is selling it.`, [latest.khatian_uid],
        { khatian: latest.khatian_uid, survey: latest.survey, seller: d.seller });

    // 3. Seller must appear in the latest record
    const holder = latest.owners.find((o) => o.party_id === d.seller_party_id);
    if (!govt && !holder) {
      // Resale before mutation: the seller bought this parcel from a recorded owner and that mutation is still open
      // (no case yet, or only pending cases). The record has not caught up, so this is a Review, not a Hold, as long as
      // the seller does not resell more than they bought. One hop only: a longer chain of unmutated sales is held.
      const bought = deeds.filter((e) =>
        e.deed_uid !== d.deed_uid && e.buyer_party_id === d.seller_party_id && e.registration_date <= d.registration_date &&
        lineageOfDeed(e) === lineage && latest.owners.some((o) => o.party_id === e.seller_party_id) &&
        mutsOf(e.deed_uid).every((m) => m.status === 'pending'));
      const resold = deeds.filter((e) =>
        e.deed_uid !== d.deed_uid && e.seller_party_id === d.seller_party_id && e.registration_date <= d.registration_date && lineageOfDeed(e) === lineage);
      const boughtArea = bought.reduce((s, e) => s + e.area_sold_dec, 0);
      const soldArea = resold.reduce((s, e) => s + e.area_sold_dec, 0) + d.area_sold_dec;
      if (bought.length && soldArea <= boughtArea * (1 + TOL))
        add('SELLER_NOT_RECORDED_OWNER', 'review', 'pre-registration', d, lineage,
          `${d.seller} is not yet in the latest khatian ${latest.khatian_uid}, but bought this parcel in ${bought.map((e) => e.deed_no).join(', ')} and that mutation is still open. Check that deed and its mutation before registering.`,
          [latest.khatian_uid, ...bought.map((e) => e.deed_uid)],
          { seller: d.seller, khatian: latest.khatian_uid, via: bought.map((e) => e.deed_no).join(', ') });
      else
        add('SELLER_NOT_RECORDED_OWNER', 'block', 'pre-registration', d, lineage,
          `${d.seller} is not an owner in the latest khatian ${latest.khatian_uid}.`, [latest.khatian_uid],
          { seller: d.seller, khatian: latest.khatian_uid });
    }

    if (holder && !govt) {
      const heldArea = parseShare(holder.share) * p.area_dec;

      // 4. Claim larger than the seller's recorded share
      if (d.area_sold_dec > heldArea * (1 + TOL))
        add('SHARE_OVERRUN', 'block', 'pre-registration', d, lineage,
          `${d.seller} holds ${holder.share} (${heldArea.toFixed(2)} dec) in ${latest.khatian_uid} but this deed sells ${d.area_sold_dec} dec.`, [latest.khatian_uid],
          { seller: d.seller, share: holder.share, held: +heldArea.toFixed(2), sold: d.area_sold_dec, khatian: latest.khatian_uid });

      // 5. Same seller, same parcel: cumulative sales exceed the holding (double sale / overlap)
      const earlier = deeds.filter((e) =>
        e.deed_uid !== d.deed_uid && e.seller_party_id === d.seller_party_id &&
        e.registration_date <= d.registration_date && lineageOfDeed(e) === lineage);
      // A registered deed stands even if its mutation was rejected (registration and mutation are separate steps),
      // so it still counts as sold. The alert names those deeds so the officer can weigh them.
      const rejectedOnly = earlier.filter((e) => mutsOf(e.deed_uid).length > 0 && mutsOf(e.deed_uid).every((m) => m.status === 'rejected'));
      const prior = earlier.reduce((s, e) => s + e.area_sold_dec, 0);
      if (earlier.length && prior + d.area_sold_dec > heldArea * (1 + TOL))
        add('OVERLAPPING_SALE', 'block', 'pre-registration', d, lineage,
          `${d.seller} already sold ${prior.toFixed(2)} dec of this parcel (${earlier.map((e) => e.deed_no).join(', ')}); with this deed the total is ${(prior + d.area_sold_dec).toFixed(2)} dec, above the ${heldArea.toFixed(2)} dec on record.${rejectedOnly.length ? ` The mutation of ${rejectedOnly.map((e) => e.deed_no).join(', ')} was rejected, but a rejected mutation does not cancel a registered deed.` : ''}`,
          earlier.map((e) => e.deed_uid),
          { seller: d.seller, prior: +prior.toFixed(2), total: +(prior + d.area_sold_dec).toFixed(2), held: +heldArea.toFixed(2), deeds: earlier.map((e) => e.deed_no).join(', '), rejected: rejectedOnly.map((e) => e.deed_no).join(', ') });
    }

    // 6. Mutation checkpoint: mutated area vs deed area
    for (const m of muts)
      if (m.status === 'approved' && m.area_mutated_dec != null && Math.abs(m.area_mutated_dec - d.area_sold_dec) > d.area_sold_dec * 0.02)
        add('MUTATION_AREA_MISMATCH', 'review', 'pre-mutation', d, lineage,
          `Mutation ${m.mutation_case} changed ${m.area_mutated_dec} dec but the deed transfers ${d.area_sold_dec} dec.`, [m.mutation_case],
          { mutation: m.mutation_case, mutated: m.area_mutated_dec, sold: d.area_sold_dec });

    // 7. Workflow signals (not fraud by themselves)
    if (!muts.length && days(asOf, d.registration_date) > STALE_DAYS)
      add('REGISTERED_NOT_MUTATED', 'review', 'pre-mutation', d, lineage,
        `Registered ${Math.round(days(asOf, d.registration_date))} days ago with no mutation case; the record of rights still shows the old owner.`, [],
        { days: Math.round(days(asOf, d.registration_date)) });
    const rej = muts.find((m) => m.status === 'rejected');
    if (rej && muts.some((m) => m.status === 'pending'))
      add('REJECTED_THEN_RESUBMITTED', 'info', 'pre-mutation', d, lineage, `Mutation was rejected (${rej.note}) and has been resubmitted.`, [], { reason: rej.note });
  }
  return alerts;
}
