import { ExpenseSheetExpense } from '../entities/expenseSheetExpense';
import { Action, Grant, Resource } from './../constants/authorization';
import {
  EmploymentType,
  Gender,
  LeaveRequestTriggerFrequency,
  Frequency,
  ProjectType,
  ClearanceLevel,
  BusinessType,
  SuperannuationType,
  EntityType,
  RecruitmentAvailability,
  RecruitmentProspect,
  RecruitmentContractType,
} from './../constants/constants';

export interface Base {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface SampleDTO extends Base {
  title: string;
}

export interface LeaveRequestTypeDTO extends Base {
  label: string;
}

export interface LeaveRequestPolicyLeaveRequestType extends Base {
  leaveRequestPolicyId?: number;
  leaveRequestTypeId: number;
  earnHours: number;
  earnEvery: LeaveRequestTriggerFrequency;
  resetEvery: LeaveRequestTriggerFrequency;
  resetHours: number;
  threshold: number;
  includeOffDays: boolean;
  minimumBalance: number;
  minimumBalanceRequired: number;
}

export interface LeaveRequestPolicyDTO extends Base {
  label: string;
  leaveRequestPolicyLeaveRequestTypes: LeaveRequestPolicyLeaveRequestType[];
}

export interface StandardLevelDTO extends Base {
  label: string;
}

export interface StandardSkillStandardLevel extends Base {
  standardSkillId?: number;
  standardLevelId: number;
  priority: number;
}

export interface StandardSkillDTO extends Base {
  label: string;
  standardSkillStandardLevels: StandardSkillStandardLevel[];
}

export interface CalendarDTO extends Base {
  label: string;
  isActive: boolean;
}

export interface HolidayTypeDTO extends Base {
  label: string;
}

export interface CalendarHolidayDTO extends Base {
  calendarId?: number;
  holidayTypeId: number;
  date: Date;
}

export interface PanelDTO extends Base {
  label: string;
}

export interface panelSkillStandardLevelDTO extends Base {
  panelSkillId?: number;
  standardLevelId: number;
  levelLabel: string;
  shortTermCeil: number;
  longTermCeil: number;
}

export interface PanelSkillDTO extends Base {
  label: string;
  standardSkillId: number;
  panelId: number;
  panelSkillStandardLevels: panelSkillStandardLevelDTO[];
}

export interface GlobalSettingDTO {
  fromEmail: string;
  displayEmail: string;
  recordsPerPage: string;
  timeZone: string;
}

export interface OrganizationDTO extends Base {
  name: string;
  title: string;
  phoneNumber: string;
  email: string;
  address: string;
  website: string;
  abn: string;
  businessType: BusinessType;
  taxCode: string;
  currentFinancialYearTotalForecast: number;
  nextFinancialYearTotalForecast: number;
  invoiceEmail: string;
  invoiceContactNumber: string;
  piInsurer: string;
  plInsurer: string;
  wcInsurer: string;
  piPolicyNumber: string;
  plPolicyNumber: string;
  wcPolicyNumber: string;
  wcSumInsured: number;
  piSumInsured: number;
  plSumInsured: number;
  piInsuranceExpiry: Date | null;
  plInsuranceExpiry: Date | null;
  wcInsuranceExpiry: Date | null;
  parentOrganizationId: number | null;
  delegateContactPersonId: number | null;
  bankName: string;
  bankAccountNo: string;
  bankBsb: string;
}

export interface ContactPersonOrganization extends Base {
  startDate: Date;
  endDate: Date | null;
  designation: string;
  organizationId: number;
}

export interface ContactPersonDTO extends Base {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: Date | null;
  phoneNumber: string;
  email: string;
  birthPlace: String;
  address: string;
  stateId: number | null;
  clearanceLevel: ClearanceLevel | null;
  clearanceGrantedDate: Date | null;
  clearanceExpiryDate: Date | null;
  clearanceSponsorId: number | null;
  csidNumber: string;
  recruitmentAvailability: RecruitmentAvailability | null;
  recruitmentContractType: RecruitmentContractType | null;
  recruitmentProspect: RecruitmentProspect | null;
  recruitmentSalaryEstimate: number;
  recruitmentNotes: string | null;
  standardSkillStandardLevelIds: number[];
  contactPersonOrganizations: ContactPersonOrganization[];
}

export interface StateDTO extends Base {
  label: string;
}

export interface EmployeeDTO extends Base {
  contactPersonId: number | null;
  username: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: Date | null;
  phoneNumber: string;
  email: string;
  birthPlace: String;
  address: string;
  stateId: number | null;
  nextOfKinName: string;
  nextOfKinPhoneNumber: string;
  nextOfKinEmail: string;
  nextOfKinRelation: string;
  tfn: string;
  taxFreeThreshold: boolean | null;
  helpHECS: boolean | null;
  superannuationName: string;
  superannuationType: SuperannuationType | null;
  superannuationBankName: string;
  superannuationBankAccountOrMembershipNumber: string;
  superannuationAbnOrUsi: string;
  superannuationBankBsb: string;
  superannuationAddress: string;
  superannuationFileId: number;
  training: string;
  latestEmploymentContract: EmploymentContractDTO;
  bankName: string;
  bankAccountNo: string;
  bankBsb: string;
  bankAccountFileId: number;
  roleId: number;
  lineManagerId: number;
}

export interface EmploymentContractDTO extends Base {
  employeeId?: number;
  payslipEmail: string;
  comments: string;
  payFrequency: Frequency;
  startDate: Date;
  endDate: Date | null;
  bohPercent: number;
  type: EmploymentType;
  noOfHours: number;
  noOfDays: number;
  remunerationAmount: number;
  remunerationAmountPer: Frequency;
  leaveRequestPolicyId: number;
  fileId: number;
}

export interface LeaseDTO extends Base {
  companyName: string;
  vehicleRegistrationNo: string;
  vehicleMakeModel: String;
  startDate: Date;
  endDate: Date | null;
  financedAmount: number;
  installmentFrequency: Frequency;
  preTaxDeductionAmount: number;
  postTaxDeductionAmount: number;
  financerName: string;
}

export interface BankAccountDTO extends Base {
  name: string;
  accountNo: string;
  bsb: string;
  employeeId: number | null;
  organizationId: number | null;
}

export interface SubContractorDTO extends Base {
  organizationId: number | null;
  contactPersonId: number | null;
  username: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: Date | null;
  phoneNumber: string;
  email: string;
  birthPlace: String;
  address: string;
  stateId: number | null;
  nextOfKinName: string;
  nextOfKinPhoneNumber: string;
  nextOfKinEmail: string;
  nextOfKinRelation: string;
  latestContract: ContractDTO;
  roleId: number;
  lineManagerId: number;
}

export interface ContractDTO extends Base {
  subContractorId?: number;
  comments: string;
  startDate: Date;
  endDate: Date | null;
  noOfHours: number;
  noOfDays: number;
  remunerationAmount: number;
  remunerationAmountPer: Frequency;
  fileId: number;
}

interface Work extends Base {
  organizationId: number;
  title: string;
  value: number;
  type: ProjectType;
  startDate: Date | null;
  endDate: Date | null;
  bidDate: Date | null; // ONLY IN OPPORTUNITY
  entryDate: Date | null;
  qualifiedOps: boolean;
  tender: string;
  tenderNumber: string;
  hoursPerDay: number;
  cmPercentage: number;
  goPercentage: number | number; // ONLY IN OPPORTUNITY
  getPercentage: number | number; // ONLY IN OPPORTUNITY
  panelId: number;
  contactPersonId: number | null;
  stage: string;
  linkedWorkId: number;
  stateId: number | null;
  // wonDate: Date | null;
  // lostDate: Date | null;
  // completedDate: Date | null;
  accountDirectorId: number | null;
  accountManagerId: number | null;
}

export interface OpportunityDTO extends Work {
  opportunityManagerId: number | null;
}

export interface OpportunityResourceDTO extends Base {
  panelSkillId: number;
  panelSkillStandardLevelId: number;
  billableHours: number;
  title: string;
  startDate: Date;
  endDate: Date;
}

export interface OpportunityResourceAllocationDTO extends Base {
  buyingRate: number;
  sellingRate: number;
  contactPersonId: number | null;
  startDate: Date | null;
  endDate: Date | null;
  effortRate: number;
}

export interface ProjectDTO extends Work {
  projectManagerId: number | null;
}

export interface ProjectResourceDTO extends Base {
  panelSkillId: number;
  panelSkillStandardLevelId: number;
  billableHours: number;
  title: string;
  buyingRate: number;
  sellingRate: number;
  startDate: Date | null;
  endDate: Date | null;
  isMarkedAsSelected: boolean;
  contactPersonId: number | null;
  effortRate: number;
}

export interface PurchaseOrderDTO extends Base {
  description: string;
  issueDate: Date;
  expiryDate: Date;
  value: number;
  comment: string;
  expense: number;
  orderNo: string;
  fileId: number;
}

export interface TimesheetDTO extends Base {
  date: string;
  startTime: string;
  endTime: string;
  milestoneId: number;
  milestoneEntryId: number;
  notes: string;
  breakHours: number;
}

export interface TimesheetMilestoneNoteDTO extends Base {
  note: string;
  attachments: number[];
}

//!! DONT LOOK AT THESE THREE

export interface FileDTO extends Base {
  files: object[];
}

export interface AttachmentDTO extends Base {
  files: number[];
  targetType: EntityType;
  target: number;
}

export interface CommentDTO extends Base {
  targetType: EntityType;
  target: number;
  content: string;
  attachments: number[] | [];
}

export interface SettingsDTO extends Base {
  nextOfKinName: string;
  nextOfKinPhoneNumber: string;
  nextOfKinEmail: string;
  nextOfKinRelation: string;
  tfn: string;
  taxFreeThreshold: boolean | null;
  helpHECS: boolean | null;
  superannuationName: string;
  superannuationType: SuperannuationType | null;
  superannuationBankName: string;
  superannuationBankAccountOrMembershipNumber: string;
  superannuationAbnOrUsi: string;
  superannuationBankBsb: string;
  superannuationAddress: string;
  superannuationFileId: number;
  training: string;
  bankName: string; //!  USING BUT RELATIONSHIP NEEDS TO BE CHANGED, BECAUSE BANKS ARE ONE TO MANY RELATIONSHIP
  bankAccountNo: string; //!  USING BUT RELATIONSHIP NEEDS TO BE CHANGED, BECAUSE BANKS ARE ONE TO MANY RELATIONSHIP
  bankBsb: string; //!  USING BUT RELATIONSHIP NEEDS TO BE CHANGED, BECAUSE BANKS ARE ONE TO MANY RELATIONSHIP
  bankAccountFileId: number;
}

export interface PermissionDTO extends Base {
  action: Action;
  resource: Resource;
  grant: Grant;
}

export interface RoleDTO extends Base {
  label: string;
}

export interface GlobalVariableValueDTO extends Base {
  globalVariableId: number;
  value: number;
  startDate: Date;
  endDate: Date;
}

export interface GlobalVariableLabelValueDTO extends Base {
  name: string;
  value: number;
  startDate: Date;
  endDate: Date;
}

export interface GlobalVariableLabelValueArrayDTO extends Base {
  variables: Array<GlobalVariableLabelValueDTO>;
}

export interface MilestoneDTO extends Base {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  isApproved: string;
  projectId: number;
}

export interface OpportunityLostDTO {
  status: string;
  reason: string[] | [] | string;
  feedback: string;
  wonById: number | null;
  winningPrice: number | null;
}

export interface MilestoneEntriesUpdateDTO {
  milestoneEntryIds: Array<number>;
  note: string;
  attachments: Array<number>;
}

export interface MilestoneEntriesPrintDTO {
  milestoneEntryIds: Array<number>;
}
//PROJECT TYPE
// 1 MILESTONE
// 2 TM

export interface LeaveRequestDTO {
  description: string;
  typeId: number;
  workId: number;
  entries: Array<{ date: Date; hours: number }>;
  attachments: Array<number>;
}

export interface EmployeeSkillDTO {
  standardSkillStandardLevelIds: number[];
}

export interface LeaveRequestBalanceAccuredDTO {
  carryForward: number;
}

export interface LeaveRequestApproveRejectDTO {
  leaveRequests: Array<number>;
  note: string;
}

export interface TimesheetEntryApproveRejectDTO {
  milestoneEntries: Array<number>;
  note: string;
}

export interface AddressDTO {
  address: string;
}

export interface TrainingDTO {
  training: string;
}

export interface MilestoneUploadDTO {
  fileId: number;
}

//----------------------IMPORT EXPORT DTO---------------------------------------

export interface OrganizationEntity {
  ID: number;
  Name: string;
  Title: string;
  Phone: string;
  Email: string;
  'Business Type': BusinessType;
  Address: string;
  Website: string;
  'Parent Organization ID': number | null;
  'Parent Organization': string | undefined;
  'Delegate Contact Person ID': number | null;
  'Delegate Contact Person': string | null;
  ABN: string;
  'Tax Code': string;
  'Email for Invoices': string;
  'Contact Number for Invoices': string;
  'Professional Indemnity Insurer': string;
  'Professional Indemnity Policy Number': string;
  'Professional Indemnity Sum Insured': number;
  'Professional Indemnity Expiry': string | null;
  'Public Liability Insurer': string;
  'Public Liability Policy Number': string;
  'Public Liability Sum Insured': number;
  'Public Liability Expiry': string | null;
  "Worker's Compensation Insurer": string;
  "Worker's Compensation Policy Number": string;
  "Worker's Compensation Sum Insured": number;
  "Worker's Compensation Expiry": string | null;
  'Current Year Forecast': number;
  'Next Year Forecast': number;
}

export interface ContactPersonEntity {
  ID: number;
  'First Name': String;
  'Last Name': String;
  Phone: string;
  Email: string;
  Gender: Gender;
  'State ID': number;
  State: string;
  Address: String;
  'Clearance Level': ClearanceLevel;
  'Clearance Date Granted': string | null;
  'Clearance Expiry Date': string | null;
  'Current Sponsor ID': number | null;
  'Current Sponsor': string | null;
  'Organization ID': number | null | undefined;
  Organization: string | null | undefined;
}

export interface OpportunityEntity {
  ID: number;
  'Panel ID': number;
  Panel: string;
  'Organization ID': number;
  Organization: string;
  'Delegate Contact Person ID': number | null;
  'Delegate Contact Person': string | null;
  Name: String;
  'Type ID': ProjectType;
  'State ID': number;
  State: string;
  'Qualified Ops': boolean | string;
  Stage: string;
  'Linked Project ID': number | null;
  'Linked Project': String | null;
  'Tender Title': string;
  'Tender Number': String;
  'Expected Start Date': string | null;
  'Expected End Date': string | null;
  'Work Hours Per Day': number;
  'Bid Due Date': string | null;
  'Entry Date': string | null;
  'Estimated Value': number;
  'Contribution Margin as a %': number;
  Go: number;
  Get: number;
  'Account Director ID': number | null;
  'Account Director': string | null;
  'Account Manager ID': number | null;
  'Account Manager': string | null;
  'Opportunity Manager ID': number | null;
  'Opportunity Manager': string | null;
}
export interface ProjectEntity {
  ID: number;
  'Panel ID': number;
  Panel: string;
  'Organization ID': number;
  Organization: string;
  'Delegate Contact Person ID': number | null;
  'Delegate Contact Person': string | null;
  Name: String;
  'Type ID': ProjectType;
  'State ID': number;
  State: string;
  'Qualified Ops': boolean | string;
  Stage: string;
  'Linked Project ID': number | null;
  'Tender Title': string;
  'Tender Number': String;
  'Start Date': string | null;
  'End Date': string | null;
  'Work Hours Per Day': number;
  'Bid Due Date': string | null;
  'Entry Date': string | null;
  'Estimated Value': number;
  'Contribution Margin as a %': number;
  Go: number;
  Get: number;
  'Account Director ID': number | null;
  'Account Director': string | null;
  'Account Manager ID': number | null;
  'Account Manager': string | null;
  'Project Manager ID': number | null;
  'Project Manager': string | null;
}

export interface EmployeeEntity {
  ID: number;
  Email: String;
  Password: string;
  'Role ID': number;
  Role: string;
  'Next Of Kin Name': string;
  'Next Of Kin Phone': string;
  'Next Of Kin Email': string;
  'Next Of Kin Relationship': string;
  TFN: string;
  'Bank Account Holder Name': String | null;
  'Bank Account Number': String | null;
  'BSB Number': string | null;
  'Tax-free Threshold': boolean | string;
  'Help (HECS)': boolean | string;
  Training: string;
  'Line Manager ID': number | null;
  'Line Manager': string | null;
  'Contact Person ID': number;
  'Contact Person': string;
}

export interface SubContractorEntity {
  ID: number;
  Email: String;
  Password: string;
  'Role ID': number;
  Role: string;
  'Next Of Kin Name': string;
  'Next Of Kin Phone': string;
  'Next Of Kin Email': string;
  'Next Of Kin Relationship': string;
  TFN: string;
  'Tax-free Threshold': boolean | string;
  'Help (HECS)': boolean | string;
  Training: string;
  'Contractor Manager ID': number | null;
  'Contractor Manager': string | null;
  'Contact Person ID': number;
  'Contact Person': string;
  'Organization ID': number;
  Organization: string;
}

export interface ExpenseTypeDTO extends Base {
  label: String;
}

export interface MilestoneExpenseDTO extends Base {
  expenseId: number;
  buyingRate: number;
  sellingRate: number;
}

export interface ExpenseSheetDTO extends Base {
  label: String;
  projectId: number;
  attachments: number[];
  isBillable: boolean;
  expenseSheetExpenses: ExpenseSheetExpense[];
}

export interface ExpenseSheetBillableDTO extends Base {
  isBillable: boolean;
}

export interface ExpenseDTO extends Base {
  amount: number;
  date: Date;
  isReimbursed: boolean;
  isBillable: boolean;
  notes: string;
  expenseTypeId: number;
  submittedAt: Date;
  approvedAt: Date;
  rejectedAt: Date;
  attachments: number[];
  projectId: number;
}

export interface ExpenseSheetApproveDTO extends Base {
  expenses: number[];
  isBillable: boolean;
  notes: string;
}

export interface ExpenseSheetRejectDTO extends Base {
  expenses: number[];
  isBillable: boolean;
  notes: string;
}

export interface ExpenseSheetsSubmitDTO extends Base {
  sheets: number[];
  isBillable: boolean;
  notes: string;
}
export interface ExpenseSheetsApproveDTO extends Base {
  sheets: number[];
  isBillable: boolean;
  notes: string;
}

export interface ExpenseSheetsRejectDTO extends Base {
  sheets: number[];
  isBillable: boolean;
  notes: string;
}

export interface ProjectScheduleDTO extends Base {
  startDate: Date;
  endDate: Date;
  notes: string;
  amount: number;
  paymentDate: Date;
  segments: {
    startDate: number;
    endDate: number;
    amount: number;
  }[];
}

export interface ProjectShutdownPeriodDTO extends Base {
  startDate: Date;
  endDate: Date;
  notes: string;
}

export interface ForecastReportLabelDTO extends Base {
  title: String;
}

export interface ForecastReportUpdateDTO {
  [key: string]: {
    [key: string]: number;
  };
}
export interface BudgetReportLabelDTO extends Base {
  title: String;
}

export interface BudgetReportUpdateDTO {
  [key: string]: {
    [key: string]: number;
  };
}

export interface CashflowReportLabelDTO extends Base {
  title: String;
}

export interface CashflowReportUpdateDTO {
  [key: string]: {
    [key: string]: number;
  };
}
