import { Gender, IncreaseEvery } from "./../constants/constants";

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
    textCode: string;
    expectedBusinessAmount: number;
    invoiceEmail: string;
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
    standardSkillStandardLevelIds: number[];
    contactPersonOrganizations: ContactPersonOrganization[];
}

export interface StateDTO extends Base {
    label: string;
}