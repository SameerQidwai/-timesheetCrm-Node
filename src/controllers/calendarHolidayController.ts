import { CalendarHolidayDTO } from '../dto';
import { BaseController } from './baseController';
import { CalendarHolidayRepository } from '../repositories/calendarHolidayRepository';
import { getCustomRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';

export class CalendarHolidayController extends BaseController<
  CalendarHolidayDTO,
  CalendarHolidayRepository
> {
  async indexAlternate(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(CalendarHolidayRepository);

      let records = await repository.getAllActiveKeyValue();
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Index',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
