import { useState, type FormEvent, type ReactNode } from 'react';
import Toggles from '../components/Toggles.tsx';
import { Icon } from '../components/dash.tsx';
import { useLang } from '../lib/i18n.tsx';
import { ACCOUNTS, useAuth } from '../lib/role.tsx';
import mark from '../../assets/logo-mark.svg';

/** Shared frame for the sign-in and sign-up pages: a green story panel beside the form. */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="ag-auth">
      <aside className="ag-auth-side">
        <svg className="ag-auth-art" viewBox="0 0 400 600" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
          <circle cx="330" cy="120" r="150" fill="currentColor" opacity=".07" />
          <circle cx="60" cy="520" r="170" fill="currentColor" opacity=".07" />
          <path d="M0 600l140-230 120 150 140-190v270z" fill="currentColor" opacity=".06" />
          <circle cx="318" cy="96" r="30" fill="none" stroke="var(--color-gold)" strokeWidth="3" opacity=".9" />
          <circle cx="318" cy="96" r="17" fill="var(--color-flag)" />
        </svg>
        <div className="ag-auth-brand"><img src={mark} alt="" width="44" height="44" /><span>Ardh Guard</span></div>
        <div className="ag-auth-copy">
          <h1>{t('login.hero1')}</h1>
          <p>{t('login.hero2')}</p>
          <ul>{(['login.pt1', 'login.pt2', 'login.pt3'] as const).map((k) => <li key={k}><Icon name="tick" size={16} /> {t(k)}</li>)}</ul>
        </div>
        <p className="ag-auth-foot">LandTech Innovation Hackathon 2026 · Team Ardh</p>
      </aside>
      <div className="ag-auth-main">
        <div className="ag-auth-top"><Toggles /></div>
        <div className="ag-auth-card">{children}</div>
      </div>
    </div>
  );
}

export default function Login() {
  const { t } = useLang();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const ok = signIn(email, password);
    setFailed(!ok);
    if (ok) location.hash = '#/dashboard';
  };

  return (
    <AuthLayout>
      <h2>{t('login.title')}</h2>
      <p className="ag-auth-sub">{t('login.sub')}</p>
      <form onSubmit={submit} noValidate>
        <label className="ag-field"><span>{t('login.email')}</span>
          <input className="ag-input" type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="ag-field"><span>{t('login.pass')}</span>
          <span className="ag-pass">
            <input className="ag-input" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" aria-pressed={show} onClick={() => setShow(!show)}>{t(show ? 'login.hide' : 'login.show')}</button>
          </span>
        </label>
        {failed && <p role="alert" className="ag-auth-err">{t('login.error')}</p>}
        <button type="submit" className="ag-btn ag-btn-primary ag-auth-submit">{t('login.submit')}</button>
      </form>
      <p className="ag-auth-alt">{t('login.noAcct')} <a href="#/signup">{t('login.signupLink')}</a></p>

      <section className="ag-demo" aria-labelledby="demo-h">
        <h3 id="demo-h">{t('login.demoTitle')}</h3>
        <p className="ag-auth-sub">{t('login.demoSub')}</p>
        <ul>
          {ACCOUNTS.map((a) => (
            <li key={a.role}>
              <button type="button" onClick={() => { setEmail(a.email); setPassword(a.password); setFailed(false); }}
                aria-label={`${t(`role.${a.role}`)}: ${a.email}`}>
                <b>{t(`role.${a.role}`)}</b>
                <small>{t(`roledesc.${a.role}`)}</small>
                <code>{a.email}</code>
                <code>{a.password}</code>
              </button>
            </li>
          ))}
        </ul>
        <p className="ag-fine">{t('login.demoNote')}</p>
      </section>
    </AuthLayout>
  );
}
