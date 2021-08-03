import { EntityRepository, Repository } from "typeorm";
import { HolidayType } from "./../entities/holidayType";

@EntityRepository(HolidayType)
export class HolidayTypeRepository extends Repository<HolidayType> {

    async createAndSave(holidayType: any): Promise<any> {
        let obj = new HolidayType();
        obj.label = holidayType.label;
        return await this.save(obj);
    }

    async getAllActive(): Promise<any[]> {
        return this.find();
    }

    async updateAndReturn(id: number, holidayType: any): Promise<any|undefined> {
        await this.update(id, holidayType);
        return this.findOne(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id);
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }
}