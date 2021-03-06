import {
  EmploymentType,
  Gender,
  IncreaseEvery,
  Frequency,
  ProjectType,
  ClearanceLevel,
  BusinessType,
} from "./../constants/constants";

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
  hours: number;
  increaseEvery: IncreaseEvery;
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
  recordsPerPage: string;
  timeZone: string;
}

export interface OrganizationDTO extends Base {
  name: string;
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
  superAnnuationName: string;
  memberNumber: string;
  smsfName: string; 
  smsfABN: string; 
  smsfAddress: string; 
  smsfBankName: string; 
  smsfBankBsb: string; 
  smsfBankAccountNo: string;
  taxFreeThreshold: boolean | null;
  helpHECS: boolean | null; 
  training: string;
  latestEmploymentContract: EmploymentContractDTO;
  bankName: string;
  bankAccountNo: string;
  bankBsb: string;
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

export interface OpportunityDTO extends Base {
  organizationId: number;
  title: string;
  value: number;
  type: ProjectType;
  startDate: Date | null;
  endDate: Date | null;
  bidDate: Date | null;
  entryDate: Date | null;
  qualifiedOps: boolean;
  tender: string;
  tenderNumber: string;
  tenderValue: number;
  cmPercentage: number;
  goPercentage: number;
  getPercentage: number;
  panelId: number;
  contactPersonId: number | null;
  stateId: number | null;
}

export interface OpportunityResourceDTO extends Base {
  panelSkillId: number;
  panelSkillStandardLevelId: number;
  billableHours: number;
  buyingRate: number;
  sellingRate: number;
  userId: number | null;
}
