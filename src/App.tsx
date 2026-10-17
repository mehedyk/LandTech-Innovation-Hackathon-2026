import { useEffect, useState } from 'react';
import About from './pages/About.tsx';
import Benchmark from './pages/Benchmark.tsx';
import Buy from './pages/Buy.tsx';
import Cases from './pages/Cases.tsx';
import Check from './pages/Check.tsx';
import HowItWorks from './pages/HowItWorks.tsx';
import Inbox from './pages/Inbox.tsx';
import { useLang } from './lib/i18n.tsx';
import { baseAlerts } from './lib/registry.ts';
import { ROLE_HOME, ROLE_PAGES, useRole, type Page, type Role } from './lib/role.tsx';
import mark from '../assets/logo-mark.svg';

const NAV: { to: Page; label: string }[] = [
  { to: 'check', label: 'nav.check' },
  { to: 'buy', label: 'nav.buy' },
  { to: 'alerts', label: 'nav.alerts' },
  { to: 'cases', label: 'nav.cases' },
  { to: 'benchmark', label: 'nav.benchmark' },
  { to: 'how', label: 'nav.how' },
  { to: 'about', label: 'nav.about' },
];
const ROLES: Role[] = ['both', 'citizen', 'officer'];

function useRoute() {
  const read = () => {
    const [page = '', id] = location.hash.replace(/^#\/?/, '').split('/');
    return { page, id };
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export default function App() {
  const { t, lang, setLang } = useLang();
  const { role, setRole } = useRole();
  const { page: raw, id } = useRoute();
  const allowed = ROLE_PAGES[role];
  const page: Page = allowed.includes(raw as Page) ? (raw as Page) : ROLE_HOME[role];
  const holds = baseAlerts.filter((a) => a.severity === 'block').length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2">
          <a href={`#/${ROLE_HOME[role]}`} className="flex items-center gap-2 py-1 text-ink">
            <img src={mark} alt="" className="h-8 w-8" />
            <span className="text-lg font-semibold">Ardh Guard</span>
          </a>
          <div className="ml-auto flex items-center gap-3 text-sm xl:order-last">
            <div className="inline-flex overflow-hidden rounded border border-line" role="group" aria-label={t('lang.label')}>
              {(['bn', 'en'] as const).map((l) => (
                <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 ${lang === l ? 'bg-ink text-white' : 'text-ink hover:bg-mist'}`}>{l === 'bn' ? 'বাংলা' : 'English'}</button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-ink">
              <span className="sr-only md:not-sr-only">{t('role.label')}</span>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded border border-line bg-white px-2 py-1">
                {ROLES.map((r) => <option key={r} value={r}>{t(`role.${r}`)}</option>)}
              </select>
            </label>
          </div>
          <nav aria-label={t('nav.aria')} className="-mx-1 flex w-full max-w-full overflow-x-auto xl:w-auto xl:flex-1">
            {NAV.filter((n) => allowed.includes(n.to)).map((n) => (
              <a key={n.to} href={`#/${n.to}`} aria-current={page === n.to ? 'page' : undefined}
                className={`whitespace-nowrap border-b-4 px-3 py-2 text-sm font-medium ${page === n.to ? 'border-brand text-ink' : 'border-transparent hover:border-line'}`}>
                {t(n.label)}{n.to === 'alerts' ? ` (${t('nav.alertsHold', { n: holds })})` : ''}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {page === 'alerts' ? <Inbox />
          : page === 'cases' ? <Cases id={id} />
          : page === 'benchmark' ? <Benchmark />
          : page === 'how' ? <HowItWorks />
          : page === 'about' ? <About />
          : page === 'buy' ? <Buy />
          : <Check />}
      </main>
      <footer className="mx-auto max-w-6xl space-y-1 px-4 pb-10 text-sm">
        <p>{t('footer')}</p>
        <p>{t('footer.role')}</p>
      </footer>
    </div>
  );
}
