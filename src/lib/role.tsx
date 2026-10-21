import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Checkpoint } from '../engine/types.ts';

export type Role = 'citizen' | 'sub_registrar' | 'ac_land' | 'admin';
export type Page = 'dashboard' | 'split' | 'check' | 'buy' | 'alerts' | 'cases' | 'benchmark' | 'how' | 'about';

/**
 * Who does what in the process (see docs/PLAN.md): the sub-registrar registers the deed after checking the record of
 * rights, then the AC (Land) office completes the mutation. The two checkpoints in the engine follow the same split,
 * so each office sees the alerts for its own moment. The admin/auditor sees everything but cannot decide.
 */
export const ROLE_PAGES: Record<Role, Page[]> = {
  citizen: ['dashboard', 'buy', 'how', 'about'],
  sub_registrar: ['dashboard', 'check', 'alerts', 'cases', 'how', 'about'],
  ac_land: ['dashboard', 'alerts', 'cases', 'how', 'about'],
  admin: ['dashboard', 'split', 'check', 'buy', 'alerts', 'cases', 'benchmark', 'how', 'about'],
};
/** Pages that sit under "More" in the desktop bar. */
export const SECONDARY: Page[] = ['benchmark', 'how', 'about'];
/** Which checkpoint's alerts each office works on. `null` means both. */
export const ROLE_CHECKPOINT: Record<Role, Checkpoint | null> = {
  citizen: null, sub_registrar: 'pre-registration', ac_land: 'pre-mutation', admin: null,
};
/** Only the two offices record decisions. The auditor reads them. */
export const CAN_DECIDE: Record<Role, boolean> = { citizen: false, sub_registrar: true, ac_land: true, admin: false };

/** Demo accounts. These are shown on the sign-in page on purpose; this is a front-end demo gate, not security. */
export type Account = { role: Role; email: string; password: string; name: [string, string] };
export const ACCOUNTS: Account[] = [
  { role: 'citizen', email: 'buyer@ardh.demo', password: 'Buyer@2026', name: ['নুসরাত জাহান', 'Nusrat Jahan'] },
  { role: 'admin', email: 'auditor@ardh.demo', password: 'Audit@2026', name: ['তানভীর আহমেদ', 'Tanvir Ahmed'] },
  { role: 'ac_land', email: 'acland@ardh.demo', password: 'Land@2026', name: ['ফারহানা রহমান', 'Farhana Rahman'] },
  { role: 'sub_registrar', email: 'registrar@ardh.demo', password: 'Regis@2026', name: ['মিজানুর রহমান', 'Mizanur Rahman'] },
];

const KEY = 'ardh.session.v2';
type Ctx = {
  account: Account | null;
  role: Role | null;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
};
const AuthContext = createContext<Ctx | null>(null);

function initial(): Account | null {
  try {
    const email = localStorage.getItem(KEY);
    return ACCOUNTS.find((a) => a.email === email) ?? null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(initial);
  const signIn = (email: string, password: string) => {
    const hit = ACCOUNTS.find((a) => a.email === email.trim().toLowerCase() && a.password === password);
    if (!hit) return false;
    setAccount(hit);
    try { localStorage.setItem(KEY, hit.email); } catch { /* storage unavailable: keep in memory */ }
    return true;
  };
  const signOut = () => {
    setAccount(null);
    try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
  };
  return <AuthContext.Provider value={{ account, role: account?.role ?? null, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used inside AuthProvider');
  return c;
}

/** The signed-in role. Pages are only rendered after sign-in, so this is never null there. */
export function useRole(): Role {
  const { role } = useAuth();
  if (!role) throw new Error('useRole needs a signed-in user');
  return role;
}
