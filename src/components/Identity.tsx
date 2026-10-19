import { useEffect, useRef, useState } from 'react';
import { identityOf, type IdentityResult } from '../lib/geo.ts';
import { useLang } from '../lib/i18n.tsx';

type Phase = 'idle' | 'scanning' | IdentityResult;

/**
 * Simulated identity step for the officer view. There is no sensor, no template and no photo: pressing the button
 * shows a made-up stored result for the person (data/identity_demo.json) after a short delay. The result is
 * advisory and never changes the rule verdict. NID is a locked placeholder (see the box below it).
 */
export default function IdentitySection({ partyId, name }: { partyId?: string; name: string }) {
  const { t } = useLang();
  const [phase, setPhase] = useState<Phase>('idle');
  const timer = useRef(0);
  useEffect(() => { setPhase('idle'); return () => window.clearTimeout(timer.current); }, [partyId]);

  const scan = () => {
    if (!partyId) return;
    setPhase('scanning');
    timer.current = window.setTimeout(() => setPhase(identityOf(partyId)), 1100);
  };
  const tone = phase === 'matched' ? 'ok' : phase === 'mismatch' ? 'bad' : phase === 'not_enrolled' ? 'warn' : 'neutral';

  return (
    <section className="card ag-section ag-identity" aria-label={t('id.title')}>
      <div className="ag-id-head">
        <h2>{t('id.title')}</h2>
        <span className="ag-sim">{t('id.sim')}</span>
      </div>
      <p className="ag-sub">{t('id.sub')}</p>

      <div className="ag-id-grid">
        <div className="ag-id-person">
          <span className="ag-silhouette" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg>
          </span>
          <div>
            <p className="ag-tile-label">{t('id.person')}</p>
            <p className="ag-party-name">{name}</p>
            <p className="ag-fine">{partyId ? t('id.noPhoto') : t('id.noRecord')}</p>
          </div>
        </div>

        <div className="ag-id-scan" data-tone={tone}>
          <span className="ag-finger" data-phase={phase === 'scanning' ? 'scanning' : 'idle'} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a7 7 0 00-7 7v2M12 7a3 3 0 00-3 3v5c0 2 .6 3.5 1.6 5M12 7a3 3 0 013 3v3M19 10v2.5c0 3-.8 5.3-2 7M12 11v4.5c0 1.8-.3 3-.9 4M8.2 3.8A9 9 0 0121 10" />
            </svg>
          </span>
          <div>
            <button type="button" className="ag-btn ag-btn-ghost" onClick={scan} disabled={!partyId || phase === 'scanning'}>
              {phase === 'scanning' ? t('id.scanning') : t('id.scan')}
            </button>
            <p className="ag-id-result" role="status" aria-live="polite">
              {phase === 'idle' && (partyId ? t('id.idle') : t('id.noRecord'))}
              {phase === 'scanning' && t('id.scanning')}
              {phase === 'matched' && t('id.matched')}
              {phase === 'mismatch' && t('id.mismatch')}
              {phase === 'not_enrolled' && t('id.notEnrolled')}
            </p>
          </div>
        </div>
      </div>

      <details className="ag-nid">
        <summary>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
          <span>{t('nid.title')}</span>
          <span className="ag-locked">{t('nid.locked')}</span>
        </summary>
        <div className="ag-nid-body">
          <p>{t('nid.why')}</p>
          <div className="ag-nid-fields" aria-hidden="true">
            <input className="ag-input" disabled placeholder="••• ••• ••••" tabIndex={-1} />
            <button type="button" className="ag-btn ag-btn-ghost" disabled tabIndex={-1}>{t('nid.verify')}</button>
          </div>
          <p className="ag-fine">{t('nid.later')}</p>
        </div>
      </details>
      <p className="ag-fine">{t('id.advisory')}</p>
    </section>
  );
}
