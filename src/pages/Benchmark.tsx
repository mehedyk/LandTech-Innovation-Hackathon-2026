import { Chip, PageTitle, link } from '../components/ui.tsx';
import { evaluate } from '../engine/evaluate.ts';
import { ruleTitle } from '../lib/alerts.ts';
import { useLang } from '../lib/i18n.tsx';
import { baseAlerts, seed } from '../lib/registry.ts';

const result = evaluate(seed, baseAlerts);

export default function Benchmark() {
  const { t, lang } = useLang();
  const r = result;
  const fp = r.false_positive_deeds.length;
  return (
    <>
      <PageTitle title={t('bm.title')}>{t('bm.intro', { n: r.labelled_anomalies })}</PageTitle>
      <p className="max-w-2xl text-lg text-ink">
        {t(fp === 0 ? 'bm.result' : 'bm.resultFp', { caught: r.detected, total: r.evaluable, flagged: r.deeds_flagged, all: r.deeds_total, fp })}
      </p>
      <div role="note" className="my-6 max-w-2xl rounded border-l-8 border-caution bg-caution-soft p-4 text-caution">
        <p className="font-semibold">{t('bm.noteTitle')}</p>
        <p className="mt-1">{t('bm.noteBody')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink text-ink">
              <th className="py-2 pr-4">{t('bm.th.parcel')}</th><th className="py-2 pr-4">{t('bm.th.anomaly')}</th><th className="py-2 pr-4">{t('bm.th.rules')}</th><th className="py-2">{t('bm.th.result')}</th>
            </tr>
          </thead>
          <tbody>
            {r.per_anomaly.map((row) => (
              <tr key={row.lineage} className="border-b border-line align-top">
                <td className="py-3 pr-4"><a className={link} href={`#/cases/${row.lineage}`}>{row.lineage}</a></td>
                <td className="py-3 pr-4">{t(`anom.${row.anomaly}`)}</td>
                <td className="py-3 pr-4">{row.rules.length ? row.rules.map((x) => ruleTitle(x, lang)).join(lang === 'bn' ? '; ' : ', ') : t('bm.none')}</td>
                <td className="py-3">{!row.evaluable ? <Chip>{t('bm.nottest')}</Chip> : row.detected ? <Chip ok>{t('bm.caught')}</Chip> : <Chip ok={false}>{t('bm.missed')}</Chip>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-2xl text-sm">{t('bm.foot')}</p>
    </>
  );
}
