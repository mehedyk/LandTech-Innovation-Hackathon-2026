import { useLang } from '../lib/i18n.tsx';

/**
 * The locked NID placeholder for the officer view. It does nothing: the hackathon rules forbid NID and similar personal
 * data, so the field and the button are disabled. There is no fingerprint or other biometric step anywhere in the app,
 * and none is planned (see docs/INTEGRATION.md).
 */
export default function NidBox() {
  const { t } = useLang();
  return (
    <section className="card ag-section" aria-label={t('nid.title')}>
      <details className="ag-nid" style={{ marginTop: 0 }}>
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
    </section>
  );
}
