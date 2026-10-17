import { useEffect, useState } from 'react';
import About from './pages/About.tsx';
import Benchmark from './pages/Benchmark.tsx';
import Cases from './pages/Cases.tsx';
import Check from './pages/Check.tsx';
import HowItWorks from './pages/HowItWorks.tsx';
import Inbox from './pages/Inbox.tsx';
import { baseAlerts } from './lib/registry.ts';
import mark from '../assets/logo-mark.svg';

const NAV = [
  { to: 'check', label: 'Check a deed' },
  { to: 'alerts', label: 'Alerts' },
  { to: 'cases', label: 'Parcels' },
  { to: 'benchmark', label: 'Benchmark' },
  { to: 'how', label: 'How it works' },
  { to: 'about', label: 'Roadmap and limits' },
];

function useRoute() {
  const read = () => {
    const [page = 'check', id] = location.hash.replace(/^#\/?/, '').split('/');
    return { page: page || 'check', id };
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
  const { page, id } = useRoute();
  const holds = baseAlerts.filter((a) => a.severity === 'block').length;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-1 px-4 py-2">
          <a href="#/check" className="flex items-center gap-2 py-1 text-ink">
            <img src={mark} alt="" className="h-8 w-8" />
            <span className="text-lg font-semibold">Ardh Guard</span>
          </a>
          <nav aria-label="Main" className="-mx-1 flex max-w-full overflow-x-auto">
            {NAV.map((n) => (
              <a key={n.to} href={`#/${n.to}`} aria-current={page === n.to ? 'page' : undefined}
                className={`whitespace-nowrap border-b-4 px-3 py-2 text-sm font-medium ${page === n.to ? 'border-brand text-ink' : 'border-transparent hover:border-line'}`}>
                {n.label}{n.to === 'alerts' ? ` (${holds} on hold)` : ''}
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
          : <Check />}
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-sm">
        LandTech Innovation Hackathon 2026 · Team Ardh · Dummy data only. Ardh Guard flags cases for officers and never decides ownership.
      </footer>
    </div>
  );
}
