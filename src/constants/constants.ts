export enum LeaveRequestTriggerFrequency {
  NEVER = 'N',
  MONTH = 'M',
  YEAR = 'Y',
  EMPLOYEE_MONTH = 'EM',
  EMPLOYEE_YEAR = 'EY',
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
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
  POSITIVE_VETTING = 'PV',
  NO_CLEARANCE = 'NC',
}

export enum BusinessType {
  SOLE_TRADER = 1,
  PARTNERSHIP = 2,
  COMPANY = 3,
  TRUST = 4,
}

export enum SuperannuationType {
  PUBLIC = 'P',
  SMSF = 'S',
}

export enum TimesheetStatus {
  NOT_CREATED = 'NC',
  SAVED = 'SV',
  SUBMITTED = 'SB',
  REJECTED = 'RJ',
  APPROVED = 'AP',
}

export enum EntityType {
  EMPLOYEE = 'EMP',
  CONTACT_PERSON = 'CPE',
  ORGANIZATION = 'ORG',
  WORK = 'WOR',
  TIMESHEET = 'TSH',
  PURCHASE_ORDER = 'POR',
  COMMENT = 'COM',
  PROJECT_ENTRY = 'PEN',
  LEAVE_REQUEST = 'LRE',
}

export enum OpportunityStatus {
  LOST = 'L',
  NOT_BID = 'NB',
  DID_NOT_PROCEED = 'DNP',
  OPPORTUNITY = 'O',
  WON = 'P',
}

export enum LeaveRequestStatus {
  SUBMITTED = 'SB',
  REJECTED = 'RJ',
  APPROVED = 'AP',
}
