import type { ReactNode } from 'react';
import { useLang } from '../lib/i18n.tsx';
import { toBn } from '../lib/strings.ts';

export type DTone = 'ok' | 'warn' | 'bad' | 'neutral';

/** 24x24 stroke icons used by the dashboards and the navigation. */
export const PATHS: Record<string, string[]> = {
  dashboard: ['M4 4h7v9H4z', 'M13 4h7v5h-7z', 'M13 11h7v9h-7z', 'M4 15h7v5H4z'],
  split: ['M4 5h7v14H4z', 'M13 5h7v14h-7z'],
  check: ['M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z', 'M9 12l2 2 4-4'],
  buy: ['M3 4h2l2.4 10.2a1 1 0 001 .8h8.4a1 1 0 001-.8L20 8H6', 'M9 20h.01', 'M17 20h.01'],
  alerts: ['M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7', 'M10 20a2 2 0 004 0'],
  cases: ['M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z', 'M9 4v14', 'M15 6v14'],
  benchmark: ['M5 20V10', 'M12 20V4', 'M19 20v-7'],
  how: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M12 11v5', 'M12 8h.01'],
  about: ['M4 6h16', 'M4 12h16', 'M4 18h10'],
  clock: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M12 7v5l3 2'],
  x: ['M6 6l12 12', 'M18 6L6 18'],
  tick: ['M5 13l4 4L19 7'],
  doc: ['M7 3h7l5 5v13H7z', 'M14 3v5h5', 'M10 13h6', 'M10 17h6'],
  land: ['M3 20l5-9 4 6 3-4 6 7z', 'M16 6a2 2 0 100-4 2 2 0 000 4z'],
  pie: ['M12 3v9h9', 'M20.5 15A9 9 0 119 3.5'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', 'M12 15a3 3 0 100-6 3 3 0 000 6z'],
  user: ['M12 12a4 4 0 100-8 4 4 0 000 8z', 'M4 21c0-4 3.6-7 8-7s8 3 8 7'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  logout: ['M10 4H5v16h5', 'M15 8l4 4-4 4', 'M9 12h10'],
  chevron: ['M6 9l6 6 6-6'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  sun: ['M12 16a4 4 0 100-8 4 4 0 000 8z', 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
  moon: ['M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z'],
};

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {(PATHS[name] ?? PATHS.about).map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

/** Numbers follow the page language (Bangla digits in Bangla). */
export function useNum() {
  const { lang } = useLang();
  return (n: number | string) => (lang === 'bn' ? toBn(n) : String(n));
}

/** The dashboard greeting banner: deep jade with soft circles, a gold ring and one small red disc. */
export function Hero({ eyebrow, title, sub, meta, children }: { eyebrow: string; title: string; sub: string; meta: string; children?: ReactNode }) {
  return (
    <section className="ag-dash-hero">
      <svg className="ag-dash-hero-art" viewBox="0 0 400 220" aria-hidden="true" preserveAspectRatio="xMaxYMid slice">
        <circle cx="330" cy="100" r="120" fill="currentColor" opacity=".07" />
        <circle cx="390" cy="160" r="90" fill="currentColor" opacity=".07" />
        <path d="M250 160l60-60 60 60z" fill="currentColor" opacity=".06" />
      </svg>
      <span className="ag-flag" aria-hidden="true" />
      <p className="ag-dash-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="ag-dash-sub">{sub}</p>
      <p className="ag-dash-meta">{meta}</p>
      {children && <div className="ag-dash-cta">{children}</div>}
    </section>
  );
}

/** Hexagon badge holding an icon. */
export const Hex = ({ icon, tone = 'ok' }: { icon: string; tone?: DTone }) => (
  <span className="ag-hex" data-tone={tone}><Icon name={icon} size={20} /></span>
);

export function Stat({ icon, label, value, hint, tone = 'ok' }: { icon: string; label: string; value: ReactNode; hint?: string; tone?: DTone }) {
  return (
    <div className="ag-stat" data-tone={tone}>
      <Hex icon={icon} tone={tone} />
      <div className="ag-stat-body">
        <p className="ag-stat-value">{value}</p>
        <p className="ag-stat-label">{label}</p>
        {hint && <p className="ag-stat-hint">{hint}</p>}
      </div>
    </div>
  );
}

export const StatGrid = ({ children }: { children: ReactNode }) => <div className="ag-stat-grid">{children}</div>;

export function Panel({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`ag-panel ${className}`}>
      <header><h2>{title}</h2>{action}</header>
      {children}
    </section>
  );
}

/** Round progress gauge. The value is always printed in the middle, so colour is never the only cue. */
export function Ring({ value, max, label, tone = 'ok' }: { value: number; max: number; label: string; tone?: DTone }) {
  const num = useNum();
  const r = 42, c = 2 * Math.PI * r;
  const frac = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <figure className="ag-gauge" data-tone={tone}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${label}: ${value}/${max}`}>
        <circle cx="50" cy="50" r={r} className="ag-gauge-track" />
        {frac > 0 && <circle cx="50" cy="50" r={r} className="ag-gauge-fill" strokeDasharray={`${c * frac} ${c}`} transform="rotate(-90 50 50)" />}
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central">{num(Math.round(frac * 100))}%</text>
      </svg>
      <figcaption>{label}<br /><b>{num(value)}/{num(max)}</b></figcaption>
    </figure>
  );
}

/** Horizontal bars with the value printed at the end of each. */
export function BarList({ rows }: { rows: { label: string; value: number; tone?: DTone; href?: string }[] }) {
  const num = useNum();
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="ag-bars">
      {rows.map((r) => {
        const inner = (
          <>
            <span className="ag-bar-label">{r.label}</span>
            <span className="ag-bar-track"><i data-tone={r.tone ?? 'ok'} style={{ width: `${Math.max(4, (r.value / max) * 100)}%` }} /></span>
            <b className="ag-bar-val">{num(r.value)}</b>
          </>
        );
        return <li key={r.label}>{r.href ? <a href={r.href}>{inner}</a> : <div>{inner}</div>}</li>;
      })}
    </ul>
  );
}

/** One stacked bar split into labelled parts, with a legend that repeats the numbers. */
export function Segments({ parts }: { parts: { label: string; value: number; tone: DTone }[] }) {
  const num = useNum();
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div className="ag-segs">
      <div className="ag-segs-bar" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(', ')}>
        {parts.filter((p) => p.value > 0).map((p) => <i key={p.label} data-tone={p.tone} style={{ flexGrow: p.value / total }} />)}
      </div>
      <ul>
        {parts.map((p) => <li key={p.label}><i className="ag-dot" data-tone={p.tone} /> {p.label} <b>{num(p.value)}</b></li>)}
      </ul>
    </div>
  );
}

/** A row of numbered steps joined by chevrons. */
export function Steps({ items }: { items: string[] }) {
  const num = useNum();
  return (
    <ol className="ag-steps">
      {items.map((s, i) => <li key={s}><span className="ag-step-n">{num(i + 1)}</span><span>{s}</span></li>)}
    </ol>
  );
}

export const ctaBtn = 'ag-dash-btn';
