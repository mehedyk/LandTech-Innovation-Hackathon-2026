import { useLang } from '../lib/i18n.tsx';
import { useTheme } from '../lib/theme.ts';
import { Icon } from './dash.tsx';

/** Language and theme switches. `tone="bar"` is for the dark green bar, `tone="plain"` for light surfaces. */
export default function Toggles({ tone = 'plain' }: { tone?: 'bar' | 'plain' }) {
  const { t, lang, setLang } = useLang();
  const [theme, setTheme] = useTheme();
  return (
    <div className="ag-toggles" data-tone={tone}>
      <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title={t('theme.label')} aria-label={`${t('theme.label')}: ${t(theme === 'dark' ? 'theme.dark' : 'theme.light')}`} className="ag-toggle-btn">
        <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={14} />
        <span>{t(theme === 'dark' ? 'theme.dark' : 'theme.light')}</span>
      </button>
      <div className="ag-toggle-seg" role="group" aria-label={t('lang.label')}>
        {(['bn', 'en'] as const).map((l) => (
          <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{l === 'bn' ? 'বাংলা' : 'English'}</button>
        ))}
      </div>
    </div>
  );
}
