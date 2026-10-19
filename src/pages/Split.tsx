import { useState, type ReactNode } from 'react';
import { startParams } from '../lib/check.ts';
import { useLang } from '../lib/i18n.tsx';
import Buy from './Buy.tsx';
import Check from './Check.tsx';

function Pane({ aud, title, sub, children }: { aud: 'officer' | 'citizen'; title: string; sub: string; children: ReactNode }) {
  const { t } = useLang();
  return (
    <section className="ag-pane" data-aud={aud} aria-label={title}>
      <header className="ag-pane-head">
        <span className="ag-aud">{t(`aud.${aud}`)}</span>
        <h2>{title}</h2>
        <p>{sub}</p>
      </header>
      {children}
    </section>
  );
}

/** The Both view: the officer screen and the citizen screen next to each other, each in its own framed pane. */
export default function Split() {
  const { t } = useLang();
  const [lineage, setLineage] = useState(startParams.lineage); // one parcel for both panes
  const sync = { lineage, set: setLineage };
  return (
    <div className="ag-stack">
      <div className="mb-2 max-w-3xl border-l-4 border-brand pl-4">
        <h1 className="text-2xl font-bold sm:text-3xl">{t('split.title')}</h1>
        <p className="mt-2 leading-relaxed">{t('split.intro')}</p>
      </div>
      <p className="ag-fine">{t('split.sync')}</p>
      <div className="ag-panes">
        <Pane aud="officer" title={t('split.officer')} sub={t('split.officerSub')}><Check sync={sync} /></Pane>
        <Pane aud="citizen" title={t('split.citizen')} sub={t('split.citizenSub')}><Buy sync={sync} /></Pane>
      </div>
    </div>
  );
}
