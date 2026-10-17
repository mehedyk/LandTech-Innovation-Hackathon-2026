import { useEffect, useRef, useState } from 'react';
import ChainStrip from '../components/ChainStrip.tsx';
import { PageTitle, SeverityChip, tone, link } from '../components/ui.tsx';
import { analyze } from '../engine/rules.ts';
import type { Alert, Deed } from '../engine/types.ts';
import { AS_OF, RULES, chainOf, khatianByUid, parcelOf, seed, mouzaOf } from '../lib/registry.ts';

type Params = { lineage: string; seller: string; area: string; date: string; qr: boolean; sig: boolean; buyer: string };
const start: Params = { lineage: 'L06', seller: 'owner:0', area: '30', date: AS_OF, qr: true, sig: true, buyer: 'Demo Buyer' };

const EXAMPLES: { label: string; p: Partial<Params> }[] = [
  { label: 'Clean sale', p: { lineage: 'L06', seller: 'owner:0', area: '30' } },
  { label: 'Sold twice', p: { lineage: 'L02', seller: 'owner:0', area: '250' } },
  { label: 'Selling more than owned', p: { lineage: 'L17', seller: 'owner:0', area: '50' } },
  { label: 'Seller not on record', p: { lineage: 'L17', seller: 'other', area: '10' } },
  { label: 'Government land', p: { lineage: 'L20', seller: 'other', area: '50' } },
  { label: 'Forged QR', p: { lineage: 'L17', seller: 'owner:0', area: '30', qr: false, sig: false } },
];

function check(p: Params): Alert[] | string {
  const area = Number(p.area);
  if (!(area > 0)) return 'Enter an area above 0 decimals.';
  const parcel = parcelOf(p.lineage);
  if (!parcel) return 'Choose a parcel.';
  const latest = khatianByUid.get(parcel.bs)!;
  const owner = p.seller.startsWith('owner:') ? latest.owners[Number(p.seller.slice(6))] : undefined;
  const deed: Deed = {
    deed_uid: 'NEW-CHECK', deed_no: '(this deed)', registration_date: p.date, sub_registry: 'Demo SRO', mouza_id: parcel.mouza_id,
    seller: owner?.name ?? 'Unrecorded seller', seller_party_id: owner?.party_id ?? 'P-UNRECORDED',
    buyer: p.buyer || 'Buyer', buyer_party_id: 'P-NEW-BUYER', schedule_survey: 'BS', schedule_plot_no: latest.plot_no,
    area_sold_dec: area, share_sold: 'n/a', qr_valid: p.qr, signature_consistent: p.sig,
  };
  return analyze({ ...seed, deeds: [...seed.deeds, deed] }, p.date).filter((a) => a.record === 'NEW-CHECK');
}

export default function Check() {
  const [p, setP] = useState<Params>(start);
  const [result, setResult] = useState<Alert[] | string | null>(() => check(start));
  const [run, setRun] = useState(0);
  const set = (patch: Partial<Params>) => setP((cur) => ({ ...cur, ...patch }));
  const go = (next: Params) => { setResult(check(next)); setRun((n) => n + 1); };
  const owners = chainOf(p.lineage).at(-1)?.owners ?? [];

  const field = 'mt-1 w-full rounded border border-line bg-white px-3 py-2 text-ink';
  return (
    <>
      <PageTitle title="Check a deed before it is registered">
        Enter the deed details. Ardh Guard compares them with the land record chain and tells you whether to hold the deed, review it, or proceed. The officer always makes the final decision.
      </PageTitle>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-ink">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex.label} type="button" className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink hover:border-brand"
              onClick={() => { const next = { ...start, ...ex.p }; setP(next); go(next); }}>
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); go(p); }}>
          <label className="block text-sm font-medium text-ink">Parcel
            <select className={field} value={p.lineage} onChange={(e) => set({ lineage: e.target.value, seller: 'owner:0' })}>
              {seed.parcel_lineages.map((x) => (
                <option key={x.lineage} value={x.lineage}>{x.lineage} · {mouzaOf(x.mouza_id)?.name} · {x.area_dec} dec</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">Seller
            <select className={field} value={p.seller} onChange={(e) => set({ seller: e.target.value })}>
              {owners.map((o, i) => <option key={o.party_id} value={`owner:${i}`}>{o.name} ({o.share} on record)</option>)}
              <option value="other">Someone not on the record</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">Buyer
            <input className={field} value={p.buyer} onChange={(e) => set({ buyer: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-ink">Area sold (decimals)
              <input className={field} inputMode="decimal" value={p.area} onChange={(e) => set({ area: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-ink">Deed date
              <input className={field} type="date" value={p.date} onChange={(e) => set({ date: e.target.value })} />
            </label>
          </div>
          <fieldset className="space-y-2 text-sm text-ink">
            <legend className="font-medium">Document checks</legend>
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.qr} onChange={(e) => set({ qr: e.target.checked })} /> QR code verifies</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.sig} onChange={(e) => set({ sig: e.target.checked })} /> Signature matches the earlier record</label>
          </fieldset>
          <button className="w-full rounded bg-brand px-4 py-2.5 font-semibold text-white hover:bg-ink" type="submit">Check deed</button>
        </form>

        <div className="min-w-0 space-y-8">
          {typeof result === 'string' && <p role="alert" className="rounded border border-danger bg-danger-soft p-3 text-danger">{result}</p>}
          {Array.isArray(result) && <Verdict key={run} alerts={result} focus={run > 0} />}
          <ChainStrip lineage={p.lineage} />
        </div>
      </div>
    </>
  );
}

function Verdict({ alerts, focus }: { alerts: Alert[]; focus: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { if (focus) ref.current?.scrollIntoView({ block: 'nearest' }); }, [focus]);
  const worst = alerts.some((a) => a.severity === 'block') ? 'block' : alerts.some((a) => a.severity === 'review') ? 'review' : null;
  const head = worst === 'block' ? 'Hold this deed' : worst === 'review' ? 'Send this deed to review' : 'No conflicts found';
  const sub = worst
    ? `Ardh Guard found ${alerts.length} ${alerts.length === 1 ? 'issue' : 'issues'}. An officer decides what happens next.`
    : 'The deed matches the latest record. This is a check against the data we hold, not a guarantee of title.';
  const panel = worst ? tone[worst].panel : 'bg-brand-soft border-brand';
  return (
    <section ref={ref} className={`verdict-in rounded border-l-8 p-4 ${panel}`} aria-live="polite">
      <h2 className="text-xl font-semibold">{head}</h2>
      <p className="mt-1 text-sm">{sub}</p>
      {alerts.length > 0 && (
        <ul className="mt-4 space-y-3">
          {alerts.map((a) => (
            <li key={a.rule} className="rounded bg-white/80 p-3">
              <p className="flex flex-wrap items-center gap-2"><SeverityChip severity={a.severity} /> <b className="text-ink">{RULES[a.rule].title}</b></p>
              <p className="mt-1">{a.message}</p>
              <p className="mt-1 text-sm">
                {a.evidence.filter((e) => e !== 'NEW-CHECK').length > 0 && <>Evidence: {a.evidence.filter((e) => e !== 'NEW-CHECK').join(', ')} · </>}
                <a className={link} href={`#/cases/${a.lineage}`}>Open parcel {a.lineage}</a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
