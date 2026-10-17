import type { ReactNode } from 'react';
import type { Severity } from '../engine/types.ts';
import { useLang } from '../lib/i18n.tsx';

export const tone: Record<Severity, { edge: string; chip: string; panel: string }> = {
  block: { edge: 'border-l-danger', chip: 'bg-danger-soft text-danger', panel: 'bg-danger-soft border-danger' },
  review: { edge: 'border-l-caution', chip: 'bg-caution-soft text-caution', panel: 'bg-caution-soft border-caution' },
  info: { edge: 'border-l-line', chip: 'bg-mist text-body', panel: 'bg-mist border-line' },
};

export function SeverityChip({ severity }: { severity: Severity }) {
  const { t } = useLang();
  return <span className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-sm font-semibold ${tone[severity].chip}`}>{t(`sev.${severity}`)}</span>;
}

export function Chip({ children, ok }: { children: ReactNode; ok?: boolean }) {
  const cls = ok === undefined ? 'bg-mist text-body' : ok ? 'bg-brand-soft text-brand' : 'bg-danger-soft text-danger';
  return <span className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-sm ${cls}`}>{children}</span>;
}

export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 max-w-2xl">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {children && <p className="mt-2 leading-relaxed">{children}</p>}
    </div>
  );
}

export const link = 'font-medium text-brand underline underline-offset-2 hover:text-ink';
