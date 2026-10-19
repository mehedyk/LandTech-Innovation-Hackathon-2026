import { useEffect, useState } from 'react';
import About from './pages/About.tsx';
import Benchmark from './pages/Benchmark.tsx';
import Buy from './pages/Buy.tsx';
import Cases from './pages/Cases.tsx';
import Check from './pages/Check.tsx';
import HowItWorks from './pages/HowItWorks.tsx';
import Inbox from './pages/Inbox.tsx';
import Split from './pages/Split.tsx';
import { useLang } from './lib/i18n.tsx';
import { baseAlerts } from './lib/registry.ts';
import { PAGE_AUDIENCE, ROLE_HOME, ROLE_PAGES, useRole, type Page, type Role } from './lib/role.tsx';
import { toBn } from './lib/strings.ts';
import mark from '../assets/logo-mark.svg';

const NAV: { to: Page; label: string }[] = [
  { to: 'split', label: 'nav.split' },
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

/** Stroke icons for the mobile bottom tab bar (24x24 viewBox). */
const ICONS: Record<Page, string[]> = {
  split: ['M4 5h7v14H4z', 'M13 5h7v14h-7z'],
  check: ['M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z', 'M9 12l2 2 4-4'],
  buy: ['M3 4h2l2.4 10.2a1 1 0 001 .8h8.4a1 1 0 001-.8L20 8H6', 'M9 20h.01', 'M17 20h.01'],
  alerts: ['M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7', 'M10 20a2 2 0 004 0'],
  cases: ['M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z', 'M9 4v14', 'M15 6v14'],
  benchmark: ['M5 20V10', 'M12 20V4', 'M19 20v-7'],
  how: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M12 11v5', 'M12 8h.01'],
  about: ['M4 6h16', 'M4 12h16', 'M4 18h10'],
};
const Icon = ({ d }: { d: string[] }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d.map((x) => <path key={x} d={x} />)}
  </svg>
);

type Theme = 'light' | 'dark';
const THEME_KEY = 'ardh.theme';
/** Light is the default; the choice is remembered in this browser. */
function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage unavailable: keep in memory */ }
  }, [theme]);
  return [theme, setTheme] as const;
}

export default function App() {
  const { t, lang, setLang } = useLang();
  const { role, setRole } = useRole();
  const [theme, setTheme] = useTheme();
  const { page: raw, id } = useRoute();
  const allowed = ROLE_PAGES[role];
  const page: Page = allowed.includes(raw as Page) ? (raw as Page) : ROLE_HOME[role];
  const holds = baseAlerts.filter((a) => a.severity === 'block').length;
  const items = NAV.filter((n) => allowed.includes(n.to));
  const fullLabel = (n: { to: Page; label: string }) => `${t(n.label)}${n.to === 'alerts' ? ` (${t('nav.alertsHold', { n: holds })})` : ''}`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 shadow-sm">
        {/* Tier 1: deep-jade utility bar with the language, role and theme switches */}
        <div className="bg-bar text-white">
          <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5 text-xs sm:px-8">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-gold" />
            <span className="hidden font-semibold sm:inline">LandTech Innovation Hackathon 2026 · Team Ardh</span>
            <span className="hidden text-white/70 lg:inline">{t('brand.tag')}</span>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={t('theme.label')} aria-label={`${t('theme.label')}: ${t(theme === 'dark' ? 'theme.dark' : 'theme.light')}`}
                className="inline-flex items-center gap-1.5 rounded border border-white/30 px-2 py-0.5 hover:bg-white/10">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {theme === 'dark'
                    ? <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
                    : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}
                </svg>
                <span className="hidden sm:inline">{t(theme === 'dark' ? 'theme.dark' : 'theme.light')}</span>
              </button>
              <div className="inline-flex overflow-hidden rounded border border-white/30" role="group" aria-label={t('lang.label')}>
                {(['bn', 'en'] as const).map((l) => (
                  <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}
                    className={`px-2.5 py-0.5 ${lang === l ? 'bg-white font-semibold text-bar' : 'text-white hover:bg-white/10'}`}>{l === 'bn' ? 'বাংলা' : 'English'}</button>
                ))}
              </div>
              <label className="flex items-center gap-1.5">
                <span className="sr-only md:not-sr-only">{t('role.label')}</span>
                <select value={role} onChange={(e) => setRole(e.target.value as Role)}
                  className="rounded border border-white/30 bg-white/10 px-1.5 py-0.5 text-white [&>option]:bg-card [&>option]:text-ink">
                  {ROLES.map((r) => <option key={r} value={r}>{t(`role.${r}`)}</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Tier 2: brand and main navigation */}
        <div className="border-b border-line bg-card">
          <div className="mx-auto flex max-w-[1360px] items-center gap-x-6 px-4 py-2 sm:px-8">
            <a href={`#/${ROLE_HOME[role]}`} className="flex shrink-0 items-center gap-2 py-1 text-ink">
              <img src={mark} alt="" className="h-9 w-9" />
              <span className="text-lg font-bold">Ardh Guard</span>
            </a>
            <nav aria-label={t('nav.aria')} className="hidden min-w-0 flex-1 gap-1 overflow-x-auto md:flex">
              {items.map((n) => (
                <a key={n.to} href={`#/${n.to}`} aria-current={page === n.to ? 'page' : undefined}
                  className={`whitespace-nowrap rounded px-3 py-2 text-sm font-medium ${page === n.to ? 'bg-brand text-on-brand' : 'text-ink hover:bg-mist'}`}>
                  {fullLabel(n)}
                  {role === 'both' && PAGE_AUDIENCE[n.to] !== 'both' && <span className="ag-aud-tag">{t(`aud.${PAGE_AUDIENCE[n.to]}`)}</span>}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1360px] px-4 py-8 pb-28 sm:px-8 md:pb-10">
        {page === 'alerts' ? <Inbox />
          : page === 'cases' ? <Cases id={id} />
          : page === 'benchmark' ? <Benchmark />
          : page === 'how' ? <HowItWorks />
          : page === 'about' ? <About />
          : page === 'buy' ? <Buy />
          : page === 'split' ? <Split />
          : <Check />}
      </main>

      <footer className="border-t border-line bg-card pb-24 pt-6 text-sm md:pb-8">
        <div className="mx-auto max-w-[1360px] space-y-1 px-4 sm:px-8">
          <p>{t('footer')}</p>
          <p>{t('footer.role')}</p>
        </div>
      </footer>

      {/* Mobile bottom tab bar (same links as the top navigation) */}
      <nav aria-label={t('nav.aria')} className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card shadow-[0_-2px_8px_rgb(15_23_42/0.08)] md:hidden">
        <ul className="flex overflow-x-auto">
          {items.map((n) => (
            <li key={n.to} className="min-w-[4.75rem] flex-1">
              <a href={`#/${n.to}`} aria-current={page === n.to ? 'page' : undefined} aria-label={fullLabel(n)}
                className={`relative flex flex-col items-center gap-0.5 px-1 pb-1.5 pt-2 text-center text-[11px] font-medium leading-tight ${page === n.to ? 'text-brand' : 'text-body'}`}>
                <span className={`relative rounded-full px-4 py-1 ${page === n.to ? 'bg-brand-soft' : ''}`}>
                  <Icon d={ICONS[n.to]} />
                  {n.to === 'alerts' && holds > 0 && (
                    <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-danger px-1 text-[10px] leading-4 text-card">{lang === 'bn' ? toBn(holds) : holds}</span>
                  )}
                </span>
                <span>{t(n.label)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
