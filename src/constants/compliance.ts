export const COMPLIANCE_TYPES = [
  "Gas",
  "Smoke Alarm",
  "Smoke and Electricity",
  "Minimum Compliance",
] as const;

export type ComplianceType = (typeof COMPLIANCE_TYPES)[number];
