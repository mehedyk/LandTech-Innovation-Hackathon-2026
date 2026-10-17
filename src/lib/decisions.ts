import { useState } from 'react';

export type Decision = 'hold' | 'dismiss' | 'escalate';
export const DECISION_LABEL: Record<Decision, string> = { hold: 'Hold confirmed', dismiss: 'Dismissed', escalate: 'Escalated' };
const KEY = 'ardh.decisions.v1';

function load(): Record<string, Decision> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; }
}

/** Officer decisions are saved in this browser only (Supabase persistence is on the roadmap). */
export function useDecisions() {
  const [map, setMap] = useState<Record<string, Decision>>(load);
  const set = (key: string, value: Decision | null) => {
    const next = { ...map };
    if (value) next[key] = value; else delete next[key];
    setMap(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable: keep in memory */ }
  };
  return [map, set] as const;
}
