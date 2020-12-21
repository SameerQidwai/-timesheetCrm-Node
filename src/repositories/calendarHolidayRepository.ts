import { off } from "process";
import { CalendarHolidayDTO } from "../dto";
import { CalendarHoliday } from "../entities/calendarHoliday";
import { HolidayType } from "../entities/holidayType";
import { EntityRepository, Repository } from "typeorm";
import { Calendar } from "./../entities/calendar";

@EntityRepository(CalendarHoliday)
export class CalendarHolidayRepository extends Repository<CalendarHoliday> {

    async createAndSave(calendarHoliday: CalendarHolidayDTO): Promise<any> {
        let calendar = await this.manager.findOne(Calendar,calendarHoliday.calendarId);
        let holidayType = await this.manager.findOne(HolidayType, calendarHoliday.holidayTypeId);
        if(!calendar) {
            throw new Error("Calendar not found");
        }
        if(!holidayType) {
            throw new Error("Holiday Type not found");
        }
        let obj = new CalendarHoliday();
        obj.calendar = calendar;
        obj.holidayType = holidayType;
        obj.date = new Date(calendarHoliday.date); 
        return await this.save(obj);
    }

    async getAllActive(options?: any): Promise<any[]> {
        let params: any = { relations: ["holidayType"] };
        if (options) {
            params = {
                ...params,
                where: {
                    calendar: {
                        id: options.calendarId
                    }
                }
            }
        }
        return this.find(params);
    }

    async updateAndReturn(id: number, calendarHoliday: CalendarHolidayDTO): Promise<any|undefined> {
        let calendarHolidayObj = await this.findOne(id);
        let holidayType = await this.manager.findOne(HolidayType, calendarHoliday.holidayTypeId);
        if(!calendarHolidayObj) {
            throw new Error("Holiday not found");
        }
        if(!holidayType) {
            throw new Error("Holiday Type not found");
        }
        calendarHolidayObj.holidayType = holidayType;
        calendarHolidayObj.date = new Date(calendarHoliday.date);
        await this.update(id, calendarHolidayObj);
        return this.findOne(id, { relations: ["holidayType"] });
    }

    async findOneCustom(id: number): Promise<any|undefined> {
        return this.findOne(id, { relations: ["holidayType"] });
    }

    async deleteCustom(id: number): Promise<any|undefined> {
        return this.softDelete(id);
    }

}