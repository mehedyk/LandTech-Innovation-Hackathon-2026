import { BarList, Hero, Icon, Panel, Ring, Segments, Stat, StatGrid, Steps, ctaBtn, useNum, type DTone } from '../components/dash.tsx';
import { SeverityChip } from '../components/ui.tsx';
import type { Alert, RuleId } from '../engine/types.ts';
import { ruleTitle } from '../lib/alerts.ts';
import { useDecisions } from '../lib/decisions.ts';
import { useLang } from '../lib/i18n.tsx';
import { AS_OF, deedByUid, mouzaOf, seed } from '../lib/registry.ts';
import { ROLE_CHECKPOINT, useAuth, type Role } from '../lib/role.tsx';
import { alertsFor, benchmark, byMouza, byRule, decidedCount, flaggedDeeds, khasParcels, mutationCounts, queue } from '../lib/stats.ts';

const SERIOUS: RuleId[] = ['INVALID_QR_OR_SIGNATURE', 'OVERLAPPING_SALE', 'SHARE_OVERRUN', 'KHAS_CONFLICT', 'SELLER_NOT_RECORDED_OWNER'];

function Cta({ href, icon, children, ghost }: { href: string; icon: string; children: string; ghost?: boolean }) {
  return <a className={ctaBtn} data-ghost={ghost ? '' : undefined} href={href}><Icon name={icon} size={18} />{children}</a>;
}

function Queue({ alerts }: { alerts: Alert[] }) {
  const { t, lang } = useLang();
  const num = useNum();
  const rows = alerts.slice(0, 5);
  if (!rows.length) return <p>{t('dash.sec.queueEmpty')}</p>;
  return (
    <>
      <ul className="ag-queue">
        {rows.map((a) => {
          const d = deedByUid.get(a.record);
          return (
            <li key={`${a.record}:${a.rule}`}>
              <SeverityChip severity={a.severity} />
              <span className="ag-queue-main"><b>{ruleTitle(a.rule, lang)}</b><small>{d?.deed_no} · {mouzaOf(d?.mouza_id ?? '')?.name}</small></span>
              <a className="ag-queue-go" href={`#/cases/${a.lineage}`} aria-label={t('v.openParcel', { id: a.lineage })}>{a.lineage}<Icon name="arrow" size={16} /></a>
            </li>
          );
        })}
      </ul>
      <p className="ag-queue-more"><a href="#/alerts">{t('dash.queue.all')}</a> · {num(alerts.length)}</p>
    </>
  );
}

/** Cards for one office: the alerts of its own checkpoint, its queue and its progress. */
function OfficeBoard({ role }: { role: 'sub_registrar' | 'ac_land' }) {
  const { t, lang } = useLang();
  const num = useNum();
  const [decisions] = useDecisions();
  const mine = alertsFor(ROLE_CHECKPOINT[role]);
  const open = queue(mine, decisions);
  const done = decidedCount(mine, decisions);
  const holds = mine.filter((a) => a.severity === 'block').length;
  const rules = byRule(mine).map((r) => ({ label: ruleTitle(r.rule, lang), value: r.n, tone: (r.hold ? 'bad' : 'warn') as DTone }));
  const muts = mutationCounts();

  return (
    <>
      <StatGrid>
        <Stat icon="alerts" label={t('dash.s.open')} value={num(open.length)} hint={t('dash.h.ofTotal', { n: mine.length })} tone="warn" />
        <Stat icon="check" label={t('dash.s.hold')} value={num(holds)} tone="bad" />
        {role === 'sub_registrar'
          ? <Stat icon="doc" label={t('dash.s.clear')} value={num(seed.deeds.length - flaggedDeeds(mine))} hint={t('dash.h.deeds', { n: seed.deeds.length })} tone="ok" />
          : <Stat icon="clock" label={t('dash.s.pending')} value={num(muts.pending ?? 0)} hint={t('dash.h.ofTotal', { n: seed.mutations.length })} tone="warn" />}
        {role === 'sub_registrar'
          ? <Stat icon="tick" label={t('dash.s.decided')} value={num(done)} hint={t('dash.h.ofTotal', { n: mine.length })} tone="ok" />
          : <Stat icon="land" label={t('dash.s.khas')} value={num(khasParcels())} hint={t('dash.h.ofTotal', { n: seed.parcel_lineages.length })} tone="neutral" />}
      </StatGrid>
      <div className="ag-dash-cols">
        <Panel title={t('dash.sec.queue')} className="ag-col-wide"><Queue alerts={open} /></Panel>
        <Panel title={t('dash.sec.progress')}><Ring value={done} max={mine.length} label={t('dash.s.decided')} /></Panel>
        <Panel title={t('dash.sec.byRule')} className="ag-col-wide"><BarList rows={rules} /></Panel>
        {role === 'ac_land' && (
          <Panel title={t('dash.sec.mutations')}>
            <Segments parts={[
              { label: t('dash.mut.approved'), value: muts.approved ?? 0, tone: 'ok' },
              { label: t('dash.mut.pending'), value: muts.pending ?? 0, tone: 'warn' },
              { label: t('dash.mut.rejected'), value: muts.rejected ?? 0, tone: 'bad' },
            ]} />
          </Panel>
        )}
      </div>
    </>
  );
}

function AdminBoard() {
  const { t, lang } = useLang();
  const num = useNum();
  const [decisions] = useDecisions();
  const all = alertsFor(null);
  const holds = all.filter((a) => a.severity === 'block').length;
  const done = decidedCount(all, decisions);
  const bm = benchmark();
  const pre = alertsFor('pre-registration').length;
  const mut = alertsFor('pre-mutation').length;
  const mouzas = byMouza(all).map((m) => ({ label: mouzaOf(m.mouza)?.name ?? m.mouza, value: m.n, tone: (m.hold ? 'bad' : 'warn') as DTone }));
  const rules = byRule(all).map((r) => ({ label: ruleTitle(r.rule, lang), value: r.n, tone: (r.hold ? 'bad' : 'warn') as DTone }));
  return (
    <>
      <p className="ag-dash-note"><Icon name="eye" size={18} /> {t('dash.readOnly')}</p>
      <StatGrid>
        <Stat icon="alerts" label={t('dash.s.total')} value={num(all.length)} tone="warn" />
        <Stat icon="check" label={t('dash.s.holdRate')} value={`${num(Math.round((flaggedDeeds(all.filter((a) => a.severity === 'block')) / seed.deeds.length) * 100))}%`} hint={`${t('dash.h.deeds', { n: seed.deeds.length })}`} tone="bad" />
        <Stat icon="tick" label={t('dash.s.decRate')} value={`${num(Math.round((done / Math.max(1, all.length)) * 100))}%`} hint={`${num(done)}/${num(all.length)}`} tone="ok" />
        <Stat icon="benchmark" label={t('dash.s.bench')} value={`${num(bm.detected)}/${num(bm.labelled_anomalies)}`} hint={t('dash.s.benchHint', { n: bm.labelled_anomalies - bm.evaluable })} tone="ok" />
      </StatGrid>
      <div className="ag-dash-cols">
        <Panel title={t('dash.sec.cp')}>
          <Segments parts={[
            { label: t('cp.pre-registration'), value: pre, tone: 'ok' },
            { label: t('cp.pre-mutation'), value: mut, tone: 'warn' },
          ]} />
        </Panel>
        <Panel title={t('dash.sec.progress')}><Ring value={done} max={all.length} label={t('dash.s.decided')} /></Panel>
        <Panel title={t('dash.sec.mouza')} className="ag-col-wide"><BarList rows={mouzas} /></Panel>
        <Panel title={t('dash.sec.byRule')} className="ag-col-wide"><BarList rows={rules} /></Panel>
      </div>
    </>
  );
}

function CitizenBoard() {
  const { t, lang } = useLang();
  return (
    <>
      <Panel title={t('dash.steps.title')}><Steps items={[t('dash.step1'), t('dash.step2'), t('dash.step3')]} /></Panel>
      <div className="ag-dash-cols">
        <Panel title={t('dash.guide.title')} className="ag-col-wide">
          <ul className="ag-guide">
            {(['hold', 'review', 'clear'] as const).map((k) => (
              <li key={k} data-tone={k === 'hold' ? 'bad' : k === 'review' ? 'warn' : 'ok'}><i /> <span>{t(`dash.guide.${k}`)}</span></li>
            ))}
          </ul>
        </Panel>
        <Panel title={t('dash.checks.title')}>
          <ul className="ag-checks">{SERIOUS.map((r) => <li key={r}><Icon name="tick" size={16} /> {ruleTitle(r, lang)}</li>)}</ul>
        </Panel>
      </div>
    </>
  );
}

const CTAS: Record<Role, { href: string; icon: string; key: string; ghost?: boolean }[]> = {
  citizen: [{ href: '#/buy', icon: 'buy', key: 'dash.cta.buy' }],
  sub_registrar: [{ href: '#/check', icon: 'check', key: 'dash.cta.check' }, { href: '#/alerts', icon: 'alerts', key: 'dash.cta.alerts', ghost: true }],
  ac_land: [{ href: '#/alerts', icon: 'alerts', key: 'dash.cta.alerts' }, { href: '#/cases', icon: 'cases', key: 'dash.cta.parcels', ghost: true }],
  admin: [{ href: '#/alerts', icon: 'alerts', key: 'dash.cta.alerts' }, { href: '#/split', icon: 'split', key: 'dash.cta.split', ghost: true }, { href: '#/benchmark', icon: 'benchmark', key: 'dash.cta.bench', ghost: true }],
};

export default function Dashboard() {
  const { t, lang } = useLang();
  const { account } = useAuth();
  if (!account) return null;
  const { role } = account;
  return (
    <div className="ag-dash">
      <Hero eyebrow={`${t(`role.${role}`)} · ${t(`office.${role}`)}`} title={t('dash.hello', { name: account.name[lang === 'bn' ? 0 : 1] })}
        sub={t(`dash.intro.${role}`)} meta={t('dash.asOf', { date: AS_OF })}>
        {CTAS[role].map((c) => <Cta key={c.key} href={c.href} icon={c.icon} ghost={c.ghost}>{t(c.key)}</Cta>)}
      </Hero>
      {role === 'citizen' ? <CitizenBoard /> : role === 'admin' ? <AdminBoard /> : <OfficeBoard role={role} />}
    </div>
  );
}
