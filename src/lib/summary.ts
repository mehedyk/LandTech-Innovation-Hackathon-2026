import type { Alert, RuleId, Severity } from '../engine/types.ts';

/** The five checks that apply to a new deed before registration (the same five the How it works page lists). */
export const PRE_REG: RuleId[] = ['OVERLAPPING_SALE', 'SHARE_OVERRUN', 'KHAS_CONFLICT', 'SELLER_NOT_RECORDED_OWNER', 'INVALID_QR_OR_SIGNATURE'];

export type CheckRow = { rule: RuleId; status: 'pass' | 'flag'; severity?: Severity; alert?: Alert };

/** One row per pre-registration check: passed, or flagged with the alert that flagged it. */
export function checkRows(alerts: Alert[]): CheckRow[] {
  return PRE_REG.map((rule) => {
    const alert = alerts.find((a) => a.rule === rule);
    return alert ? { rule, status: 'flag', severity: alert.severity, alert } : { rule, status: 'pass' };
  });
}

export const worstOf = (alerts: Alert[]): 'block' | 'review' | null =>
  alerts.some((a) => a.severity === 'block') ? 'block' : alerts.some((a) => a.severity === 'review') ? 'review' : null;

export const passedCount = (rows: CheckRow[]) => rows.filter((r) => r.status === 'pass').length;

/** Short, stable reference for one check (FNV-1a over its inputs). It identifies a check run; it is not a certificate or a signature. */
export function reportId(parts: (string | number | boolean)[]): string {
  let h = 0x811c9dc5;
  for (const ch of parts.join('|')) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `ARDH-${h.toString(16).toUpperCase().padStart(8, '0')}`;
}

/** CSV that opens correctly in Excel, including Bangla (UTF-8 BOM, CRLF, quoted fields). */
export function toCsv(rows: (string | number)[][]): string {
  const cell = (v: string | number) => { const s = String(v); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}
