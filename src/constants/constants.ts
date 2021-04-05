export enum TimeoffTriggerFrequency {
    NEVER = 'N',
    FINANCIAL_MONTH = 'FM',
    FINANCIAL_YEAR = 'FY',
    CALENDAR_MONTH = 'CM',
    CALENDAR_YEAR = 'CY'
}

export enum Gender {
    MALE = 'M',
    FEMALE = 'F',
    OTHER = 'O'
}

export enum Frequency {
    HOURLY = 1,
    DAILY = 2,
    WEEKLY = 3,
    FORTNIGHTLY = 4,
    MONTHLY = 5,
    QUATERLY = 6,
    YEARLY = 7,
}

export enum EmploymentType {
    CASUAL = 1,
    PART_TIME = 2,
    FULL_TIME = 3,
}

export enum ProjectType {
    MILESTONE_BASE = 1,
    TIME_BASE = 2,
}

export enum ClearanceLevel {
  BASELINE_VETTING = 'BV',
  NEGATIVE_VETTING_1 = 'NV1',
  NEGATIVE_VETTING_2 = 'NV2',
  POSITIVE_VETTING = 'PV'
}

export enum BusinessType {
    SOLE_TRADER = 1,
    PARTNERSHIP = 2,
    COMPANY = 3,
    TRUST = 4
}