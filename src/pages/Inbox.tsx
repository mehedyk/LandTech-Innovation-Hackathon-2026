import { useMemo, useState } from 'react';
import { Chip, PageTitle, SeverityChip, link, tone } from '../components/ui.tsx';
import type { Alert, Checkpoint, Severity } from '../engine/types.ts';
import { CHECKPOINT_LABEL, RULES, SEVERITY, baseAlerts, deedByUid, mouzaOf } from '../lib/registry.ts';
import { DECISION_LABEL, useDecisions, type Decision } from '../lib/decisions.ts';

const keyOf = (a: Alert) => `${a.record}:${a.rule}`;

function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string }[] }) {
  return (
    <div className="inline-flex overflow-hidden rounded border border-line bg-white text-sm" role="group">
      {options.map((o) => (
        <button key={o.v} type="button" aria-pressed={value === o.v} onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 ${value === o.v ? 'bg-ink text-white' : 'text-ink hover:bg-mist'}`}>{o.label}</button>
      ))}
    </div>
  );
}

export default function Inbox() {
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

  return (
    <>
      <PageTitle title="Alerts for officers">
        Every alert says why it was raised and which records to open. {open} of {baseAlerts.length} are still waiting for a decision. Decisions are saved in this browser only.
      </PageTitle>
      <div className="mb-6 flex flex-wrap gap-3">
        <Seg value={cp} onChange={setCp} options={[{ v: 'all', label: 'Both checkpoints' }, { v: 'pre-registration', label: 'Before registration' }, { v: 'pre-mutation', label: 'Before mutation' }]} />
        <Seg value={sev} onChange={setSev} options={[{ v: 'all', label: 'All' }, { v: 'block', label: 'Hold' }, { v: 'review', label: 'Review' }, { v: 'info', label: 'Note' }]} />
      </div>
      {rows.length === 0 && <p>No alerts match these filters. Choose “All” to see everything.</p>}
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((a) => {
          const d = deedByUid.get(a.record);
          const dec = decisions[keyOf(a)];
          return (
            <li key={keyOf(a)} className={`border-l-4 py-4 pl-4 ${tone[a.severity].edge}`}>
              <p className="flex flex-wrap items-center gap-2">
                <SeverityChip severity={a.severity} />
                <b className="text-ink">{RULES[a.rule].title}</b>
                <Chip>{CHECKPOINT_LABEL[a.checkpoint]}</Chip>
              </p>
              <p className="mt-1 max-w-3xl">{a.message}</p>
              <p className="mt-1 text-sm">
                Deed {d?.deed_no} · {d?.seller} to {d?.buyer} · {mouzaOf(d?.mouza_id ?? '')?.name} ·{' '}
                <a className={link} href={`#/cases/${a.lineage}`}>Open parcel {a.lineage}</a>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {dec ? (
                  <>
                    <Chip ok={dec !== 'dismiss'}>{DECISION_LABEL[dec]}</Chip>
                    <button className={link} type="button" onClick={() => setDecision(keyOf(a), null)}>Undo</button>
                  </>
                ) : (
                  (['hold', 'dismiss', 'escalate'] as Decision[]).map((x) => (
                    <button key={x} type="button" onClick={() => setDecision(keyOf(a), x)}
                      className="rounded border border-line bg-white px-3 py-1 text-ink hover:border-brand">
                      {x === 'hold' ? 'Confirm hold' : x === 'dismiss' ? 'Dismiss' : 'Escalate'}
                    </button>
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
