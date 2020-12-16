import { EntityRepository, Repository } from "typeorm";
import { TimeOffPolicy } from "./../entities/timeOffPolicy";

@EntityRepository(TimeOffPolicy)
export class TimeOffPolicyRepository extends Repository<TimeOffPolicy> {

    async createAndSave(timeOffPolicy: any): Promise<any> {
        let obj = new TimeOffPolicy();
        obj.label = timeOffPolicy.label;
        return await this.save(obj);
    }

    async getAllActive(): Promise<TimeOffPolicy[]> {
        return  this.find();
    }

    async updateAndReturn(id: number, timeOffPolicy: any): Promise<TimeOffPolicy|undefined> {
        await this.update(id, timeOffPolicy);
        return this.findOne(id);
    }

    async findOneCustom(id: number): Promise<TimeOffPolicy|undefined> {
        return this.findOne(id);
    }
}