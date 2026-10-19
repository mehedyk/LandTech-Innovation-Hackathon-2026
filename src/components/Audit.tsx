import type { ReactNode } from 'react';
import type { Alert } from '../engine/types.ts';
import { ruleTitle, rulePlain, describe, describeCitizen } from '../lib/alerts.ts';
import { useLang } from '../lib/i18n.tsx';
import type { CheckRow } from '../lib/summary.ts';
import { SeverityChip, link } from './ui.tsx';

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral';
export const toneOf = (worst: 'block' | 'review' | null): Tone => (worst === 'block' ? 'bad' : worst === 'review' ? 'warn' : 'ok');

const Icon = ({ kind }: { kind: 'ok' | 'warn' | 'bad' }) => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'ok'
      ? <><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></>
      : kind === 'warn'
        ? <><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5M12 18h.01" /></>
        : <><circle cx="12" cy="12" r="9" /><path d="M8 8l8 8M16 8l-8 8" /></>}
  </svg>
);

/** The big verdict strip: tinted background, saturated left edge, one headline. */
export function VerdictBanner({ tone, head, sub, children }: { tone: Tone; head: string; sub: string; children?: ReactNode }) {
  return (
    <section className="ag-banner verdict-in" data-tone={tone} aria-live="polite">
      <span className="ag-banner-ico"><Icon kind={tone === 'bad' ? 'bad' : tone === 'warn' ? 'warn' : 'ok'} /></span>
      <div className="ag-banner-body">
        <h2>{head}</h2>
        <p>{sub}</p>
        {children}
      </div>
    </section>
  );
}

export type Tile = { label: string; value: string; sub?: string; tone: Tone; ring?: number };

/** Four at-a-glance tiles. A tile with `ring` (0 to 1) shows a progress ring, like the audit score on the field design. */
export function SummaryTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <ul className="ag-tiles">
      {tiles.map((x) => (
        <li key={x.label} className="card ag-tile" data-tone={x.tone}>
          {x.ring !== undefined && (
            <span className="ag-ring" style={{ ['--p' as string]: Math.round(x.ring * 100) }} role="img" aria-label={`${Math.round(x.ring * 100)}%`}>
              <span aria-hidden="true">{Math.round(x.ring * 100)}%</span>
            </span>
          )}
          <div>
            <p className="ag-tile-label">{x.label}</p>
            <p className="ag-tile-value">{x.value}</p>
            {x.sub && <p className="ag-tile-sub">{x.sub}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

const sevTone = (s?: string): Tone => (s === 'block' ? 'bad' : s === 'review' ? 'warn' : 'neutral');

/** One card per check: passed, or flagged with the reason. Citizens get the short, private wording. */
export function ChecksGrid({ rows, mode }: { rows: CheckRow[]; mode: 'officer' | 'citizen' }) {
  const { t, lang } = useLang();
  return (
    <section className="card ag-section" aria-label={t('sec.checks')}>
      <h2>{t('sec.checks')}</h2>
      <p className="ag-sub">{t('sec.checksSub')}</p>
      <ul className="ag-checks">
        {rows.map((r) => {
          const ev = mode === 'officer' && r.alert ? r.alert.evidence.filter((e) => e !== 'NEW-CHECK') : [];
          return (
            <li key={r.rule} className="ag-check" data-state={r.status} data-tone={r.status === 'flag' ? sevTone(r.severity) : 'ok'}>
              <div className="ag-check-head">
                <h3>{ruleTitle(r.rule, lang)}</h3>
                {r.status === 'pass'
                  ? <span className="ag-pass"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>{t('chk.pass')}</span>
                  : <SeverityChip severity={r.severity!} />}
              </div>
              <p>{r.status === 'pass' ? rulePlain(r.rule, lang) : mode === 'citizen' ? describeCitizen(r.alert as Alert, lang) : describe(r.alert as Alert, lang)}</p>
              {ev.length > 0 && <p className="ag-evidence">{t('v.evidence', { list: ev.join(', ') })}{r.alert && <> · <a className={link} href={`#/cases/${r.alert.lineage}`}>{t('v.openParcel', { id: r.alert.lineage })}</a></>}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

export function PartyCard({ role, name, lines, chip }: { role: string; name: string; lines: [string, string][]; chip?: { text: string; ok: boolean } }) {
  return (
    <div className="ag-party">
      <span className="ag-avatar" aria-hidden="true">{initials(name)}</span>
      <div className="ag-party-body">
        <p className="ag-tile-label">{role}</p>
        <p className="ag-party-name">{name}</p>
        {chip && <span className="ag-mini" data-ok={chip.ok}>{chip.text}</span>}
        <dl className="ag-dl">{lines.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      </div>
    </div>
  );
}

/** The right-hand rail: report reference and the download actions. */
export function ReportRail({ id, asOf, actions }: { id: string; asOf: string; actions: { label: string; onClick: () => void; primary?: boolean }[] }) {
  const { t } = useLang();
  return (
    <aside className="card ag-rail" aria-label={t('rep.title')}>
      <span className="ag-seal" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h5" /></svg>
      </span>
      <h2>{t('rep.title')}</h2>
      <p className="ag-tile-label">{t('rep.id')}</p>
      <code className="ag-id">{id}</code>
      <p className="ag-fine">{t('rep.idNote')}</p>
      <p className="ag-fine">{t('rep.asOf', { date: asOf })}</p>
      <div className="ag-actions">
        {actions.map((a) => (
          <button key={a.label} type="button" onClick={a.onClick} className={`ag-btn ${a.primary ? 'ag-btn-primary' : 'ag-btn-ghost'}`}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
            {a.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <p role="note" className="ag-notice">{children}</p>;
}

/** Small download button used on list pages. */
export function DownloadButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="ag-btn ag-btn-ghost">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
      {label}
    </button>
  );
}
