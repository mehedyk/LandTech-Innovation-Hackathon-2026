import ChainStrip from '../components/ChainStrip.tsx';
import { Chip, PageTitle, SeverityChip, link, tone } from '../components/ui.tsx';
import { describe, ruleTitle } from '../lib/alerts.ts';
import { useLang } from '../lib/i18n.tsx';
import { baseAlerts, lineageOfDeed, mouzaOf, mutationsOf, parcelOf, seed } from '../lib/registry.ts';

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
      {missing && <p role="alert" className="mb-4 rounded border border-caution bg-caution-soft p-3 text-caution">{t('cases.missing', { id: missing })}</p>}
      <ul className="divide-y divide-line border-y border-line">
        {rows.map(({ p, alerts }) => {
          const serious = alerts.filter((a) => a.severity !== 'info').length;
          return (
            <li key={p.lineage}>
              <a href={`#/cases/${p.lineage}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-mist">
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
  return (
    <>
      <p className="mb-2 text-sm"><a className={link} href="#/cases">{t('cases.all')}</a></p>
      <PageTitle title={t('cases.detailTitle', { id })} />
      <ChainStrip lineage={id} />
      <h2 className="mb-3 mt-10 text-xl font-semibold">{t('cases.deedsTitle')}</h2>
      {deeds.length === 0 && <p>{t('cases.noDeeds')}</p>}
      <ul className="space-y-6">
        {deeds.map((d) => {
          const muts = mutationsOf(d.deed_uid);
          const alerts = baseAlerts.filter((a) => a.record === d.deed_uid);
          return (
            <li key={d.deed_uid} className="border-l-4 border-line pl-4">
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
                <div key={a.rule} className={`mt-3 border-l-4 bg-white py-2 pl-3 ${tone[a.severity].edge}`}>
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
