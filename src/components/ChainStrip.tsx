import { useLang } from '../lib/i18n.tsx';
import { shareText, toBn } from '../lib/strings.ts';
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
      <p className="mb-3 text-sm">
        {t('chain.parcel', { id: lineage, mouza: m?.name ?? '', upazila: m?.upazila ?? '', district: m?.district ?? '', area: parcel.area_dec })}
      </p>
      <ol className="grid gap-4 md:grid-cols-4">
        {chain.map((k, i) => {
          const latest = i === chain.length - 1;
          return (
            <li key={k.khatian_uid} className={`card p-4 ${latest ? 'card-active' : ''}`}>
              <p className="font-semibold text-ink">
                {t(`survey.${k.survey}`)} <span className="font-normal">· {d(k.survey_year)}</span>
              </p>
              <p className="text-sm">{t('chain.khatian', { kno: k.khatian_no, plot: k.plot_no })}</p>
              <ul className="mt-1 text-sm">
                {k.owners.map((o) => (
                  <li key={o.party_id}>
                    {o.name} <span className="text-body/70">({shareText(lang, o.share)})</span>
                  </li>
                ))}
              </ul>
              {latest && <p className="mt-1 text-sm font-medium text-brand">{t('chain.latest')}</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
