import { useState, type FormEvent } from 'react';
import { useLang } from '../lib/i18n.tsx';
import { AuthLayout } from './Login.tsx';

const SELF_SERVE = ['citizen', 'sub_registrar', 'ac_land'] as const;

/** Written out in full, but deliberately not functional: submitting shows a notice and stores nothing. */
export default function SignUp() {
  const { t } = useLang();
  const [notice, setNotice] = useState(false);
  const submit = (e: FormEvent) => { e.preventDefault(); setNotice(true); };

  return (
    <AuthLayout>
      <h2>{t('signup.title')} <span className="ag-sim" style={{ marginInlineStart: '.5rem', verticalAlign: 'middle' }}>{t('signup.badge')}</span></h2>
      <p role="note" className="ag-auth-note">{t('signup.banner')}</p>
      <p className="ag-auth-sub">{t('signup.sub')}</p>
      <form onSubmit={submit}>
        <label className="ag-field"><span>{t('signup.name')}</span><input className="ag-input" autoComplete="name" /></label>
        <div className="ag-auth-two">
          <label className="ag-field"><span>{t('signup.email')}</span><input className="ag-input" type="email" autoComplete="email" /></label>
          <label className="ag-field"><span>{t('signup.phone')}</span><input className="ag-input" type="tel" inputMode="tel" autoComplete="tel" /></label>
        </div>
        <label className="ag-field"><span>{t('signup.role')}</span>
          <select className="ag-input" defaultValue="citizen">
            {SELF_SERVE.map((r) => <option key={r} value={r}>{t(`role.${r}`)}</option>)}
          </select>
        </label>
        <div className="ag-auth-two">
          <label className="ag-field"><span>{t('signup.pass')}</span><input className="ag-input" type="password" autoComplete="new-password" /></label>
          <label className="ag-field"><span>{t('signup.confirm')}</span><input className="ag-input" type="password" autoComplete="new-password" /></label>
        </div>
        {notice && <p role="status" className="ag-auth-note">{t('signup.off')}</p>}
        <button type="submit" className="ag-btn ag-btn-primary ag-auth-submit">{t('signup.submit')}</button>
      </form>
      <p className="ag-auth-alt">{t('signup.have')} <a href="#/login">{t('signup.back')}</a></p>
    </AuthLayout>
  );
}
