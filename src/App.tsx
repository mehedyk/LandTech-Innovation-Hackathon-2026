import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import About from './pages/About.tsx';
import Benchmark from './pages/Benchmark.tsx';
import Buy from './pages/Buy.tsx';
import Cases from './pages/Cases.tsx';
import Check from './pages/Check.tsx';
import Dashboard from './pages/Dashboard.tsx';
import HowItWorks from './pages/HowItWorks.tsx';
import Inbox from './pages/Inbox.tsx';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';
import Split from './pages/Split.tsx';
import Toggles from './components/Toggles.tsx';
import { Icon } from './components/dash.tsx';
import { useLang } from './lib/i18n.tsx';
import { ROLE_CHECKPOINT, ROLE_PAGES, SECONDARY, useAuth, type Account, type Page } from './lib/role.tsx';
import { alertsFor } from './lib/stats.ts';
import { toBn } from './lib/strings.ts';
import mark from '../assets/logo-mark.svg';

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

/** Closes a popup on Escape or on a click outside it. */
function useDismiss(ref: React.RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
}

const initial = (name: string) => Array.from(name)[0] ?? '?';

function Shell({ account, raw, id }: { account: Account; raw: string; id?: string }) {
  const { t, lang } = useLang();
  const { signOut } = useAuth();
  const role = account.role;
  const allowed = ROLE_PAGES[role];
  const page: Page = allowed.includes(raw as Page) ? (raw as Page) : 'dashboard';
  const name = account.name[lang === 'bn' ? 0 : 1];
  const holds = alertsFor(ROLE_CHECKPOINT[role]).filter((a) => a.severity === 'block').length;
  const items = allowed.map((to) => ({ to, label: t(`nav.${to}`) }));
  const primary = items.filter((n) => !SECONDARY.includes(n.to));
  const secondary = items.filter((n) => SECONDARY.includes(n.to));
  const holdBadge = (to: Page) => (to === 'alerts' && holds > 0 ? (lang === 'bn' ? toBn(holds) : holds) : null);

  const [drawer, setDrawer] = useState(false);
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeDrawer = () => { setDrawer(false); burger.current?.focus(); };
  useDismiss(moreRef, more, () => setMore(false));
  useDismiss(menuRef, menu, () => setMenu(false));

  // A page this role may not open goes back to its dashboard, with the address corrected too.
  useEffect(() => { if (raw && !allowed.includes(raw as Page)) location.replace('#/dashboard'); }, [raw]); // eslint-disable-line react-hooks/exhaustive-deps
  // Every route change closes the open menus.
  useEffect(() => { setDrawer(false); setMore(false); setMenu(false); }, [raw, id]);
  // Drawer: lock page scroll, move focus in, close on Escape, keep Tab inside.
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLElement>('button, a')?.focus();
    const esc = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', esc); };
  }, [drawer]);
  const trap = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;
    const f = [...drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const out = () => { signOut(); location.hash = '#/login'; };

  const link = (n: { to: Page; label: string }, cls: string) => (
    <a key={n.to} href={`#/${n.to}`} aria-current={page === n.to ? 'page' : undefined} className={cls}>
      <Icon name={n.to} size={18} /><span>{n.label}</span>
      {holdBadge(n.to) && <span className="ag-badge" title={t('nav.alertsHold', { n: holds })}>{holdBadge(n.to)}</span>}
    </a>
  );

  return (
    <div className="min-h-screen">
      <a href="#main" className="ag-skip" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{t('nav.skip')}</a>
      <header className="ag-hdr">
        <div className="bg-bar text-white">
          <div className="mx-auto flex max-w-[1360px] items-center gap-x-4 px-4 py-1.5 text-xs sm:px-8">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-gold" />
            <span className="truncate font-semibold">LandTech Innovation Hackathon 2026 · Team Ardh</span>
            <span className="hidden text-white/70 2xl:inline">{t('brand.tag')}</span>
            <div className="ml-auto hidden xl:block"><Toggles tone="bar" /></div>
          </div>
        </div>

        <div className="ag-hdr-main">
          <div className="mx-auto flex max-w-[1360px] items-center gap-x-3 px-4 py-2 sm:px-8">
            <button ref={burger} type="button" className="ag-burger" aria-label={t('nav.menu')} aria-expanded={drawer} aria-controls="ag-drawer" onClick={() => setDrawer(true)}>
              <Icon name="menu" size={24} />
            </button>
            <a href="#/dashboard" className="ag-logo"><img src={mark} alt="" className="h-9 w-9" /><span>Ardh Guard</span></a>

            <nav aria-label={t('nav.aria')} className="ag-nav">
              {primary.map((n) => link(n, 'ag-nav-link'))}
              {secondary.length > 0 && (
                <div className="ag-more" ref={moreRef}>
                  <button type="button" aria-expanded={more} aria-haspopup="true" className="ag-nav-link" data-open={more ? '' : undefined}
                    data-current={secondary.some((n) => n.to === page) ? '' : undefined} onClick={() => setMore(!more)}>
                    <span>{t('nav.more')}</span><Icon name="chevron" size={16} />
                  </button>
                  {more && <div className="ag-pop ag-pop-nav">{secondary.map((n) => link(n, 'ag-pop-link'))}</div>}
                </div>
              )}
            </nav>

            <div className="ag-user" ref={menuRef}>
              <button type="button" aria-expanded={menu} aria-haspopup="true" onClick={() => setMenu(!menu)} aria-label={`${t('nav.account')}: ${name}`}>
                <span className="ag-avatar" aria-hidden="true">{initial(name)}</span>
                <span className="ag-user-text"><b>{name}</b><small>{t(`role.${role}`)}</small></span>
                <Icon name="chevron" size={16} />
              </button>
              {menu && (
                <div className="ag-pop ag-pop-user">
                  <p><b>{name}</b><small>{t(`role.${role}`)}</small><small>{t(`office.${role}`)}</small></p>
                  <button type="button" onClick={out}><Icon name="logout" size={16} />{t('auth.logout')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {drawer && (
        <div className="ag-drawer-root">
          <div className="ag-drawer-backdrop" onClick={closeDrawer} aria-hidden="true" />
          <aside id="ag-drawer" ref={drawerRef} className="ag-drawer" role="dialog" aria-modal="true" aria-label={t('nav.menu')} onKeyDown={trap}>
            <div className="ag-drawer-head">
              <a href="#/dashboard" className="ag-logo"><img src={mark} alt="" className="h-9 w-9" /><span>Ardh Guard</span></a>
              <button type="button" className="ag-burger" aria-label={t('nav.close')} onClick={closeDrawer}><Icon name="x" size={22} /></button>
            </div>
            <div className="ag-drawer-user">
              <span className="ag-avatar" aria-hidden="true">{initial(name)}</span>
              <p><b>{name}</b><small>{t(`role.${role}`)}</small><small>{t(`office.${role}`)}</small></p>
            </div>
            <nav aria-label={t('nav.aria')}>{items.map((n) => link(n, 'ag-drawer-link'))}</nav>
            <div className="ag-drawer-foot">
              <Toggles />
              <button type="button" className="ag-drawer-out" onClick={out}><Icon name="logout" size={18} />{t('auth.logout')}</button>
            </div>
          </aside>
        </div>
      )}

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1360px] px-4 py-8 pb-12 outline-none sm:px-8">
        {page === 'dashboard' ? <Dashboard />
          : page === 'alerts' ? <Inbox />
          : page === 'cases' ? <Cases id={id} />
          : page === 'benchmark' ? <Benchmark />
          : page === 'how' ? <HowItWorks />
          : page === 'about' ? <About />
          : page === 'buy' ? <Buy />
          : page === 'split' ? <Split />
          : <Check />}
      </main>

      <footer className="border-t border-line bg-card pb-8 pt-6 text-sm">
        <div className="mx-auto max-w-[1360px] space-y-1 px-4 sm:px-8">
          <p>{t('footer')}</p>
          <p>{t('footer.role')}</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const { account } = useAuth();
  const { page: raw, id } = useRoute();
  const guestPage = raw === 'login' || raw === 'signup';
  // Guests only see sign-in and sign-up; signed-in users never see them.
  useEffect(() => {
    if (!account && !guestPage) location.replace('#/login');
    if (account && (guestPage || raw === '')) location.replace('#/dashboard');
  }, [account, raw]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!account) return raw === 'signup' ? <SignUp /> : <Login />;
  return <Shell account={account} raw={raw} id={id} />;
}
