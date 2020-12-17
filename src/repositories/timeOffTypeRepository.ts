import { EntityRepository, Repository } from "typeorm";
import { TimeOffType } from "./../entities/timeOffType";

@EntityRepository(TimeOffType)
export class TimeOffTypeRepository extends Repository<TimeOffType> {

    async createAndSave(timeOffType: any): Promise<any> {
        let obj = new TimeOffType();
        obj.label = timeOffType.label;
        return await this.save(obj);
    }

    async getAllActive(): Promise<any[]> {
        return this.find();
    }

    async updateAndReturn(id: number, timeOffType: any): Promise<any|undefined> {
        await this.update(id, timeOffType);
        return this.findOne(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id);
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }
}