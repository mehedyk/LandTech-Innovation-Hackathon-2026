import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { format, type Lang, type Params } from './strings.ts';

const KEY = 'ardh.lang';
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string, params?: Params) => string };
const LangContext = createContext<Ctx | null>(null);

function initial(): Lang {
  try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'bn'; } catch { return 'bn'; }
}

/** Bangla is the default language; the choice is remembered in this browser. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* storage unavailable: keep in memory */ }
  };
  const t = (key: string, params?: Params) => format(lang, key, params);
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const c = useContext(LangContext);
  if (!c) throw new Error('useLang must be used inside LangProvider');
  return c;
}
