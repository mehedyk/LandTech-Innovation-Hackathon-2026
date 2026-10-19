import { useEffect, useRef, useState } from 'react';
import { Notice, PartyCard, ReportRail, SummaryTiles, ChecksGrid, VerdictBanner, toneOf, type Tile } from '../components/Audit.tsx';
import ChainStrip from '../components/ChainStrip.tsx';
import IdentitySection from '../components/Identity.tsx';
import ParcelMap from '../components/ParcelMap.tsx';
import { Chip } from '../components/ui.tsx';
import type { Alert } from '../engine/types.ts';
import { runCheck, startParams, type CheckResult, type Params } from '../lib/check.ts';
import { reportMapOf, type IdentityResult } from '../lib/geo.ts';
import { downloadFile, printHtml } from '../lib/download.ts';
import { useLang } from '../lib/i18n.tsx';
import { AS_OF, chainOf, mouzaOf, parcelOf, seed } from '../lib/registry.ts';
import { checkReportHtml, checkReportJson, landClass, verdictText, type ReportInput } from '../lib/report.ts';
import { shareText } from '../lib/strings.ts';
import { PRE_REG, checkRows, passedCount, reportId } from '../lib/summary.ts';

const EXAMPLES: { key: string; p: Partial<Params> }[] = [
  { key: 'ex.clean', p: { lineage: 'L06', seller: 'owner:0', area: '30' } },
  { key: 'ex.twice', p: { lineage: 'L02', seller: 'owner:0', area: '250' } },
  { key: 'ex.overrun', p: { lineage: 'L17', seller: 'owner:0', area: '50' } },
  { key: 'ex.notowner', p: { lineage: 'L17', seller: 'other', area: '10' } },
  { key: 'ex.khas', p: { lineage: 'L20', seller: 'other', area: '50' } },
  { key: 'ex.forged', p: { lineage: 'L17', seller: 'owner:0', area: '30', qr: false, sig: false } },
];

export type ParcelSync = { lineage: string; set: (lineage: string) => void };

export default function Check({ sync }: { sync?: ParcelSync } = {}) {
  const { t, lang } = useLang();
  const [p, setP] = useState<Params>(startParams);
  const [result, setResult] = useState<CheckResult>(() => runCheck(startParams));
  const [shown, setShown] = useState<Params>(startParams); // the inputs the visible result was run with
  const [run, setRun] = useState(0);
  const set = (patch: Partial<Params>) => setP((cur) => ({ ...cur, ...patch }));
  const go = (next: Params) => { sync?.set(next.lineage); setResult(runCheck(next, lang === 'bn' ? 'ক্রেতা' : 'Buyer')); setShown(next); setRun((n) => n + 1); };
  const owners = chainOf(p.lineage).at(-1)?.owners ?? [];
  // Side-by-side screen: follow the parcel the other pane picked, and run the check on it.
  useEffect(() => {
    if (sync && sync.lineage !== p.lineage) {
      const next = { ...p, lineage: sync.lineage, seller: 'owner:0' };
      setP(next); setResult(runCheck(next, lang === 'bn' ? 'ক্রেতা' : 'Buyer')); setShown(next); setRun((n) => n + 1);
    }
  }, [sync?.lineage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ag-stack">
      <section className="card ag-hero">
        <h1>{t('check.title')}</h1>
        <p className="ag-lead">{t('check.intro')}</p>

        <p className="ag-eg-label">{t('ex.label')}</p>
        <div className="ag-chips">
          {EXAMPLES.map((ex) => (
            <button key={ex.key} type="button" className="ag-chip-btn"
              onClick={() => { const next = { ...startParams, ...ex.p }; setP(next); go(next); }}>
              {t(ex.key)}
            </button>
          ))}
        </div>

        <form className="ag-form" onSubmit={(e) => { e.preventDefault(); go(p); }}>
          <label className="ag-field"><span>{t('f.parcel')}</span>
            <select className="ag-input" value={p.lineage} onChange={(e) => { set({ lineage: e.target.value, seller: 'owner:0' }); sync?.set(e.target.value); }}>
              {seed.parcel_lineages.map((x) => (
                <option key={x.lineage} value={x.lineage}>{t('cases.row', { id: x.lineage, mouza: mouzaOf(x.mouza_id)?.name ?? '', area: x.area_dec })}</option>
              ))}
            </select>
          </label>
          <label className="ag-field"><span>{t('f.seller')}</span>
            <select className="ag-input" value={p.seller} onChange={(e) => set({ seller: e.target.value })}>
              {owners.map((o, i) => <option key={o.party_id} value={`owner:${i}`}>{t('f.sellerOpt', { name: o.name, share: shareText(lang, o.share) })}</option>)}
              <option value="other">{t('f.sellerOther')}</option>
            </select>
          </label>
          <label className="ag-field"><span>{t('f.buyer')}</span>
            <input className="ag-input" value={p.buyer} placeholder={t('f.buyerPh')} onChange={(e) => set({ buyer: e.target.value })} />
          </label>
          <label className="ag-field"><span>{t('f.area')}</span>
            <input className="ag-input" inputMode="decimal" value={p.area} onChange={(e) => set({ area: e.target.value })} />
          </label>
          <label className="ag-field"><span>{t('f.date')}</span>
            <input className="ag-input" type="date" value={p.date} onChange={(e) => set({ date: e.target.value })} />
          </label>
          <button className="ag-btn ag-btn-primary" type="submit">{t('f.submit')}</button>
          <fieldset className="ag-docs">
            <legend>{t('f.docs')}</legend>
            <label><input type="checkbox" checked={p.qr} onChange={(e) => set({ qr: e.target.checked })} /> {t('f.qr')}</label>
            <label><input type="checkbox" checked={p.sig} onChange={(e) => set({ sig: e.target.checked })} /> {t('f.sig')}</label>
          </fieldset>
        </form>
      </section>

      {!result.ok && <p role="alert" className="ag-notice" style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{t(`err.${result.error}`)}</p>}
      {result.ok && <Audit key={run} alerts={result.alerts} p={shown} focus={run > 0} />}
    </div>
  );
}

function Audit({ alerts, p, focus }: { alerts: Alert[]; p: Params; focus: boolean }) {
  const { t, lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [idResult, setIdResult] = useState<IdentityResult | null>(null); // simulated fingerprint result, if the officer ran it
  useEffect(() => { if (focus) ref.current?.scrollIntoView({ block: 'nearest' }); }, [focus]);

  const parcel = parcelOf(p.lineage);
  const chain = chainOf(p.lineage);
  const latest = chain.at(-1);
  if (!parcel || !latest) return null;
  const m = mouzaOf(parcel.mouza_id);
  const owner = p.seller.startsWith('owner:') ? latest.owners[Number(p.seller.slice(6))] : undefined;
  const buyer = p.buyer || (lang === 'bn' ? 'ক্রেতা' : 'Buyer');
  const rows = checkRows(alerts);
  const passed = passedCount(rows);
  const { worst, head, sub } = verdictText(lang, 'officer', alerts);
  const tone = toneOf(worst);
  const khas = alerts.some((a) => a.rule === 'KHAS_CONFLICT');
  const id = reportId([p.lineage, p.seller, p.area, p.date, p.buyer, p.qr, p.sig, AS_OF]);

  const tiles: Tile[] = [
    { label: t('tile.checks'), value: t('tile.checksOf', { n: passed, total: PRE_REG.length }), tone, ring: passed / PRE_REG.length },
    { label: t('tile.verdict'), value: worst ? t(`sev.${worst}`) : t('cases.none'), tone },
    { label: t('tile.seller'), value: owner ? t('tile.sellerYes', { share: shareText(lang, owner.share) }) : t('tile.sellerNo'), sub: t('tile.sellerSub'), tone: owner ? 'ok' : 'bad' },
    { label: t('tile.land'), value: khas ? t('tile.landKhas') : t('tile.landOk'), sub: landClass(lang, latest.land_class), tone: khas ? 'bad' : 'ok' },
  ];

  const input = (): ReportInput => ({
    lang, mode: 'officer', id, asOf: AS_OF, generated: new Date().toISOString().slice(0, 16).replace('T', ' '), fontUrl: `${location.origin}/fonts/Kalpurush.ttf`,
    parcel: { id: p.lineage, mouza: m?.name ?? '', upazila: m?.upazila ?? '', district: m?.district ?? '', area: parcel.area_dec },
    chain, seller: { name: owner?.name ?? (t('f.sellerOther')), share: owner?.share ?? null },
    buyer, areaSold: Number(p.area), date: p.date, qr: p.qr, sig: p.sig, alerts,
    map: reportMapOf(p.lineage, true),
    identity: { name: owner?.name ?? t('f.sellerOther'), result: owner && !/^Government/i.test(owner.name) ? idResult : null },
  });

  return (
    <div className="ag-stack" ref={ref}>
      <VerdictBanner tone={tone} head={head} sub={sub} />
      <SummaryTiles tiles={tiles} />
      <ChecksGrid rows={rows} mode="officer" />

      <ParcelMap lineage={p.lineage} tone={tone} mode="officer" />

      <section className="card ag-section">
        <h2>{t('sec.chain')}</h2>
        <ChainStrip lineage={p.lineage} />
      </section>

      <div className="ag-split">
        <section className="card ag-section" aria-label={t('sec.parties')}>
          <h2>{t('sec.parties')}</h2>
          <div className="ag-parties" style={{ marginTop: '1rem' }}>
            <PartyCard role={t('party.seller')} name={owner?.name ?? t('f.sellerOther')}
              chip={{ text: owner ? t('party.onRecord') : t('party.notOnRecord'), ok: !!owner }}
              lines={owner ? [[t('party.share'), shareText(lang, owner.share)]] : []} />
            <PartyCard role={t('party.buyer')} name={buyer} lines={[]} />
          </div>
          <div className="ag-xfer">
            <dl className="ag-dl">
              <div><dt>{t('xfer.area')}</dt><dd>{t('chain.areaVal', { area: p.area })}</dd></div>
              <div><dt>{t('xfer.parcelArea')}</dt><dd>{t('chain.areaVal', { area: latest.area_dec })}</dd></div>
              <div><dt>{t('f.date')}</dt><dd>{p.date}</dd></div>
            </dl>
            <div className="ag-flags">
              <Chip ok={p.qr}>{t(p.qr ? 'chip.qrOk' : 'chip.qrBad')}</Chip>
              <Chip ok={p.sig}>{t(p.sig ? 'chip.sigOk' : 'chip.sigBad')}</Chip>
            </div>
          </div>
        </section>

        <ReportRail id={id} asOf={AS_OF} actions={[
          { label: t('rep.html'), primary: true, onClick: () => downloadFile(`ardh-report-${id}.html`, 'text/html', checkReportHtml(input())) },
          { label: t('rep.print'), onClick: () => printHtml(checkReportHtml(input())) },
          { label: t('rep.json'), onClick: () => downloadFile(`ardh-report-${id}.json`, 'application/json', checkReportJson(input())) },
        ]} />
      </div>

      <IdentitySection partyId={owner && !/^Government/i.test(owner.name) ? owner.party_id : undefined} name={owner?.name ?? t('f.sellerOther')} onResult={setIdResult} />

      <Notice>{t('rep.notice')}</Notice>
    </div>
  );
}
