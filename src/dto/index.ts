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
