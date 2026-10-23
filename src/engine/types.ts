export type Owner = { name: string; party_id: string; share: string };
export type Khatian = {
  khatian_uid: string; survey: 'CS' | 'SA' | 'RS' | 'BS'; mouza_id: string; khatian_no: string;
  plot_no: string; owners: Owner[]; area_dec: number; land_class: string; survey_year: number; lineage: string;
};
export type Lineage = { lineage: string; mouza_id: string; area_dec: number; cs: string; sa: string; rs: string; bs: string };
export type Deed = {
  deed_uid: string; deed_no: string; registration_date: string; sub_registry: string; mouza_id: string;
  seller: string; seller_party_id: string; buyer: string; buyer_party_id: string;
  schedule_survey: string; schedule_plot_no: string; area_sold_dec: number; share_sold: string;
  qr_valid: boolean; signature_consistent: boolean;
};
export type Mutation = {
  mutation_case: string; deed_uid: string; status: 'approved' | 'pending' | 'rejected';
  applied_on: string | null; decided_on: string | null; area_mutated_dec: number | null; note: string;
};
export type Label = { lineage: string; problem_area: string; anomaly: string; records: string[] };
export type Registry = {
  parcel_lineages: Lineage[]; khatians: Khatian[]; deeds: Deed[]; mutations: Mutation[]; anomaly_labels: Label[];
};

export type Severity = 'block' | 'review' | 'info';
export type Checkpoint = 'pre-registration' | 'pre-mutation';
export type RuleId =
  | 'INVALID_QR_OR_SIGNATURE' | 'SELLER_NOT_RECORDED_OWNER' | 'KHAS_CONFLICT'
  | 'SHARE_OVERRUN' | 'OVERLAPPING_SALE' | 'MUTATION_AREA_MISMATCH'
  | 'REGISTERED_NOT_MUTATED' | 'REJECTED_THEN_RESUBMITTED' | 'DATA_NOT_VERIFIABLE';
export type Alert = {
  rule: RuleId; severity: Severity; checkpoint: Checkpoint; record: string; lineage: string;
  message: string;      // plain-language reason shown to the officer
  evidence: string[];   // record ids the officer can open
  params: Record<string, string | number>; // structured facts, so the UI can phrase the reason in any language
};
