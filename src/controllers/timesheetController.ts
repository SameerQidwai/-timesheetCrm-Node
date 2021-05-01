import { TimesheetDTO } from './../dto';
import { BaseController } from './baseController';
import { Request, Response } from 'express';
import { TimesheetRepository } from './../repositories/timesheetRepository';
import { getCustomRepository } from 'typeorm';

export class TimesheetController extends BaseController<
  TimesheetDTO,
  TimesheetRepository
> {
  async getTimesheet(req: Request, res: Response) {
    const repository = getCustomRepository(TimesheetRepository);
    let start_date = req.params.start_date;
    let end_date = req.params.end_date;
    let record = await repository.getTimesheet(start_date, end_date);
    res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Specific Timesheet',
      data: record,
    });
  }
}
