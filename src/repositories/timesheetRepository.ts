import { TimesheetDTO } from '../dto';
import { EntityRepository, Repository } from 'typeorm';
import { Timesheet } from '../entities/timesheet';

@EntityRepository(Timesheet)
export class TimesheetRepository extends Repository<Timesheet> {
  async createAndSave(opportunity: TimesheetDTO): Promise<any> {}

  async getAllActive(): Promise<any[]> {
    return [];
  }

  async updateAndReturn(
    id: number,
    opportunity: TimesheetDTO
  ): Promise<any | undefined> {}

  async findOneCustom(id: number): Promise<any | undefined> {}

  async deleteCustom(id: number): Promise<any | undefined> {}

  async getTimesheet(
    start_date: string,
    end_date: string
  ): Promise<any | undefined> {
    return this.findOne(1, {
      relations: ['projectEntries', 'projectEntries.entries'],
    });
  }
}
