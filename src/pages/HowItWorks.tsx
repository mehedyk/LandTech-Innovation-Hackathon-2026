import { PageTitle, SeverityChip, link } from '../components/ui.tsx';
import type { RuleId, Severity } from '../engine/types.ts';
import { RULES } from '../lib/registry.ts';

const FLOW = [
  { t: 'A deed or mutation request arrives', d: 'The officer enters it, or it is already in the registry.' },
  { t: 'Ardh Guard compares it', d: 'With the record chain (CS, SA, RS, BS), earlier deeds by the same seller, and mutation history.' },
  { t: 'It raises alerts with reasons', d: 'Each alert says what is wrong in plain language and lists the records to open.' },
  { t: 'An officer decides', d: 'Confirm hold, dismiss, or escalate. Ardh Guard never decides ownership.' },
];

const CHECKS: { id: RuleId; sev: Severity; when: string; example: string; parcel?: string }[] = [
  { id: 'OVERLAPPING_SALE', sev: 'block', when: 'Before registration', example: 'Jamal Mia owns half of a parcel. He sells that half twice. The second deed pushes his total above what he owns.', parcel: 'L05' },
  { id: 'SHARE_OVERRUN', sev: 'block', when: 'Before registration', example: 'A co-owner with a half share signs a deed for the whole plot.', parcel: 'L12' },
  { id: 'KHAS_CONFLICT', sev: 'block', when: 'Before registration', example: 'The latest record lists the plot as government khas land, but a private seller is selling it.', parcel: 'L20' },
  { id: 'SELLER_NOT_RECORDED_OWNER', sev: 'block', when: 'Before registration', example: 'Someone who is not in the latest khatian tries to sell the plot. Try it on the Check a deed page with “Seller not on record”.' },
  { id: 'INVALID_QR_OR_SIGNATURE', sev: 'block', when: 'Before registration', example: 'The deed’s QR code does not verify and the signature differs from the earlier record.', parcel: 'L22' },
  { id: 'MUTATION_AREA_MISMATCH', sev: 'review', when: 'Before mutation', example: 'The deed transfers about 117 decimals but the approved mutation changed about 188.', parcel: 'L03' },
  { id: 'REGISTERED_NOT_MUTATED', sev: 'review', when: 'Before mutation', example: 'A deed was registered years ago and nobody applied for mutation, so the record still shows the old owner.', parcel: 'L14' },
  { id: 'REJECTED_THEN_RESUBMITTED', sev: 'info', when: 'Before mutation', example: 'A mutation was rejected and then filed again. Worth a look, not fraud on its own.', parcel: 'L07' },
];

export default function HowItWorks() {
  return (
    <>
      <PageTitle title="How Ardh Guard works">
        Ardh Guard is a second pair of eyes at two moments: before a deed is registered and before a mutation is approved. It checks the paperwork against the record and explains every flag.
      </PageTitle>

      <ol className="grid gap-0 md:grid-cols-4" aria-label="How a check flows">
        {FLOW.map((f, i) => (
          <li key={f.t} className="border-l-4 border-brand py-2 pl-4 pr-3 md:border-l-0 md:border-t-4 md:pl-0 md:pt-3">
            <p className="text-sm font-medium text-brand">Step {i + 1}</p>
            <p className="font-semibold text-ink">{f.t}</p>
            <p className="mt-1 text-sm">{f.d}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold">Two checkpoints</h2>
          <p className="mt-2"><b className="text-ink">Before registration</b> at the sub-registry office: is the seller on the record, does the deed claim more than they own, has the land already been sold, is the document genuine.</p>
          <p className="mt-2"><b className="text-ink">Before mutation</b> at the AC Land or Union Land office: does the mutation match the deed, and was the deed ever mutated.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Why plain rules and not a black box</h2>
          <p className="mt-2">An officer must be able to explain a refusal to a citizen. Every alert here comes from a rule that can be read, tested and challenged. A machine-learning ranking could sit on top later, but it would not replace the reasons.</p>
        </section>
      </div>

      <h2 className="mb-1 mt-12 text-xl font-semibold">The eight checks</h2>
      <p className="mb-4 max-w-2xl text-sm">Hold means the deed should not go ahead until an officer clears it. Review means look closer. Note is for information.</p>
      <ul className="divide-y divide-line border-y border-line">
        {CHECKS.map((c) => (
          <li key={c.id} className="py-4">
            <p className="flex flex-wrap items-center gap-2">
              <SeverityChip severity={c.sev} />
              <b className="text-ink">{RULES[c.id].title}</b>
              <span className="text-sm">{c.when}</span>
            </p>
            <p className="mt-1 max-w-3xl">{RULES[c.id].plain}</p>
            <p className="mt-1 max-w-3xl text-sm">
              Example: {c.example}{c.parcel && <> <a className={link} href={`#/cases/${c.parcel}`}>See parcel {c.parcel}</a></>}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 max-w-2xl rounded border-l-8 border-line bg-mist p-4">
        <h2 className="font-semibold text-ink">What Ardh Guard does not do</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>It does not decide who owns land, and it is not a legal title check.</li>
          <li>It does not change any record. Officers keep every decision.</li>
          <li>It works on made-up data only in this prototype.</li>
        </ul>
      </div>
    </>
  );
}
