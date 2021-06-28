import { Action, Grant, Resource } from './../constants/authorization';
import {
  EmploymentType,
  Gender,
  TimeoffTriggerFrequency,
  Frequency,
  ProjectType,
  ClearanceLevel,
  BusinessType,
  SuperannuationType,
  EntityType,
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

export interface TimeOffTypeDTO extends Base {
  label: string;
}

export interface TimeOffPolicyTimeOffType extends Base {
  timeOffPolicyId?: number;
  timeOffTypeId: number;
  earnHours: number;
  earnEvery: TimeoffTriggerFrequency;
  resetEvery: TimeoffTriggerFrequency;
  resetHours: number;
  threshold: number;
}

export interface TimeOffPolicyDTO extends Base {
  label: string;
  timeOffPolicyTimeOffTypes: TimeOffPolicyTimeOffType[];
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
  delegateContactPersonOrganizationId: number | null;
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
  address: string;
  stateId: number | null;
  clearanceLevel: ClearanceLevel | null;
  clearanceGrantedDate: Date | null;
  clearanceExpiryDate: Date | null;
  clearanceSponsorId: number | null;
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
  training: string;
  latestEmploymentContract: EmploymentContractDTO;
  bankName: string;
  bankAccountNo: string;
  bankBsb: string;
  roleId: number;
}

export interface EmploymentContractDTO extends Base {
  employeeId?: number;
  payslipEmail: string;
  comments: string;
  payFrequency: Frequency;
  startDate: Date;
  endDate: Date | null;
  type: EmploymentType;
  noOfHours: number;
  noOfHoursPer: Frequency;
  remunerationAmount: number;
  remunerationAmountPer: Frequency;
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
  address: string;
  stateId: number | null;
  nextOfKinName: string;
  nextOfKinPhoneNumber: string;
  nextOfKinEmail: string;
  nextOfKinRelation: string;
  latestContract: ContractDTO;
  roleId: number;
}

export interface ContractDTO extends Base {
  subContractorId?: number;
  comments: string;
  startDate: Date;
  endDate: Date | null;
  noOfHours: number;
  noOfHoursPer: Frequency;
  remunerationAmount: number;
  remunerationAmountPer: Frequency;
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
}

export interface OpportunityResourceAllocationDTO extends Base {
  buyingRate: number;
  sellingRate: number;
  contactPersonId: number | null;
  startDate: Date;
  endDate: Date;
  effortRate: number;
}

export interface ProjectDTO extends Work {
  projectManagerId: number | null;
}

export interface ProjectResourceDTO extends Base {
  panelSkillId: number;
  panelSkillStandardLevelId: number;
  billableHours: number;
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
}

export interface TimesheetDTO extends Base {
  date: string;
  startTime: string;
  endTime: string;
  projectId: number;
  projectEntryId: number;
  notes: string;
  breakHours: number;
}

export interface TimesheetProjectNoteDTO extends Base {
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

export interface Settings extends Base {
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
  training: string;
  // bankName: string; //! NOT USING BECAUSE BANKS ARE ONE TO MANY RELATIONSHIP
  // bankAccountNo: string; //! NOT USING BECAUSE BANKS ARE ONE TO MANY RELATIONSHIP
  // bankBsb: string; //! NOT USING BECAUSE BANKS ARE ONE TO MANY RELATIONSHIP
}
export interface PermissionDTO extends Base {
  action: Action;
  resource: Resource;
  grant: Grant;
}

export interface RoleDTO extends Base {
  label: string;
}
