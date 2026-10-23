import { DownloadButton } from '../components/Audit.tsx';
import { Chip, PageTitle, link } from '../components/ui.tsx';
import { downloadFile } from '../lib/download.ts';
import { toCsv } from '../lib/summary.ts';
import { evaluate } from '../engine/evaluate.ts';
import { ruleTitle } from '../lib/alerts.ts';
import { useLang } from '../lib/i18n.tsx';
import { baseAlerts, seed } from '../lib/registry.ts';

const result = evaluate(seed, baseAlerts);

export default function Benchmark() {
  const { t, lang } = useLang();
  const r = result;
  const fp = r.false_positive_deeds.length;
  const exportCsv = () => {
    const head = [t('bm.th.parcel'), t('bm.th.anomaly'), t('bm.th.rules'), t('bm.th.result')];
    const body = r.per_anomaly.map((row) => [
      row.lineage, t(`anom.${row.anomaly}`), row.rules.length ? row.rules.map((x) => ruleTitle(x, lang)).join('; ') : t('bm.none'),
      !row.evaluable ? t('bm.nottest') : row.detected ? t('bm.caught') : t('bm.missed'),
    ]);
    downloadFile('ardh-benchmark.csv', 'text/csv', toCsv([head, ...body]));
  };
  return (
    <>
      <PageTitle title={t('bm.title')}>{t('bm.intro', { n: r.labelled_anomalies })}</PageTitle>
      <p className="max-w-2xl text-lg text-ink">
        {t(fp === 0 ? 'bm.result' : 'bm.resultFp', { caught: r.detected, planted: r.labelled_anomalies, untested: r.labelled_anomalies - r.evaluable, flagged: r.deeds_flagged, all: r.deeds_total, fp })}
      </p>
      <div role="note" className="my-6 max-w-2xl rounded-lg border border-l-8 border-caution bg-caution-soft p-4 text-caution">
        <p className="font-semibold">{t('bm.noteTitle')}</p>
        <p className="mt-1">{t('bm.noteBody')}</p>
      </div>
      <div className="ag-toolbar"><DownloadButton label={t('dl.bench')} onClick={exportCsv} /></div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-mist text-ink">
              <th className="px-4 py-2.5 font-semibold">{t('bm.th.parcel')}</th><th className="px-4 py-2.5 font-semibold">{t('bm.th.anomaly')}</th><th className="px-4 py-2.5 font-semibold">{t('bm.th.rules')}</th><th className="px-4 py-2.5 font-semibold">{t('bm.th.result')}</th>
            </tr>
          </thead>
          <tbody>
            {r.per_anomaly.map((row) => (
              <tr key={row.lineage} className="border-b border-line align-top even:bg-paper">
                <td className="px-4 py-3"><a className={link} href={`#/cases/${row.lineage}`}>{row.lineage}</a></td>
                <td className="px-4 py-3">{t(`anom.${row.anomaly}`)}</td>
                <td className="px-4 py-3">{row.rules.length ? row.rules.map((x) => ruleTitle(x, lang)).join(lang === 'bn' ? '; ' : ', ') : t('bm.none')}</td>
                <td className="px-4 py-3">{!row.evaluable ? <Chip>{t('bm.nottest')}</Chip> : row.detected ? <Chip ok>{t('bm.caught')}</Chip> : <Chip ok={false}>{t('bm.missed')}</Chip>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-2xl text-sm">{t('bm.foot')}</p>
    </>
  );
}
