import { EntityRepository, Repository } from "typeorm";
import { TimeOffType } from "./../entities/timeOffType";

@EntityRepository(TimeOffType)
export class TimeOffTypeRepository extends Repository<TimeOffType> {

    async createAndSave(timeOffType: TimeOffType): Promise<TimeOffType> {
        let obj = new TimeOffType();
        obj.label = timeOffType.label;
        return await this.save(obj);
    }

    async getAllActive(): Promise<TimeOffType[]> {
        return  this.find();
    }

    async updateAndReturn(id: number, timeOffType: any): Promise<TimeOffType|undefined> {
        await this.update(id, timeOffType);
        return this.findOne(id);
    }

    async findOneCustom(id: number): Promise<TimeOffType|undefined> {
        return this.findOne(id);
    }
}