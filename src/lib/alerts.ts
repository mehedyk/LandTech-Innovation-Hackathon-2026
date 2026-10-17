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
  if (a.rule === 'REJECTED_THEN_RESUBMITTED' && typeof p.reason === 'string') {
    const key = REASONS[p.reason];
    p.reason = key ? format(lang, key) : p.reason;
  }
  return format(lang, `msg.${a.rule}`, p);
}

/** The citizen-facing reason: short, no names and no details of other people's deeds. */
export function describeCitizen(a: Alert, lang: Lang): string {
  const key = `cit.${a.rule}`;
  return format(lang, key in { 'cit.OVERLAPPING_SALE': 1, 'cit.SHARE_OVERRUN': 1, 'cit.KHAS_CONFLICT': 1, 'cit.SELLER_NOT_RECORDED_OWNER': 1, 'cit.INVALID_QR_OR_SIGNATURE': 1 } ? key : 'cit.mutation');
}
