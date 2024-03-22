import { off } from 'process';
import { CalendarHoliday } from 'src/entities/calendarHoliday';
import { HolidayType } from 'src/entities/holidayType';
import { EntityRepository, Repository } from 'typeorm';
import { Calendar } from './../entities/calendar';

@EntityRepository(Calendar)
export class CalendarRepository extends Repository<Calendar> {
  async createAndSave(calendar: any): Promise<any> {
    let obj = new Calendar();
    obj.label = calendar.label;
    obj.isDefault = calendar?.isDefault ?? false;

    if (calendar.isDefault) {
      let dbCalendar = await this.findOne({ where: { isDefault: true } });

      if (dbCalendar) {
        dbCalendar.isDefault = false;
        await this.save(dbCalendar);
      }
    }

    obj.isActive = calendar.isActive;
    return await this.save(obj);
  }

  async getAllActive(): Promise<any[]> {
    return this.find();
  }

  async updateAndReturn(id: number, calendar: any): Promise<any | undefined> {
    if (calendar.isDefault) {
      let dbCalendar = await this.findOne({ where: { isDefault: true } });

      if (dbCalendar && dbCalendar.id !== id) {
        dbCalendar.isDefault = false;
        await this.save(dbCalendar);
      }
    }

    if (calendar.isDefault === false) {
      let dbCalendar = await this.findOne({ where: { isDefault: true } });
      if (dbCalendar) {
        if (dbCalendar.id === id) {
          throw new Error('One Calendar is required to be default');
        }
      }
    }

    await this.update(id, calendar);
    return this.findOne(id);
  }

  async findOneCustom(id: number): Promise<any | undefined> {
    return this.findOne(id);
  }

  async deleteCustom(id: number): Promise<any | undefined> {
    return this.softDelete(id);
  }
}
