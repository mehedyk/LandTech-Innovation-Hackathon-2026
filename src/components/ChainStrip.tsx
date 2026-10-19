import { useLang } from '../lib/i18n.tsx';
import { shareText, toBn } from '../lib/strings.ts';
import { landClass } from '../lib/report.ts';
import { chainOf, mouzaOf, parcelOf } from '../lib/registry.ts';

/** The record chain Ardh Guard checks against: CS -> SA -> RS -> BS. The latest (BS) record is the one a new deed is compared with. */
export default function ChainStrip({ lineage }: { lineage: string }) {
  const { t, lang } = useLang();
  const chain = chainOf(lineage);
  const parcel = parcelOf(lineage);
  if (!parcel) return null;
  const m = mouzaOf(parcel.mouza_id);
  const d = (x: string | number) => (lang === 'bn' ? toBn(x) : String(x));
  return (
    <section aria-label={t('chain.aria', { id: lineage })}>
      <p className="ag-sub">
        {t('chain.parcel', { id: lineage, mouza: m?.name ?? '', upazila: m?.upazila ?? '', district: m?.district ?? '', area: parcel.area_dec })}
      </p>
      <ol className="ag-chain">
        {chain.map((k, i) => {
          const latest = i === chain.length - 1;
          return (
            <li key={k.khatian_uid} className={`card ${latest ? 'card-active' : ''}`}>
              <p className="ag-chain-head">
                <span>{t(`survey.${k.survey}`)}</span>
                <span className="ag-chain-year">{d(k.survey_year)}</span>
              </p>
              <dl className="ag-dl">
                <div><dt>{t('chain.khatianLbl')}</dt><dd>{d(k.khatian_no)}</dd></div>
                <div><dt>{t('chain.plotLbl')}</dt><dd>{d(k.plot_no)}</dd></div>
                <div><dt>{t('chain.area')}</dt><dd>{t('chain.areaVal', { area: k.area_dec })}</dd></div>
                <div><dt>{t('chain.class')}</dt><dd>{landClass(lang, k.land_class)}</dd></div>
              </dl>
              <p className="ag-owners-label">{t('chain.owners')}</p>
              <ul className="ag-owners">
                {k.owners.map((o) => (
                  <li key={o.party_id}>{o.name} <span>({shareText(lang, o.share)})</span></li>
                ))}
              </ul>
              {latest && <p className="ag-latest">{t('chain.latest')}</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
