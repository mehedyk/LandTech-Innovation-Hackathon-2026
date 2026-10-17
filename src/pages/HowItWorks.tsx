import { PageTitle, SeverityChip, link } from '../components/ui.tsx';
import type { RuleId, Severity } from '../engine/types.ts';
import { rulePlain, ruleTitle } from '../lib/alerts.ts';
import { useLang } from '../lib/i18n.tsx';

const CHECKS: { id: RuleId; sev: Severity; cp: 'pre-registration' | 'pre-mutation'; parcel?: string }[] = [
  { id: 'OVERLAPPING_SALE', sev: 'block', cp: 'pre-registration', parcel: 'L05' },
  { id: 'SHARE_OVERRUN', sev: 'block', cp: 'pre-registration', parcel: 'L12' },
  { id: 'KHAS_CONFLICT', sev: 'block', cp: 'pre-registration', parcel: 'L20' },
  { id: 'SELLER_NOT_RECORDED_OWNER', sev: 'block', cp: 'pre-registration' },
  { id: 'INVALID_QR_OR_SIGNATURE', sev: 'block', cp: 'pre-registration', parcel: 'L22' },
  { id: 'MUTATION_AREA_MISMATCH', sev: 'review', cp: 'pre-mutation', parcel: 'L03' },
  { id: 'REGISTERED_NOT_MUTATED', sev: 'review', cp: 'pre-mutation', parcel: 'L14' },
  { id: 'REJECTED_THEN_RESUBMITTED', sev: 'info', cp: 'pre-mutation', parcel: 'L07' },
];

export default function HowItWorks() {
  const { t, lang } = useLang();
  return (
    <>
      <PageTitle title={t('how.title')}>{t('how.intro')}</PageTitle>

      <ol className="grid gap-0 md:grid-cols-4" aria-label={t('how.flow.aria')}>
        {[1, 2, 3, 4].map((n) => (
          <li key={n} className="border-l-4 border-brand py-2 pl-4 pr-3 md:border-l-0 md:border-t-4 md:pl-0 md:pt-3">
            <p className="text-sm font-medium text-brand">{t('how.step', { n })}</p>
            <p className="font-semibold text-ink">{t(`how.s${n}.t`)}</p>
            <p className="mt-1 text-sm">{t(`how.s${n}.d`)}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold">{t('how.cp.title')}</h2>
          <p className="mt-2"><b className="text-ink">{t('how.cp.reg')}</b>{t('how.cp.regBody')}</p>
          <p className="mt-2"><b className="text-ink">{t('how.cp.mut')}</b>{t('how.cp.mutBody')}</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">{t('how.why.title')}</h2>
          <p className="mt-2">{t('how.why.body')}</p>
        </section>
      </div>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-lg font-semibold">{t('how.roles.title')}</h2>
        <p className="mt-2">{t('how.roles.body')}</p>
      </section>

      <h2 className="mb-1 mt-12 text-xl font-semibold">{t('how.checks.title')}</h2>
      <p className="mb-4 max-w-2xl text-sm">{t('how.checks.legend')}</p>
      <ul className="divide-y divide-line border-y border-line">
        {CHECKS.map((c) => (
          <li key={c.id} className="py-4">
            <p className="flex flex-wrap items-center gap-2">
              <SeverityChip severity={c.sev} />
              <b className="text-ink">{ruleTitle(c.id, lang)}</b>
              <span className="text-sm">{t(`cp.${c.cp}`)}</span>
            </p>
            <p className="mt-1 max-w-3xl">{rulePlain(c.id, lang)}</p>
            <p className="mt-1 max-w-3xl text-sm">
              {t('how.example', { text: t(`how.ex.${c.id}`) })}{' '}
              {c.parcel && <a className={link} href={`#/cases/${c.parcel}`}>{t('how.seeParcel', { id: c.parcel })}</a>}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 max-w-2xl rounded border-l-8 border-line bg-mist p-4">
        <h2 className="font-semibold text-ink">{t('how.not.title')}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {[1, 2, 3].map((n) => <li key={n}>{t(`how.not.${n}`)}</li>)}
        </ul>
      </div>
    </>
  );
}
