import { off } from "process";
import { CalendarHoliday } from "src/entities/calendarHoliday";
import { HolidayType } from "src/entities/holidayType";
import { EntityRepository, Repository } from "typeorm";
import { Calendar } from "./../entities/calendar";

@EntityRepository(Calendar)
export class CalendarRepository extends Repository<Calendar> {

    async createAndSave(calendar: any): Promise<any> {
        let obj = new Calendar();
        obj.label = calendar.label;
        obj.isActive = calendar.isActive; 
        return await this.save(obj);
    }

    async getAllActive(): Promise<any[]> {
        return this.find();
    }

    async updateAndReturn(id: number, calendar: any): Promise<any|undefined> {
        await this.update(id, calendar);
        return this.findOne(id);
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id);
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }
}