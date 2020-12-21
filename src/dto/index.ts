import { IncreaseEvery } from "src/constants/constants";

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