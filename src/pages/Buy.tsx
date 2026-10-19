import { useState } from 'react';
import { ChecksGrid, Notice, ReportRail, SummaryTiles, VerdictBanner, toneOf, type Tile } from '../components/Audit.tsx';
import type { Alert } from '../engine/types.ts';
import { runCheck, sellerFromName, type CheckResult } from '../lib/check.ts';
import { downloadFile, printHtml } from '../lib/download.ts';
import { useLang } from '../lib/i18n.tsx';
import { AS_OF, chainOf, mouzaOf, parcelOf, seed } from '../lib/registry.ts';
import { checkReportHtml, landClass, verdictText, type ReportInput } from '../lib/report.ts';
import { shareText, toBn } from '../lib/strings.ts';
import { PRE_REG, checkRows, passedCount, reportId } from '../lib/summary.ts';

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
  const { t } = useLang();
  const [s, setS] = useState<State>({ lineage: 'L06', seller: ownerName('L06'), area: '30', qr: true });
  const [result, setResult] = useState<CheckResult | null>(null);
  const [shown, setShown] = useState<State>(s); // the inputs the visible result was run with

  return (
    <div className="ag-stack">
      <section className="card ag-hero">
        <h1>{t('buy.title')}</h1>
        <p className="ag-lead">{t('buy.intro')}</p>

        <p className="ag-eg-label">{t('ex.label')}</p>
        <div className="ag-chips">
          {examples().map((ex) => (
            <button key={ex.key} type="button" className="ag-chip-btn"
              onClick={() => { setS(ex.s); setShown(ex.s); setResult(evaluate(ex.s)); }}>{t(ex.key)}</button>
          ))}
        </div>

        <form className="ag-form" onSubmit={(e) => { e.preventDefault(); setShown(s); setResult(evaluate(s)); }}>
          <label className="ag-field"><span>{t('f.parcel')}</span>
            <select className="ag-input" value={s.lineage} onChange={(e) => setS({ ...s, lineage: e.target.value })}>
              {seed.parcel_lineages.map((x) => (
                <option key={x.lineage} value={x.lineage}>{t('cases.row', { id: x.lineage, mouza: mouzaOf(x.mouza_id)?.name ?? '', area: x.area_dec })}</option>
              ))}
            </select>
          </label>
          <label className="ag-field"><span>{t('buy.seller')}</span>
            <input className="ag-input" value={s.seller} placeholder={t('buy.sellerPh')} onChange={(e) => setS({ ...s, seller: e.target.value })} />
          </label>
          <label className="ag-field"><span>{t('buy.area')}</span>
            <input className="ag-input" inputMode="decimal" value={s.area} onChange={(e) => setS({ ...s, area: e.target.value })} />
          </label>
          <button className="ag-btn ag-btn-primary" type="submit">{t('buy.submit')}</button>
          <fieldset className="ag-docs">
            <label><input type="checkbox" checked={s.qr} onChange={(e) => setS({ ...s, qr: e.target.checked })} /> {t('buy.qr')}</label>
          </fieldset>
          <p className="ag-privacy">{t('buy.privacy')}</p>
        </form>
      </section>

      {result && !result.ok && <p role="alert" className="ag-notice" style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{t(`err.${result.error}`)}</p>}
      {result && result.ok && <Result alerts={result.alerts} state={shown} />}
    </div>
  );
}

function Result({ alerts, state }: { alerts: Alert[]; state: State }) {
  const { t, lang } = useLang();
  const d = (x: string | number) => (lang === 'bn' ? toBn(x) : String(x));
  const parcel = parcelOf(state.lineage);
  const chain = chainOf(state.lineage);
  const latest = chain.at(-1);
  if (!parcel || !latest) return null;
  const m = mouzaOf(parcel.mouza_id);
  const { worst, head, sub } = verdictText(lang, 'citizen', alerts);
  const tone = toneOf(worst);
  const rows = checkRows(alerts);
  const passed = passedCount(rows);
  const trail = chain.map((k) => ({ k, owner: k.owners.find((o) => o.name.trim().toLowerCase() === state.seller.trim().toLowerCase()) }));
  const found = trail.filter((x) => x.owner).length;
  const khas = alerts.some((a) => a.rule === 'KHAS_CONFLICT');
  const latestOwner = trail.at(-1)?.owner;
  const id = reportId(['buyer', state.lineage, state.seller.trim().toLowerCase(), state.area, state.qr, AS_OF]);

  const tiles: Tile[] = [
    { label: t('tile.checks'), value: t('tile.checksOf', { n: passed, total: PRE_REG.length }), tone, ring: passed / PRE_REG.length },
    { label: t('tile.verdict'), value: worst ? t(`sev.${worst}`) : t('cases.none'), tone },
    { label: t('tile.trail'), value: t('tile.trailVal', { n: found }), tone: found === chain.length ? 'ok' : found === 0 ? 'bad' : 'warn' },
    { label: t('tile.land'), value: khas ? t('tile.landKhas') : t('tile.landOk'), sub: landClass(lang, latest.land_class), tone: khas ? 'bad' : 'ok' },
  ];

  // The citizen report carries only the buyer's own inputs and the short, private reasons. No other owners or deeds.
  const input = (): ReportInput => ({
    lang, mode: 'citizen', id, asOf: AS_OF, generated: new Date().toISOString().slice(0, 16).replace('T', ' '), fontUrl: `${location.origin}/fonts/Kalpurush.ttf`,
    parcel: { id: state.lineage, mouza: m?.name ?? '', upazila: m?.upazila ?? '', district: m?.district ?? '', area: parcel.area_dec },
    chain: [], trail: trail.map(({ k, owner }) => ({ survey: k.survey, year: k.survey_year, share: owner?.share ?? null })),
    seller: { name: state.seller || '—', share: latestOwner?.share ?? null },
    buyer: '', areaSold: Number(state.area), date: AS_OF, qr: state.qr, sig: true, alerts,
  });

  return (
    <div className="ag-stack">
      <VerdictBanner tone={tone} head={head} sub={sub} />
      <SummaryTiles tiles={tiles} />
      <ChecksGrid rows={rows} mode="citizen" />

      <div className="ag-split">
        <div className="ag-stack">
          <section className="card ag-section">
            <h2>{t('buy.trail')}</h2>
            <ul className="ag-checks" style={{ marginTop: '1rem' }}>
              {trail.map(({ k, owner }) => (
                <li key={k.khatian_uid} className="ag-check" data-state={owner ? 'pass' : 'flag'} data-tone={owner ? 'ok' : 'warn'}>
                  <div className="ag-check-head"><h3>{t(`survey.${k.survey}`)} · {d(k.survey_year)}</h3></div>
                  <p>{owner ? t('buy.found', { share: shareText(lang, owner.share) }) : t('buy.notFound')}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="card ag-section">
            <h2>{t('buy.next')}</h2>
            <ol style={{ margin: '.75rem 0 0', paddingLeft: '1.25rem' }}>
              {['buy.next1', 'buy.next2', 'buy.next3', 'buy.next4'].map((k) => <li key={k} style={{ margin: '.35rem 0' }}>{t(k)}</li>)}
            </ol>
          </section>
        </div>
        <ReportRail id={id} asOf={AS_OF} actions={[
          { label: t('rep.html'), primary: true, onClick: () => downloadFile(`ardh-buyer-report-${id}.html`, 'text/html', checkReportHtml(input())) },
          { label: t('rep.print'), onClick: () => printHtml(checkReportHtml(input())) },
        ]} />
      </div>

      <Notice>{t('rep.notice')}</Notice>
    </div>
  );
}
