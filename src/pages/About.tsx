import { PageTitle } from '../components/ui.tsx';
import { useLang } from '../lib/i18n.tsx';

const COLUMNS = [
  { head: 'road.v1', state: 'road.built', prefix: 'road.v1.', count: 11 },
  { head: 'road.v11', state: 'road.next', prefix: 'road.v11.', count: 11 },
  { head: 'road.v2', state: 'road.later', prefix: 'road.v2.', count: 10 },
];

export default function About() {
  const { t } = useLang();
  return (
    <>
      <PageTitle title={t('about.title')}>{t('about.intro')}</PageTitle>
      <div className="grid gap-8 md:grid-cols-3">
        {COLUMNS.map((c) => (
          <section key={c.head} className="card p-5">
            <h2 className="text-lg font-semibold">{t(c.head)}</h2>
            <p className="mb-2 text-sm font-medium text-brand">{t(c.state)}</p>
            <ul className="list-disc space-y-1.5 pl-5">
              {Array.from({ length: c.count }, (_, i) => <li key={i}>{t(`${c.prefix}${i + 1}`)}</li>)}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-6 max-w-3xl rounded-lg border border-l-8 border-caution bg-caution-soft p-3 text-caution">{t('road.aiNote')}</p>

      <h2 className="mb-2 mt-12 text-lg font-semibold">{t('about.limitsTitle')}</h2>
      <ul className="max-w-2xl list-disc space-y-1.5 pl-5">
        {Array.from({ length: 13 }, (_, i) => <li key={i}>{t(`limit.${i + 1}`)}</li>)}
      </ul>

      <h2 className="mb-2 mt-12 text-lg font-semibold">{t('about.dataTitle')}</h2>
      <div className="max-w-2xl space-y-2">
        <p>{t('about.data')}</p>
        <p>{t('about.ai')}</p>
        <p>{t('about.decisions')}</p>
      </div>
    </>
  );
}
