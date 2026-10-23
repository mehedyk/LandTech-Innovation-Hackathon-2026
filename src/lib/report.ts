// Builds the downloadable documents. Pure functions: no DOM, no registry import, so they can be tested in Node.
import type { Alert, Khatian } from '../engine/types.ts';
import { describe, describeCitizen, rulePlain, ruleTitle } from './alerts.ts';
import { checkRows, passedCount, worstOf } from './summary.ts';
import { format, shareText, toBn, type Lang } from './strings.ts';

export type Pt = [number, number];
/** Schematic outline data for the report map. Neighbour ids are given only for the officer report. */
export type ReportMap = {
  view: { x: number; y: number; w: number; h: number };
  rs: Pt[]; bs: Pt[]; label: Pt;
  neighbours: { id?: string; rs: Pt[]; label: Pt }[];
};

export type ReportInput = {
  lang: Lang;
  mode: 'officer' | 'citizen';
  id: string;
  asOf: string;
  generated: string;
  fontUrl?: string;
  parcel: { id: string; mouza: string; upazila: string; district: string; area: number };
  chain: Khatian[];
  /** Citizen reports list only where the typed name appears, never the other owners. */
  seller: { name: string; share: string | null };
  buyer: string;
  areaSold: number;
  date: string;
  qr: boolean;
  sig: boolean;
  alerts: Alert[];
  map?: ReportMap;
};

export const esc = (s: string | number) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const num = (lang: Lang, x: string | number) => (lang === 'bn' ? toBn(x) : String(x));

/** Only a plain http(s) URL without quotes or brackets may go into the stylesheet. */
const safeUrl = (u?: string) => (u && /^https?:\/\/[\w.:/-]+$/.test(u) ? u : undefined);
/** The report is static: no scripts, no network except the font, images only as data URIs. */
const CSP = (fontUrl?: string) => {
  const u = safeUrl(fontUrl);
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src ${u ? new URL(u).origin : "'none'"}; base-uri 'none'; form-action 'none'">`;
};
const CSS = (fontUrl?: string) => `
${safeUrl(fontUrl) ? `@font-face{font-family:'Kalpurush';src:url('${safeUrl(fontUrl)}') format('truetype')}` : ''}
*{box-sizing:border-box}
body{margin:0;background:#f8fafc;color:#334155;font:15px/1.7 'Inter','Kalpurush','Noto Sans Bengali','Nirmala UI',system-ui,sans-serif}
main{max-width:860px;margin:0 auto;padding:28px 20px 40px}
header{border-top:6px solid #006a4e;background:#fff;border:1px solid #cbd5e1;border-top:6px solid #006a4e;border-radius:8px;padding:18px 22px}
.brand{font-weight:700;color:#006a4e;letter-spacing:.02em}
h1{margin:.2rem 0 .3rem;font-size:24px;color:#0f172a;line-height:1.35}
h2{margin:26px 0 8px;font-size:17px;color:#0f172a}
.meta{margin:0;font-size:13px;color:#475569}
.verdict{margin-top:16px;border:1.5px solid;border-left-width:8px;border-radius:8px;padding:12px 18px}
.verdict h2{margin:0;font-size:20px}.verdict p{margin:.25rem 0 0}
.block{background:#fee2e2;border-color:#b91c1c;color:#7f1d1d}.review{background:#fef3c7;border-color:#b45309;color:#78350f}.clear{background:#dcfce7;border-color:#15803d;color:#14532d}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #cbd5e1;font-size:14px}
th,td{padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:left;vertical-align:top}
th{background:#f1f5f9;color:#334155;font-weight:600}
td.k{width:34%;color:#475569}
.pill{display:inline-block;border-radius:999px;padding:1px 10px;font-size:13px;font-weight:600;border:1px solid}
.p-pass{background:#dcfce7;color:#14532d;border-color:#86efac}.p-block{background:#fee2e2;color:#7f1d1d;border-color:#fca5a5}.p-review{background:#fef3c7;color:#78350f;border-color:#fcd34d}.p-info{background:#f1f5f9;color:#334155;border-color:#cbd5e1}
.note{margin-top:26px;border:1px solid #cbd5e1;border-left:8px solid #94a3b8;background:#f1f5f9;border-radius:8px;padding:10px 16px;font-size:13px}
@media print{body{background:#fff}main{padding:0}table,.verdict,header{break-inside:avoid}}`;

const t = (lang: Lang, key: string, p?: Record<string, string | number>) => format(lang, key, p);

const MAP_TONE = { block: ['#fee2e2', '#b91c1c'], review: ['#fef3c7', '#b45309'], clear: ['#dcfce7', '#15803d'] } as const;
const pts = (p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(' ');

/** Static SVG of the schematic parcel map for the reports. Colours are fixed so it prints the same everywhere. */
export function mapSvg(m: ReportMap, tone: 'block' | 'review' | 'clear', label: string, areaLabel: string): string {
  const [fill, stroke] = MAP_TONE[tone];
  const nb = m.neighbours.map((n) => `<polygon points="${pts(n.rs)}" fill="#fff" stroke="#cbd5e1" stroke-width=".5"/>${n.id ? `<text x="${n.label[0]}" y="${n.label[1]}" text-anchor="middle" font-size="3.2" fill="#475569">${esc(n.id)}</text>` : ''}`).join('');
  return `<svg viewBox="${m.view.x} ${m.view.y} ${m.view.w} ${m.view.h}" role="img" aria-label="${esc(label)}" style="width:100%;max-width:360px;height:auto;border:1px solid #cbd5e1;border-radius:18px 8px 18px 8px;background:#f1f5f9">`
    + nb
    + `<polygon points="${pts(m.rs)}" fill="${fill}" stroke="${stroke}" stroke-width=".9" stroke-linejoin="round"/>`
    + `<polygon points="${pts(m.bs)}" fill="none" stroke="#0f172a" stroke-width=".5" stroke-dasharray="1.6 1.1"/>`
    + `<text x="${m.label[0]}" y="${m.label[1] - 1}" text-anchor="middle" font-size="4.4" font-weight="700" fill="#0f172a">${esc(label)}</text>`
    + `<text x="${m.label[0]}" y="${m.label[1] + 4.5}" text-anchor="middle" font-size="3.4" fill="#334155">${esc(areaLabel)}</text></svg>`;
}

/** Verdict heading and sentence, worded for the officer or for the buyer. */
export function verdictText(lang: Lang, mode: 'officer' | 'citizen', alerts: Alert[]) {
  const worst = worstOf(alerts);
  if (mode === 'citizen') {
    return { worst, head: t(lang, worst === 'block' ? 'buy.block' : worst === 'review' ? 'buy.review' : 'buy.clear'), sub: t(lang, worst ? 'buy.blockSub' : 'buy.clearSub') };
  }
  const head = t(lang, worst === 'block' ? 'v.block' : worst === 'review' ? 'v.review' : 'v.clear');
  const sub = worst ? (alerts.length === 1 ? t(lang, 'v.sub1') : t(lang, 'v.subN', { n: alerts.length })) : t(lang, 'v.subClear');
  return { worst, head, sub };
}

const reasonOf = (a: Alert | undefined, lang: Lang, mode: 'officer' | 'citizen') =>
  !a ? '' : mode === 'citizen' ? describeCitizen(a, lang) : describe(a, lang);

export function checkReportHtml(i: ReportInput): string {
  const L = i.lang;
  const rows = checkRows(i.alerts);
  const { worst, head, sub } = verdictText(L, i.mode, i.alerts);
  const tone = worst ?? 'clear';
  const yes = (b: boolean) => t(L, b ? 'rep.yes' : 'rep.no');
  const kv = (k: string, v: string) => `<tr><td class="k">${esc(k)}</td><td>${esc(v)}</td></tr>`;
  const inputs = [
    kv(t(L, 'f.parcel'), t(L, 'cases.row', { id: i.parcel.id, mouza: i.parcel.mouza, area: i.parcel.area })),
    kv(t(L, 'party.seller'), i.seller.name + (i.seller.share ? (i.mode === 'officer' ? ` (${t(L, 'party.share')}: ${shareText(L, i.seller.share)})` : ` (${t(L, 'buy.onRecordYes')})`) : ` (${t(L, 'party.notOnRecord')})`)),
    ...(i.mode === 'officer' ? [kv(t(L, 'party.buyer'), i.buyer)] : []),
    kv(t(L, 'xfer.area'), t(L, 'chain.areaVal', { area: i.areaSold })),
    ...(i.mode === 'officer' ? [kv(t(L, 'f.date'), i.date), kv(t(L, 'f.qr'), yes(i.qr)), kv(t(L, 'f.sig'), yes(i.sig))] : [kv(t(L, 'buy.qr'), yes(i.qr))]),
  ].join('');
  const checks = rows.map((r) => {
    const title = ruleTitle(r.rule, L);
    const pill = r.status === 'pass' ? `<span class="pill p-pass">${esc(t(L, 'chk.pass'))}</span>` : `<span class="pill p-${r.severity}">${esc(t(L, `sev.${r.severity}`))}</span>`;
    const detail = r.status === 'pass' ? rulePlain(r.rule, L) : reasonOf(r.alert, L, i.mode);
    const ev = i.mode === 'officer' && r.alert ? r.alert.evidence.filter((e) => e !== 'NEW-CHECK') : [];
    return `<tr><td><b>${esc(title)}</b></td><td>${pill}</td><td>${esc(detail)}${ev.length ? `<br><small>${esc(t(L, 'v.evidence', { list: ev.join(', ') }))}</small>` : ''}</td></tr>`;
  }).join('');
  const chain = i.mode === 'officer'
    ? `<table><tr><th>${esc(t(L, 'rep.th.survey'))}</th><th>${esc(t(L, 'chain.khatianLbl'))}</th><th>${esc(t(L, 'chain.plotLbl'))}</th><th>${esc(t(L, 'chain.area'))}</th><th>${esc(t(L, 'chain.class'))}</th><th>${esc(t(L, 'chain.owners'))}</th></tr>${
        i.chain.map((k) => `<tr><td>${esc(t(L, `survey.${k.survey}`))} · ${esc(num(L, k.survey_year))}</td><td>${esc(num(L, k.khatian_no))}</td><td>${esc(num(L, k.plot_no))}</td><td>${esc(t(L, 'chain.areaVal', { area: k.area_dec }))}</td><td>${esc(landClass(L, k.land_class))}</td><td>${esc(k.owners.map((o) => `${o.name} (${shareText(L, o.share)})`).join('; '))}</td></tr>`).join('')}</table>`
    : '';
  const title = t(L, i.mode === 'citizen' ? 'rep.doc.citizenTitle' : 'rep.doc.title');
  return `<!doctype html><html lang="${L}"><head><meta charset="utf-8">${CSP(i.fontUrl)}<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · ${esc(i.id)}</title><style>${CSS(i.fontUrl)}</style></head><body><main>
<header><div class="brand">Ardh Guard</div><h1>${esc(title)}</h1>
<p class="meta">${esc(t(L, 'rep.id'))}: <b>${esc(i.id)}</b> · ${esc(t(L, 'rep.asOf', { date: i.asOf }))} · ${esc(t(L, 'rep.generated'))}: ${esc(i.generated)}</p></header>
<section class="verdict ${tone}"><h2>${esc(head)}</h2><p>${esc(sub)}</p></section>
<h2>${esc(t(L, 'rep.doc.inputs'))}</h2><table>${inputs}</table>
<h2>${esc(t(L, 'sec.checks'))} · ${esc(t(L, 'tile.checksOf', { n: passedCount(rows), total: rows.length }))}</h2>
<table><tr><th>${esc(t(L, 'rep.th.check'))}</th><th>${esc(t(L, 'rep.th.status'))}</th><th>${esc(t(L, 'rep.th.detail'))}</th></tr>${checks}</table>
${i.map ? `<h2>${esc(t(L, 'sec.map'))}</h2>${mapSvg(i.map, tone, i.parcel.id, t(L, 'chain.areaVal', { area: i.parcel.area }))}<p class="meta">${esc(t(L, 'rep.mapLegend'))} ${esc(t(L, 'map.note'))}</p>` : ''}
<h2>${esc(t(L, i.mode === 'officer' ? 'sec.chain' : 'buy.record'))}</h2>
<p class="meta">${esc(t(L, 'chain.parcel', { id: i.parcel.id, mouza: i.parcel.mouza, upazila: i.parcel.upazila, district: i.parcel.district, area: i.parcel.area }))}</p>${chain}
${i.mode === 'citizen' ? `<h2>${esc(t(L, 'buy.next'))}</h2><ol>${['buy.next1', 'buy.next2', 'buy.next3', 'buy.next4'].map((k) => `<li>${esc(t(L, k))}</li>`).join('')}</ol>` : ''}
<p class="note">${esc(t(L, 'rep.notice'))}</p></main></body></html>`;
}

export const landClass = (lang: Lang, c: string) => { const k = `land.${c}`; const s = format(lang, k); return s === k ? c : s; };

export function checkReportJson(i: ReportInput): string {
  const rows = checkRows(i.alerts);
  const v = verdictText(i.lang, i.mode, i.alerts);
  return JSON.stringify({
    report_id: i.id, kind: i.mode === 'officer' ? 'deed_check' : 'buyer_check', language: i.lang, records_as_of: i.asOf, generated: i.generated,
    notice: t(i.lang, 'rep.notice'),
    verdict: { level: v.worst ?? 'clear', headline: v.head },
    parcel: i.parcel,
    ...(i.map ? { parcel_map: { schematic: true, note: t(i.lang, 'map.note'), view: i.map.view, rs_outline: i.map.rs, bs_outline: i.map.bs } } : {}),
    inputs: i.mode === 'officer'
      ? { seller: i.seller.name, seller_share_on_record: i.seller.share, buyer: i.buyer, area_sold_dec: i.areaSold, deed_date: i.date, qr_verified: i.qr, signature_matches: i.sig }
      : { seller: i.seller.name, seller_share_on_record: i.seller.share, area_sold_dec: i.areaSold, qr_verified: i.qr },
    checks: rows.map((r) => ({
      rule: r.rule, title: ruleTitle(r.rule, i.lang), status: r.status, severity: r.severity ?? null,
      reason: r.status === 'flag' ? reasonOf(r.alert, i.lang, i.mode) : null,
      evidence: i.mode === 'officer' && r.alert ? r.alert.evidence.filter((e) => e !== 'NEW-CHECK') : [],
    })),
    ...(i.mode === 'officer' ? { record_chain: i.chain.map((k) => ({ survey: k.survey, year: k.survey_year, khatian_no: k.khatian_no, plot_no: k.plot_no, area_dec: k.area_dec, land_class: k.land_class, owners: k.owners.map((o) => ({ name: o.name, share: o.share })) })) } : {}),
  }, null, 2);
}

export type ParcelReportInput = {
  lang: Lang; generated: string; asOf: string; fontUrl?: string;
  parcel: { id: string; mouza: string; upazila: string; district: string; area: number };
  chain: Khatian[];
  map?: ReportMap; tone?: 'block' | 'review' | 'clear';
  deeds: { head: string; line: string; flags: string[]; alerts: { title: string; sev: string; sevText: string; text: string }[] }[];
};

export function parcelReportHtml(i: ParcelReportInput): string {
  const L = i.lang;
  const chain = `<table><tr><th>${esc(t(L, 'rep.th.survey'))}</th><th>${esc(t(L, 'chain.khatianLbl'))}</th><th>${esc(t(L, 'chain.plotLbl'))}</th><th>${esc(t(L, 'chain.area'))}</th><th>${esc(t(L, 'chain.class'))}</th><th>${esc(t(L, 'chain.owners'))}</th></tr>${
    i.chain.map((k) => `<tr><td>${esc(t(L, `survey.${k.survey}`))} · ${esc(num(L, k.survey_year))}</td><td>${esc(num(L, k.khatian_no))}</td><td>${esc(num(L, k.plot_no))}</td><td>${esc(t(L, 'chain.areaVal', { area: k.area_dec }))}</td><td>${esc(landClass(L, k.land_class))}</td><td>${esc(k.owners.map((o) => `${o.name} (${shareText(L, o.share)})`).join('; '))}</td></tr>`).join('')}</table>`;
  const deeds = i.deeds.length === 0 ? `<p>${esc(t(L, 'cases.noDeeds'))}</p>` : i.deeds.map((d) =>
    `<table style="margin-bottom:12px"><tr><th>${esc(d.head)}</th></tr><tr><td>${esc(d.line)}<br>${d.flags.map((f) => `<span class="pill p-info">${esc(f)}</span> `).join('')}${
      d.alerts.map((a) => `<br><span class="pill p-${a.sev}">${esc(a.sevText)}</span> <b>${esc(a.title)}</b>: ${esc(a.text)}`).join('')}</td></tr></table>`).join('');
  return `<!doctype html><html lang="${L}"><head><meta charset="utf-8">${CSP(i.fontUrl)}<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t(L, 'cases.detailTitle', { id: i.parcel.id }))}</title><style>${CSS(i.fontUrl)}</style></head><body><main>
<header><div class="brand">Ardh Guard</div><h1>${esc(t(L, 'cases.detailTitle', { id: i.parcel.id }))}</h1>
<p class="meta">${esc(t(L, 'chain.parcel', { id: i.parcel.id, mouza: i.parcel.mouza, upazila: i.parcel.upazila, district: i.parcel.district, area: i.parcel.area }))}<br>${esc(t(L, 'rep.asOf', { date: i.asOf }))} · ${esc(t(L, 'rep.generated'))}: ${esc(i.generated)}</p></header>
${i.map ? `<h2>${esc(t(L, 'sec.map'))}</h2>${mapSvg(i.map, i.tone ?? 'clear', i.parcel.id, t(L, 'chain.areaVal', { area: i.parcel.area }))}<p class="meta">${esc(t(L, 'rep.mapLegend'))} ${esc(t(L, 'map.note'))}</p>` : ''}<h2>${esc(t(L, 'sec.chain'))}</h2>${chain}<h2>${esc(t(L, 'cases.deedsTitle'))}</h2>${deeds}
<p class="note">${esc(t(L, 'rep.notice'))}</p></main></body></html>`;
}
