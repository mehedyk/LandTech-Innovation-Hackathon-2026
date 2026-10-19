import { useMemo, useState } from 'react';
import { DownloadButton } from '../components/Audit.tsx';
import { Chip, PageTitle, SeverityChip, link, tone } from '../components/ui.tsx';
import { downloadFile } from '../lib/download.ts';
import { toCsv } from '../lib/summary.ts';
import type { Alert, Checkpoint, Severity } from '../engine/types.ts';
import { describe, ruleTitle } from '../lib/alerts.ts';
import { useDecisions, type Decision } from '../lib/decisions.ts';
import { useLang } from '../lib/i18n.tsx';
import { SEVERITY, baseAlerts, deedByUid, mouzaOf } from '../lib/registry.ts';

const keyOf = (a: Alert) => `${a.record}:${a.rule}`;

function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string }[] }) {
  return (
    <div className="inline-flex flex-wrap overflow-hidden rounded border border-line bg-card text-sm" role="group">
      {options.map((o) => (
        <button key={o.v} type="button" aria-pressed={value === o.v} onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 ${value === o.v ? 'bg-brand text-on-brand' : 'text-ink hover:bg-mist'}`}>{o.label}</button>
      ))}
    </div>
  );
}

export default function Inbox() {
  const { t, lang } = useLang();
  const [sev, setSev] = useState<Severity | 'all'>('all');
  const [cp, setCp] = useState<Checkpoint | 'all'>('all');
  const [decisions, setDecision] = useDecisions();

  const rows = useMemo(
    () => baseAlerts
      .filter((a) => (sev === 'all' || a.severity === sev) && (cp === 'all' || a.checkpoint === cp))
      .sort((a, b) => SEVERITY[a.severity].order - SEVERITY[b.severity].order || a.lineage.localeCompare(b.lineage)),
    [sev, cp],
  );
  const open = baseAlerts.filter((a) => !decisions[keyOf(a)]).length;
  const exportCsv = () => {
    const head = [t('bm.th.parcel'), t('csv.h.rule'), t('csv.h.severity'), t('csv.h.checkpoint'), t('csv.h.reason'), t('csv.h.deed'), t('party.seller'), t('party.buyer'), t('csv.h.decision')];
    const body = rows.map((a) => {
      const d = deedByUid.get(a.record);
      const dec = decisions[keyOf(a)];
      return [a.lineage, ruleTitle(a.rule, lang), t(`sev.${a.severity}`), t(`cp.${a.checkpoint}`), describe(a, lang), d?.deed_no ?? '', d?.seller ?? '', d?.buyer ?? '', dec ? t(`dec.${dec}Done`) : t('csv.open')];
    });
    downloadFile('ardh-alerts.csv', 'text/csv', toCsv([head, ...body]));
  };

  return (
    <>
      <PageTitle title={t('inbox.title')}>{t('inbox.intro', { open, total: baseAlerts.length })}</PageTitle>
      <div className="mb-6 flex flex-wrap gap-3">
        <Seg value={cp} onChange={setCp} options={[{ v: 'all', label: t('inbox.bothCp') }, { v: 'pre-registration', label: t('cp.pre-registration') }, { v: 'pre-mutation', label: t('cp.pre-mutation') }]} />
        <Seg value={sev} onChange={setSev} options={[{ v: 'all', label: t('inbox.all') }, { v: 'block', label: t('sev.block') }, { v: 'review', label: t('sev.review') }, { v: 'info', label: t('sev.info') }]} />
      </div>
      <div className="ag-toolbar"><DownloadButton label={t('dl.alerts')} onClick={exportCsv} /></div>
      {rows.length === 0 && <p>{t('inbox.empty')}</p>}
      <ul className="card divide-y divide-line overflow-hidden">
        {rows.map((a) => {
          const d = deedByUid.get(a.record);
          const dec = decisions[keyOf(a)];
          return (
            <li key={keyOf(a)} className={`border-l-4 py-4 pl-4 pr-4 ${tone[a.severity].edge}`}>
              <p className="flex flex-wrap items-center gap-2">
                <SeverityChip severity={a.severity} />
                <b className="text-ink">{ruleTitle(a.rule, lang)}</b>
                <Chip>{t(`cp.${a.checkpoint}`)}</Chip>
              </p>
              <p className="mt-1 max-w-3xl">{describe(a, lang)}</p>
              <p className="mt-1 text-sm">
                {t('inbox.deedLine', { dno: d?.deed_no ?? '', seller: d?.seller ?? '', buyer: d?.buyer ?? '', mouza: mouzaOf(d?.mouza_id ?? '')?.name ?? '' })} ·{' '}
                <a className={link} href={`#/cases/${a.lineage}`}>{t('v.openParcel', { id: a.lineage })}</a>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {dec ? (
                  <>
                    <Chip ok={dec !== 'dismiss'}>{t(`dec.${dec}Done`)}</Chip>
                    <button className={link} type="button" onClick={() => setDecision(keyOf(a), null)}>{t('dec.undo')}</button>
                  </>
                ) : (
                  (['hold', 'dismiss', 'escalate'] as Decision[]).map((x) => (
                    <button key={x} type="button" onClick={() => setDecision(keyOf(a), x)}
                      className="rounded border border-line bg-card px-3 py-1 text-ink hover:border-brand">{t(`dec.${x}`)}</button>
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
