import type { Alert, RuleId } from '../engine/types.ts';
import { format, shareText, type Lang } from './strings.ts';

const REASONS: Record<string, string> = { 'missing dag schedule / DCR': 'reason.dcr' };

export const ruleTitle = (rule: RuleId, lang: Lang) => format(lang, `rule.${rule}.title`);
export const rulePlain = (rule: RuleId, lang: Lang) => format(lang, `rule.${rule}.plain`);

/** The officer-facing reason for an alert, phrased in the chosen language from the alert's structured facts. */
export function describe(a: Alert, lang: Lang): string {
  const p: Record<string, string | number> = { ...a.params };
  if (typeof p.share === 'string') p.share = shareText(lang, p.share);
  if (typeof p.survey === 'string') p.survey = format(lang, `survey.${p.survey}`);
  if (a.rule === 'INVALID_QR_OR_SIGNATURE') {
    const parts = [p.qr ? format(lang, 'msg.qr.qr') : '', p.sig ? format(lang, 'msg.qr.sig') : ''].filter(Boolean);
    p.what = parts.join(format(lang, 'msg.qr.and'));
  }
  if (a.rule === 'DATA_NOT_VERIFIABLE')
    p.what = (['plot', 'area', 'date', 'future', 'dup'] as const).filter((k) => p[k]).map((k) => format(lang, `msg.dnv.${k}`)).join('; ');
  if (a.rule === 'OVERLAPPING_SALE') p.note = p.rejected ? ` ${format(lang, 'msg.OVERLAPPING_SALE.rej', { deeds: p.rejected })}` : '';
  if (a.rule === 'REJECTED_THEN_RESUBMITTED' && typeof p.reason === 'string') {
    const key = REASONS[p.reason];
    p.reason = key ? format(lang, key) : p.reason;
  }
  // Resale before mutation (the seller bought it and the record has not caught up) has its own wording.
  const key = a.rule === 'SELLER_NOT_RECORDED_OWNER' && p.via ? 'msg.SELLER_NOT_RECORDED_OWNER.pending' : `msg.${a.rule}`;
  return format(lang, key, p);
}

/** The citizen-facing reason: short, no names and no details of other people's deeds. */
const CITIZEN_RULES = new Set<string>(['OVERLAPPING_SALE', 'SHARE_OVERRUN', 'KHAS_CONFLICT', 'SELLER_NOT_RECORDED_OWNER', 'INVALID_QR_OR_SIGNATURE', 'DATA_NOT_VERIFIABLE']);
export function describeCitizen(a: Alert, lang: Lang): string {
  // Never mentions the earlier deed that explains a pending resale: that belongs to someone else.
  if (a.rule === 'SELLER_NOT_RECORDED_OWNER' && a.params.via) return format(lang, 'cit.SELLER_PENDING');
  return format(lang, CITIZEN_RULES.has(a.rule) ? `cit.${a.rule}` : 'cit.mutation');
}
