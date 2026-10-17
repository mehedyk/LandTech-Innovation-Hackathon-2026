import ChainStrip from '../components/ChainStrip.tsx';
import { Chip, PageTitle, SeverityChip, link, tone } from '../components/ui.tsx';
import { RULES, baseAlerts, lineageOfDeed, mouzaOf, mutationsOf, parcelOf, seed } from '../lib/registry.ts';

export default function Cases({ id }: { id?: string }) {
  const parcel = id ? parcelOf(id) : undefined;
  return parcel && id ? <Detail id={id} /> : <List missing={id} />;
}

function List({ missing }: { missing?: string }) {
  const rows = seed.parcel_lineages
    .map((p) => ({ p, alerts: baseAlerts.filter((a) => a.lineage === p.lineage) }))
    .sort((a, b) => b.alerts.filter((x) => x.severity !== 'info').length - a.alerts.filter((x) => x.severity !== 'info').length || a.p.lineage.localeCompare(b.p.lineage));
  return (
    <>
      <PageTitle title="Parcels">Each parcel has its record chain (CS, SA, RS, BS), its deeds and its mutations in one place. Parcels with the most serious alerts come first.</PageTitle>
      {missing && <p role="alert" className="mb-4 rounded border border-caution bg-caution-soft p-3 text-caution">There is no parcel called {missing}. Choose one from the list.</p>}
      <ul className="divide-y divide-line border-y border-line">
        {rows.map(({ p, alerts }) => {
          const serious = alerts.filter((a) => a.severity !== 'info').length;
          return (
            <li key={p.lineage}>
              <a href={`#/cases/${p.lineage}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-mist">
                <span><b className="text-ink">{p.lineage}</b> · {mouzaOf(p.mouza_id)?.name} · {p.area_dec} dec</span>
                <span className="text-sm">{serious > 0 ? <Chip ok={false}>{serious} to look at</Chip> : alerts.length ? <Chip>Notes only</Chip> : <Chip ok>No alerts</Chip>}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Detail({ id }: { id: string }) {
  const deeds = seed.deeds.filter((d) => lineageOfDeed(d) === id).sort((a, b) => a.registration_date.localeCompare(b.registration_date));
  return (
    <>
      <p className="mb-2 text-sm"><a className={link} href="#/cases">All parcels</a></p>
      <PageTitle title={`Parcel ${id}`} />
      <ChainStrip lineage={id} />
      <h2 className="mb-3 mt-10 text-xl font-semibold">Deeds and mutations</h2>
      {deeds.length === 0 && <p>No deeds are recorded on this parcel yet. Use “Check a deed” to test one.</p>}
      <ul className="space-y-6">
        {deeds.map((d) => {
          const muts = mutationsOf(d.deed_uid);
          const alerts = baseAlerts.filter((a) => a.record === d.deed_uid);
          return (
            <li key={d.deed_uid} className="border-l-4 border-line pl-4">
              <p className="font-semibold text-ink">Deed {d.deed_no} <span className="font-normal">· {d.registration_date} · {d.sub_registry}</span></p>
              <p>{d.seller} to {d.buyer} · {d.area_sold_dec} dec ({d.share_sold})</p>
              <p className="mt-1 flex flex-wrap gap-2 text-sm">
                <Chip ok={d.qr_valid}>{d.qr_valid ? 'QR verifies' : 'QR fails'}</Chip>
                <Chip ok={d.signature_consistent}>{d.signature_consistent ? 'Signature matches' : 'Signature mismatch'}</Chip>
                {muts.length === 0 && <Chip>No mutation case</Chip>}
                {muts.map((m) => <Chip key={m.mutation_case} ok={m.status === 'approved' ? true : m.status === 'rejected' ? false : undefined}>{m.mutation_case}: {m.status}{m.area_mutated_dec ? `, ${m.area_mutated_dec} dec` : ''}</Chip>)}
              </p>
              {alerts.map((a) => (
                <div key={a.rule} className={`mt-3 border-l-4 bg-white py-2 pl-3 ${tone[a.severity].edge}`}>
                  <p className="flex flex-wrap items-center gap-2"><SeverityChip severity={a.severity} /> <b className="text-ink">{RULES[a.rule].title}</b></p>
                  <p className="mt-1 text-sm">{a.message}</p>
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </>
  );
}
