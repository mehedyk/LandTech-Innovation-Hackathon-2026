import { useEffect, useRef, useState } from 'react';
import ChainStrip from '../components/ChainStrip.tsx';
import { PageTitle, SeverityChip, tone, link } from '../components/ui.tsx';
import type { Alert } from '../engine/types.ts';
import { describe, ruleTitle } from '../lib/alerts.ts';
import { runCheck, startParams, type CheckResult, type Params } from '../lib/check.ts';
import { useLang } from '../lib/i18n.tsx';
import { chainOf, mouzaOf, seed } from '../lib/registry.ts';
import { shareText } from '../lib/strings.ts';

const EXAMPLES: { key: string; p: Partial<Params> }[] = [
  { key: 'ex.clean', p: { lineage: 'L06', seller: 'owner:0', area: '30' } },
  { key: 'ex.twice', p: { lineage: 'L02', seller: 'owner:0', area: '250' } },
  { key: 'ex.overrun', p: { lineage: 'L17', seller: 'owner:0', area: '50' } },
  { key: 'ex.notowner', p: { lineage: 'L17', seller: 'other', area: '10' } },
  { key: 'ex.khas', p: { lineage: 'L20', seller: 'other', area: '50' } },
  { key: 'ex.forged', p: { lineage: 'L17', seller: 'owner:0', area: '30', qr: false, sig: false } },
];

export default function Check() {
  const { t, lang } = useLang();
  const [p, setP] = useState<Params>(startParams);
  const [result, setResult] = useState<CheckResult>(() => runCheck(startParams));
  const [run, setRun] = useState(0);
  const set = (patch: Partial<Params>) => setP((cur) => ({ ...cur, ...patch }));
  const go = (next: Params) => { setResult(runCheck(next, lang === 'bn' ? 'ক্রেতা' : 'Buyer')); setRun((n) => n + 1); };
  const owners = chainOf(p.lineage).at(-1)?.owners ?? [];

  const field = 'mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-ink shadow-inner focus:border-brand';
  return (
    <>
      <PageTitle title={t('check.title')}>{t('check.intro')}</PageTitle>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-ink">{t('ex.label')}</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex.key} type="button" className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink hover:border-brand"
              onClick={() => { const next = { ...startParams, ...ex.p }; setP(next); go(next); }}>
              {t(ex.key)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <form className="card h-fit space-y-4 p-5" onSubmit={(e) => { e.preventDefault(); go(p); }}>
          <label className="block text-sm font-medium text-ink">{t('f.parcel')}
            <select className={field} value={p.lineage} onChange={(e) => set({ lineage: e.target.value, seller: 'owner:0' })}>
              {seed.parcel_lineages.map((x) => (
                <option key={x.lineage} value={x.lineage}>{t('cases.row', { id: x.lineage, mouza: mouzaOf(x.mouza_id)?.name ?? '', area: x.area_dec })}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">{t('f.seller')}
            <select className={field} value={p.seller} onChange={(e) => set({ seller: e.target.value })}>
              {owners.map((o, i) => <option key={o.party_id} value={`owner:${i}`}>{t('f.sellerOpt', { name: o.name, share: shareText(lang, o.share) })}</option>)}
              <option value="other">{t('f.sellerOther')}</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">{t('f.buyer')}
            <input className={field} value={p.buyer} placeholder={t('f.buyerPh')} onChange={(e) => set({ buyer: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-ink">{t('f.area')}
              <input className={field} inputMode="decimal" value={p.area} onChange={(e) => set({ area: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-ink">{t('f.date')}
              <input className={field} type="date" value={p.date} onChange={(e) => set({ date: e.target.value })} />
            </label>
          </div>
          <fieldset className="space-y-2 text-sm text-ink">
            <legend className="font-medium">{t('f.docs')}</legend>
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.qr} onChange={(e) => set({ qr: e.target.checked })} /> {t('f.qr')}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.sig} onChange={(e) => set({ sig: e.target.checked })} /> {t('f.sig')}</label>
          </fieldset>
          <button className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-on-brand hover:bg-brand-deep" type="submit">{t('f.submit')}</button>
        </form>

        <div className="min-w-0 space-y-8">
          {!result.ok && <p role="alert" className="rounded border border-danger bg-danger-soft p-3 text-danger">{t(`err.${result.error}`)}</p>}
          {result.ok && <Verdict key={run} alerts={result.alerts} focus={run > 0} />}
          <ChainStrip lineage={p.lineage} />
        </div>
      </div>
    </>
  );
}

function Verdict({ alerts, focus }: { alerts: Alert[]; focus: boolean }) {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { if (focus) ref.current?.scrollIntoView({ block: 'nearest' }); }, [focus]);
  const worst = alerts.some((a) => a.severity === 'block') ? 'block' : alerts.some((a) => a.severity === 'review') ? 'review' : null;
  const head = worst === 'block' ? t('v.block') : worst === 'review' ? t('v.review') : t('v.clear');
  const sub = worst ? (alerts.length === 1 ? t('v.sub1') : t('v.subN', { n: alerts.length })) : t('v.subClear');
  const panel = worst ? tone[worst].panel : 'bg-brand-soft border-brand';
  return (
    <section ref={ref} className={`verdict-in rounded-lg border border-l-8 p-4 ${panel}`} aria-live="polite">
      <h2 className="text-xl font-semibold">{head}</h2>
      <p className="mt-1 text-sm">{sub}</p>
      {alerts.length > 0 && (
        <ul className="mt-4 space-y-3">
          {alerts.map((a) => {
            const ev = a.evidence.filter((e) => e !== 'NEW-CHECK');
            return (
              <li key={a.rule} className="rounded-md bg-card/80 p-3">
                <p className="flex flex-wrap items-center gap-2"><SeverityChip severity={a.severity} /> <b className="text-ink">{ruleTitle(a.rule, lang)}</b></p>
                <p className="mt-1">{describe(a, lang)}</p>
                <p className="mt-1 text-sm">
                  {ev.length > 0 && <>{t('v.evidence', { list: ev.join(', ') })} · </>}
                  <a className={link} href={`#/cases/${a.lineage}`}>{t('v.openParcel', { id: a.lineage })}</a>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
