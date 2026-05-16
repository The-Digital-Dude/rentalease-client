export const COMPLIANCE_TYPES = [
  "Gas",
  "Smoke Alarm",
  "Smoke and Electricity",
  "Minimum Compliance",
] as const;

export type ComplianceType = (typeof COMPLIANCE_TYPES)[number];

export const COMPLIANCE_TYPE_LABELS: Record<ComplianceType, string> = {
  Gas: "Gas Safety Check",
  "Smoke Alarm": "Smoke Alarm",
  "Smoke and Electricity": "Electrical and Smoke Alarm",
  "Minimum Compliance": "Minimum Safety Standard",
};

export const getComplianceTypeLabel = (type: string): string =>
  COMPLIANCE_TYPE_LABELS[type as ComplianceType] || type;

export const COMPLIANCE_TYPE_VALUE_MAP: Record<string, ComplianceType> = {
  Gas: "Gas",
  "Gas Safety": "Gas",
  "Gas Safety Check": "Gas",
  Smoke: "Smoke Alarm",
  "Smoke Alarm": "Smoke Alarm",
  Electrical: "Smoke and Electricity",
  "Electrical Safety": "Smoke and Electricity",
  "Electrical and Smoke Alarm": "Smoke and Electricity",
  "Smoke and Electricity": "Smoke and Electricity",
  MinimumSafetyStandard: "Minimum Compliance",
  "Minimum Safety Standard": "Minimum Compliance",
  "Minimum Compliance": "Minimum Compliance",
};

export const normalizeComplianceType = (type: string): string =>
  COMPLIANCE_TYPE_VALUE_MAP[type] || type;
