import { useState } from 'react';
import { PageTitle, tone } from '../components/ui.tsx';
import type { Alert } from '../engine/types.ts';
import { describeCitizen } from '../lib/alerts.ts';
import { runCheck, sellerFromName, type CheckResult } from '../lib/check.ts';
import { useLang } from '../lib/i18n.tsx';
import { AS_OF, chainOf, mouzaOf, seed } from '../lib/registry.ts';
import { shareText, toBn } from '../lib/strings.ts';

type State = { lineage: string; seller: string; area: string; qr: boolean };
const ownerName = (lineage: string, i = 0) => chainOf(lineage).at(-1)?.owners[i]?.name ?? '';
const examples = (): { key: string; s: State }[] => [
  { key: 'ex.clean', s: { lineage: 'L06', seller: ownerName('L06'), area: '30', qr: true } },
  { key: 'ex.twice', s: { lineage: 'L02', seller: ownerName('L02'), area: '250', qr: true } },
  { key: 'ex.overrun', s: { lineage: 'L17', seller: ownerName('L17'), area: '50', qr: true } },
  { key: 'ex.notowner', s: { lineage: 'L17', seller: 'Unknown Seller', area: '10', qr: true } },
  { key: 'ex.khas', s: { lineage: 'L20', seller: 'Unknown Seller', area: '50', qr: true } },
  { key: 'ex.forged', s: { lineage: 'L17', seller: ownerName('L17'), area: '30', qr: false } },
];

function evaluate(s: State): CheckResult {
  return runCheck({ lineage: s.lineage, seller: sellerFromName(s.lineage, s.seller), area: s.area, date: AS_OF, qr: s.qr, sig: true, buyer: '' });
}

export default function Buy() {
  const { t, lang } = useLang();
  const [s, setS] = useState<State>({ lineage: 'L06', seller: ownerName('L06'), area: '30', qr: true });
  const [result, setResult] = useState<CheckResult | null>(null);
  const d = (x: string | number) => (lang === 'bn' ? toBn(x) : String(x));
  const field = 'mt-1 w-full rounded border border-line bg-white px-3 py-2 text-ink';

  return (
    <>
      <PageTitle title={t('buy.title')}>{t('buy.intro')}</PageTitle>
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-ink">{t('ex.label')}</p>
        <div className="flex flex-wrap gap-2">
          {examples().map((ex) => (
            <button key={ex.key} type="button" className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink hover:border-brand"
              onClick={() => { setS(ex.s); setResult(evaluate(ex.s)); }}>{t(ex.key)}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setResult(evaluate(s)); }}>
          <label className="block text-sm font-medium text-ink">{t('f.parcel')}
            <select className={field} value={s.lineage} onChange={(e) => setS({ ...s, lineage: e.target.value })}>
              {seed.parcel_lineages.map((x) => (
                <option key={x.lineage} value={x.lineage}>{t('cases.row', { id: x.lineage, mouza: mouzaOf(x.mouza_id)?.name ?? '', area: x.area_dec })}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">{t('buy.seller')}
            <input className={field} value={s.seller} placeholder={t('buy.sellerPh')} onChange={(e) => setS({ ...s, seller: e.target.value })} />
          </label>
          <label className="block text-sm font-medium text-ink">{t('buy.area')}
            <input className={field} inputMode="decimal" value={s.area} onChange={(e) => setS({ ...s, area: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={s.qr} onChange={(e) => setS({ ...s, qr: e.target.checked })} /> {t('buy.qr')}</label>
          <button className="w-full rounded bg-brand px-4 py-2.5 font-semibold text-white hover:bg-ink" type="submit">{t('buy.submit')}</button>
          <p className="text-sm">{t('buy.privacy')}</p>
        </form>

        <div className="min-w-0 space-y-8">
          {result && !result.ok && <p role="alert" className="rounded border border-danger bg-danger-soft p-3 text-danger">{t(`err.${result.error}`)}</p>}
          {result && result.ok && <Result alerts={result.alerts} state={s} d={d} />}
        </div>
      </div>
    </>
  );
}

function Result({ alerts, state, d }: { alerts: Alert[]; state: State; d: (x: string | number) => string }) {
  const { t, lang } = useLang();
  const worst = alerts.some((a) => a.severity === 'block') ? 'block' : alerts.some((a) => a.severity === 'review') ? 'review' : null;
  const reasons = [...new Set(alerts.filter((a) => a.severity !== 'info').map((a) => describeCitizen(a, lang)))];
  const panel = worst ? tone[worst].panel : 'bg-brand-soft border-brand';
  const trail = chainOf(state.lineage).map((k) => ({ k, owner: k.owners.find((o) => o.name.trim().toLowerCase() === state.seller.trim().toLowerCase()) }));
  return (
    <>
      <section className={`verdict-in rounded border-l-8 p-4 ${panel}`} aria-live="polite">
        <h2 className="text-xl font-semibold">{worst === 'block' ? t('buy.block') : worst === 'review' ? t('buy.review') : t('buy.clear')}</h2>
        <p className="mt-1 text-sm">{worst ? t('buy.blockSub') : t('buy.clearSub')}</p>
        {reasons.length > 0 && <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">{t('buy.trail')}</h2>
        <ul className="divide-y divide-line border-y border-line">
          {trail.map(({ k, owner }) => (
            <li key={k.khatian_uid} className="flex flex-wrap justify-between gap-2 py-2">
              <span className="font-medium text-ink">{t(`survey.${k.survey}`)} · {d(k.survey_year)}</span>
              <span>{owner ? t('buy.found', { share: shareText(lang, owner.share) }) : t('buy.notFound')}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">{t('buy.next')}</h2>
        <ol className="list-decimal space-y-1.5 pl-5">
          {['buy.next1', 'buy.next2', 'buy.next3', 'buy.next4'].map((k) => <li key={k}>{t(k)}</li>)}
        </ol>
      </section>
    </>
  );
}
