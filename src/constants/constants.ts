export enum LeaveRequestTriggerFrequency {
  NEVER = 'N',
  MONTH = 'M',
  FORTNIGHTLY = 'F',
  YEAR = 'Y',
  FORTNIGHTLY = "F",
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
  GOVERNMENT = 5,
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

export enum TimesheetEntryStatus {
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
  MILESTONE = 'MIL',
  EXPENSE = 'EXP',
  EXPENSE_SHEET = 'ESH',
}

export enum OpportunityStatus {
  LOST = 'L',
  NOT_BID = 'NB',
  DID_NOT_PROCEED = 'DNP',
  OPPORTUNITY = 'O',
  WON = 'P',
  COMPLETED = 'C',
}

export enum LeaveRequestStatus {
  SUBMITTED = 'SB',
  REJECTED = 'RJ',
  APPROVED = 'AP',
}

export enum Entities {
  ORGANIZATION = 'ORG',
  CONTACT_PERSON = 'CPE',
  OPPORTUNITY = 'OPP',
  PROJECT = 'PRO',
  EMPLOYEE = 'EMP',
  SUB_CONTRACTOR = 'SCO',
  TIMESHEET = 'TSH',
  PURCHASE_ORDER = 'POR',
  COMMENT = 'COM',
  PROJECT_ENTRY = 'PEN',
  LEAVE_REQUEST = 'LRE',
}

export enum ExportFileName {
  ORGANIZATION = 'organizations.xlsx',
  CONTACT_PERSON = 'contact_persons.xlsx',
  OPPORTUNITY = 'opportunities.xlsx',
  PROJECT = 'projects.xlsx',
  EMPLOYEE = 'employees.xlsx',
  SUB_CONTRACTOR = 'subcontractors.xlsx',
}

export enum ImportLogName {
  ORGANIZATION = 'organizations_logs.xlsx',
  CONTACT_PERSON = 'contact_persons_logs.xlsx',
  OPPORTUNITY = 'opportunities_logs.xlsx',
  PROJECT = 'projects_logs.xlsx',
  EMPLOYEE = 'employees_logs.xlsx',
  SUB_CONTRACTOR = 'subcontractors_logs.xlsx',
}

export enum ExpenseSheetStatus {
  SAVED = 'SV',
  SUBMITTED = 'SB',
  REJECTED = 'RJ',
  APPROVED = 'AP',
}

export enum TimesheetSummaryStatus {
  NOT_APPLICABLE = 0,
  NOT_SUBMITTED = 1,
  SUBMITTED = 2,
  APPROVED = 3,
  REJECTED = 4,
}

export enum RecruitmentProspect {
  NOT_CONSIDERED = 'NCO',
  DO_NOT_HIRE = 'DNH',
  PROSPECT = 'PRO',
  ASSIGNED_TO_OPPORTUNITY = 'ATO',
}

export enum RecruitmentAvailability {
  IMMEDIATE = 'IMM',
  WITH_IN_A_MONTH = 'WMO',
  OVER_A_MONTH = 'OMO',
  LONG_TERM_PROSPECT = 'LTP',
  NO_CLEARANCE = 'NCL',
}
export enum RecruitmentContractType {
  PART_TIME = 'PTI',
  FULL_TIME = 'FTI',
  CASUAL = 'CAS',
  CONTRACTOR = 'CON',
}

export enum DisableConditionType {
  FINANCIAL_YEAR = 'FIY',
  STATIC = 'STA',
  DYNAMIC = 'DYN',
}

export enum DisableCondtionDataType {
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  ANY = 'ANY',
}

export enum SystemVariableValueType {
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
}

export enum GlobalSettingValueType {
  DATE = 'date',
  NUMBER = 'number',
  STRING = 'string',
  BOOLEAN = 'boolean',
}

export enum ExpenseStatus {
  SAVED = 'SV',
  SUBMITTED = 'SB',
  REJECTED = 'RJ',
  APPROVED = 'AP',
}

export enum NotificationEventType {
  OPPORTUNITY_WON = 'opportunity-won',
  OPPORTUNITY_LOST = 'opportunity-lost',
  OPPORTUNITY_ACDIRECTOR_ASSIGN = 'opportunity-ac-director-assign',
  OPPORTUNITY_ACMANAGER_ASSIGN = 'opportunity-ac-manager-assign',
  OPPORTUNITY_MANAGER_ASSIGN = 'opportunity-manager-assign',
  PROJECT_OPEN = 'project-open',
  PROJECT_CLOSE = 'project-close',
  PROJECT_ESTIMATE_UPDATE = 'project-estimate-update',
  RESOURCE_SELECTED = 'resource-selected',
  EXPENSE_SHEET_SUBMIT = 'expense-sheet-submit',
  EXPENSE_SHEET_APPROVE = 'expense-sheet-approve',
  EXPENSE_SHEET_UNAPPROVE = 'expense-sheet-unapprove',
  EXPENSE_SHEET_REJECT = 'expense-sheet-reject',
  TIME_SHEET_SUBMIT = 'time-sheet-submit',
  TIME_SHEET_APPROVE = 'time-sheet-approve',
  TIME_SHEET_UNAPPROVE = 'time-sheet-unapprove',
  TIME_SHEET_REJECT = 'time-sheet-reject',
  TIMESHEET_PENDING = 'timesheet-pending',
  LEAVE_REQUEST_SUBMIT = 'leave-request-submit',
  LEAVE_REQUEST_APPROVE = 'leave-request-approve',
  LEAVE_REQUEST_REJECT = 'leave-request-reject',
  LEAVE_BALANCE_UPDATE = 'leave-balance-update',
  CONTACT_PERSON_CREATE = 'contact-person-create',
  CONTACT_PERSON_UPDATE = 'contact-person-update',
  EMPLOYEE_CREATE = 'employee-create',
  EMPLOYEE_UPDATE = 'employee-update',
  SUBCONTRACTOR_CREATE = 'subcontractor-create',
  SUBCONTRACTOR_UPDATE = 'subcontractor-update',
  EMPLOYEE_CONTRACT_CREATE = 'employee-contract-create',
  EMPLOYEE_CONTRACT_UPDATE = 'employee-contract-update',
  EMPLOYEE_CONTRACT_ENDING = 'employee-contract-ending',
  SUBCONTRACTOR_CONTRACT_CREATE = 'subcontractor-contract-create',
  SUBCONTRACTOR_CONTRACT_UPDATE = 'subcontractor-contract-update',
  SUBCONTRACTOR_CONTRACT_ENDING = 'subcontractor-contract-ending',
  EMPLOYEE_SETTINGS_UPDATE = 'employee-settings-update',
  SUBCONTRACTOR_SETTINGS_UPDATE = 'subcontractor-settings-update',
  ORGANIZATION_CREATE = 'organization-create',
}

export enum NotificationType {
  ALERT = 0,
  INFO = 1,
  SUCCESS = 2,
  DANGER = 3,
}

export enum NotificationMediumType {
  MAIL = 1,
  SMS = 2,
  APP = 3,
  WEB = 4,
}

export enum NotificationUrl {
  EXPENSESHEET_APPROVAL = 'whatsoever',
}
