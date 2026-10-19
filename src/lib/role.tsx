import { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 'citizen' | 'officer' | 'both';
export type Page = 'split' | 'check' | 'buy' | 'alerts' | 'cases' | 'benchmark' | 'how' | 'about';

/** Who each page is for. In the Both view the tabs carry this so nobody has to guess. */
export const PAGE_AUDIENCE: Record<Page, 'officer' | 'citizen' | 'both'> = {
  split: 'both', check: 'officer', buy: 'citizen', alerts: 'officer', cases: 'officer', benchmark: 'officer', how: 'both', about: 'both',
};

/** Which pages each view shows. This is a demo switch, not access control. */
export const ROLE_PAGES: Record<Role, Page[]> = {
  citizen: ['buy', 'how', 'about'],
  officer: ['check', 'alerts', 'cases', 'benchmark', 'how', 'about'],
  both: ['split', 'check', 'buy', 'alerts', 'cases', 'benchmark', 'how', 'about'],
};
export const ROLE_HOME: Record<Role, Page> = { citizen: 'buy', officer: 'check', both: 'split' };

const KEY = 'ardh.role.v1';
type Ctx = { role: Role; setRole: (r: Role) => void };
const RoleContext = createContext<Ctx | null>(null);

function initial(): Role {
  try { const v = localStorage.getItem(KEY); return v === 'citizen' || v === 'officer' ? v : 'both'; } catch { return 'both'; }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(initial);
  const setRole = (r: Role) => {
    setRoleState(r);
    try { localStorage.setItem(KEY, r); } catch { /* keep in memory */ }
  };
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole(): Ctx {
  const c = useContext(RoleContext);
  if (!c) throw new Error('useRole must be used inside RoleProvider');
  return c;
}
