import { Chip, PageTitle, link } from '../components/ui.tsx';
import { evaluate } from '../engine/evaluate.ts';
import { RULES, baseAlerts, seed } from '../lib/registry.ts';

const result = evaluate(seed, baseAlerts);
const human = (s: string) => s.replace(/_/g, ' ');

export default function Benchmark() {
  const r = result;
  return (
    <>
      <PageTitle title="Benchmark on dummy data">
        The seed registry has {r.labelled_anomalies} planted anomalies. This page shows which ones the rules caught.
      </PageTitle>
      <p className="max-w-2xl text-lg text-ink">
        Caught {r.detected} of {r.evaluable} testable anomalies. Flagged {r.deeds_flagged} of {r.deeds_total} deeds, and none of them were outside the planted cases.
      </p>
      <div role="note" className="my-6 max-w-2xl rounded border-l-8 border-caution bg-caution-soft p-4 text-caution">
        <p className="font-semibold">Read this before quoting the numbers</p>
        <p className="mt-1">The data is small and made up, and the rules were written knowing how it was generated. This is a regression test that the rules do what we designed. It is not a measure of accuracy on real records.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink text-ink">
              <th className="py-2 pr-4">Parcel</th><th className="py-2 pr-4">Planted anomaly</th><th className="py-2 pr-4">Rules that fired</th><th className="py-2">Result</th>
            </tr>
          </thead>
          <tbody>
            {r.per_anomaly.map((row) => (
              <tr key={row.lineage} className="border-b border-line align-top">
                <td className="py-3 pr-4"><a className={link} href={`#/cases/${row.lineage}`}>{row.lineage}</a></td>
                <td className="py-3 pr-4">{human(row.anomaly)}</td>
                <td className="py-3 pr-4">{row.rules.length ? row.rules.map((x) => RULES[x].title).join(', ') : 'None'}</td>
                <td className="py-3">{!row.evaluable ? <Chip>Not testable</Chip> : row.detected ? <Chip ok>Caught</Chip> : <Chip ok={false}>Missed</Chip>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-2xl text-sm">
        Not testable: the chain-break case. In this seed every parcel has different owners in each survey with no deeds explaining the change, so the rule would flag every parcel. Fixing the seed is on the roadmap.
      </p>
    </>
  );
}
