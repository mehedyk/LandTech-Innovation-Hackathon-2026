import { chainOf, mouzaOf, parcelOf } from '../lib/registry.ts';

/** The record chain Ardh Guard checks against: CS -> SA -> RS -> BS. The latest (BS) record is the one a new deed is compared with. */
export default function ChainStrip({ lineage }: { lineage: string }) {
  const chain = chainOf(lineage);
  const parcel = parcelOf(lineage);
  if (!parcel) return null;
  const m = mouzaOf(parcel.mouza_id);
  return (
    <section aria-label={`Record chain for parcel ${lineage}`}>
      <p className="mb-3 text-sm">
        Parcel <b className="text-ink">{lineage}</b>, {m?.name}, {m?.upazila}, {m?.district} · {parcel.area_dec} decimals
      </p>
      <ol className="grid gap-0 md:grid-cols-4">
        {chain.map((k, i) => {
          const latest = i === chain.length - 1;
          return (
            <li key={k.khatian_uid} className={`relative border-l-4 py-2 pl-4 pr-2 md:border-l-0 md:border-t-4 md:pl-0 md:pr-4 md:pt-3 ${latest ? 'border-brand' : 'border-line'}`}>
              <p className="font-semibold text-ink">
                {k.survey} <span className="font-normal">· {k.survey_year}</span>
              </p>
              <p className="text-sm">Khatian {k.khatian_no} · plot {k.plot_no}</p>
              <ul className="mt-1 text-sm">
                {k.owners.map((o) => (
                  <li key={o.party_id}>
                    {o.name} <span className="text-body/70">({o.share})</span>
                  </li>
                ))}
              </ul>
              {latest && <p className="mt-1 text-sm font-medium text-brand">Latest record: new deeds are checked against this</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
