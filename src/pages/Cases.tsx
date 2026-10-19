import { DownloadButton } from '../components/Audit.tsx';
import ChainStrip from '../components/ChainStrip.tsx';
import { downloadFile } from '../lib/download.ts';
import { parcelReportHtml } from '../lib/report.ts';
import { Chip, PageTitle, SeverityChip, link, tone } from '../components/ui.tsx';
import { describe, ruleTitle } from '../lib/alerts.ts';
import { useLang } from '../lib/i18n.tsx';
import { AS_OF, baseAlerts, chainOf, lineageOfDeed, mouzaOf, mutationsOf, parcelOf, seed } from '../lib/registry.ts';

export default function Cases({ id }: { id?: string }) {
  return id && parcelOf(id) ? <Detail id={id} /> : <List missing={id} />;
}

function List({ missing }: { missing?: string }) {
  const { t } = useLang();
  const rows = seed.parcel_lineages
    .map((p) => ({ p, alerts: baseAlerts.filter((a) => a.lineage === p.lineage) }))
    .sort((a, b) => b.alerts.filter((x) => x.severity !== 'info').length - a.alerts.filter((x) => x.severity !== 'info').length || a.p.lineage.localeCompare(b.p.lineage));
  return (
    <>
      <PageTitle title={t('cases.title')}>{t('cases.intro')}</PageTitle>
      {missing && <p role="alert" className="mb-4 rounded-lg border border-caution bg-caution-soft p-3 text-caution">{t('cases.missing', { id: missing })}</p>}
      <ul className="card divide-y divide-line overflow-hidden">
        {rows.map(({ p, alerts }) => {
          const serious = alerts.filter((a) => a.severity !== 'info').length;
          return (
            <li key={p.lineage}>
              <a href={`#/cases/${p.lineage}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-mist">
                <span>{t('cases.row', { id: p.lineage, mouza: mouzaOf(p.mouza_id)?.name ?? '', area: p.area_dec })}</span>
                <span className="text-sm">{serious > 0 ? <Chip ok={false}>{t('cases.look', { n: serious })}</Chip> : alerts.length ? <Chip>{t('cases.notes')}</Chip> : <Chip ok>{t('cases.none')}</Chip>}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Detail({ id }: { id: string }) {
  const { t, lang } = useLang();
  const deeds = seed.deeds.filter((d) => lineageOfDeed(d) === id).sort((a, b) => a.registration_date.localeCompare(b.registration_date));
  const share = (s: string) => (s === 'full' ? t('share.full') : s);
  const exportParcel = () => {
    const parcel = parcelOf(id);
    if (!parcel) return;
    const m = mouzaOf(parcel.mouza_id);
    downloadFile(`ardh-parcel-${id}.html`, 'text/html', parcelReportHtml({
      lang, asOf: AS_OF, generated: new Date().toISOString().slice(0, 16).replace('T', ' '), fontUrl: `${location.origin}/fonts/Kalpurush.ttf`,
      parcel: { id, mouza: m?.name ?? '', upazila: m?.upazila ?? '', district: m?.district ?? '', area: parcel.area_dec },
      chain: chainOf(id),
      deeds: deeds.map((d) => {
        const muts = mutationsOf(d.deed_uid);
        return {
          head: t('cases.deedHead', { dno: d.deed_no, date: d.registration_date, sro: d.sub_registry }),
          line: t('cases.deedLine', { seller: d.seller, buyer: d.buyer, area: d.area_sold_dec, share: lang === 'bn' ? share(d.share_sold) : d.share_sold }),
          flags: [t(d.qr_valid ? 'chip.qrOk' : 'chip.qrBad'), t(d.signature_consistent ? 'chip.sigOk' : 'chip.sigBad'),
            ...(muts.length === 0 ? [t('chip.noMut')] : muts.map((x) => (x.area_mutated_dec ? t('chip.mutArea', { mcase: x.mutation_case, status: t(`mut.${x.status}`), area: x.area_mutated_dec }) : t('chip.mut', { mcase: x.mutation_case, status: t(`mut.${x.status}`) }))))],
          alerts: baseAlerts.filter((a) => a.record === d.deed_uid).map((a) => ({ title: ruleTitle(a.rule, lang), sev: a.severity, sevText: t(`sev.${a.severity}`), text: describe(a, lang) })),
        };
      }),
    }));
  };
  return (
    <>
      <p className="mb-2 text-sm"><a className={link} href="#/cases">{t('cases.all')}</a></p>
      <PageTitle title={t('cases.detailTitle', { id })} />
      <div className="ag-toolbar"><DownloadButton label={t('dl.parcel')} onClick={exportParcel} /></div>
      <section className="card ag-section"><h2>{t('sec.chain')}</h2><ChainStrip lineage={id} /></section>
      <h2 className="mb-3 mt-10 text-xl font-semibold">{t('cases.deedsTitle')}</h2>
      {deeds.length === 0 && <p>{t('cases.noDeeds')}</p>}
      <ul className="space-y-6">
        {deeds.map((d) => {
          const muts = mutationsOf(d.deed_uid);
          const alerts = baseAlerts.filter((a) => a.record === d.deed_uid);
          return (
            <li key={d.deed_uid} className="card p-4">
              <p className="font-semibold text-ink">{t('cases.deedHead', { dno: d.deed_no, date: d.registration_date, sro: d.sub_registry })}</p>
              <p>{t('cases.deedLine', { seller: d.seller, buyer: d.buyer, area: d.area_sold_dec, share: lang === 'bn' ? share(d.share_sold) : d.share_sold })}</p>
              <p className="mt-1 flex flex-wrap gap-2 text-sm">
                <Chip ok={d.qr_valid}>{t(d.qr_valid ? 'chip.qrOk' : 'chip.qrBad')}</Chip>
                <Chip ok={d.signature_consistent}>{t(d.signature_consistent ? 'chip.sigOk' : 'chip.sigBad')}</Chip>
                {muts.length === 0 && <Chip>{t('chip.noMut')}</Chip>}
                {muts.map((m) => (
                  <Chip key={m.mutation_case} ok={m.status === 'approved' ? true : m.status === 'rejected' ? false : undefined}>
                    {m.area_mutated_dec
                      ? t('chip.mutArea', { mcase: m.mutation_case, status: t(`mut.${m.status}`), area: m.area_mutated_dec })
                      : t('chip.mut', { mcase: m.mutation_case, status: t(`mut.${m.status}`) })}
                  </Chip>
                ))}
              </p>
              {alerts.map((a) => (
                <div key={a.rule} className={`mt-3 rounded-r-md border-l-4 bg-card py-2 pl-3 ${tone[a.severity].edge}`}>
                  <p className="flex flex-wrap items-center gap-2"><SeverityChip severity={a.severity} /> <b className="text-ink">{ruleTitle(a.rule, lang)}</b></p>
                  <p className="mt-1 text-sm">{describe(a, lang)}</p>
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </>
  );
}
