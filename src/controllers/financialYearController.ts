import { Request, Response, NextFunction } from 'express';
import { getManager } from 'typeorm';
import { FinancialYear } from '../entities/financialYear';
import moment from 'moment';

export class FinancialYearController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let years = await manager.find(FinancialYear, {});

      res.status(200).json({
        success: true,
        message: 'All years',
        data: years,
      });
    } catch (e) {
      next(e);
    }
  }

  async createAndSave(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let year = new FinancialYear();

      year.startDate = moment().startOf('year').toDate();
      year.endDate = moment().endOf('year').toDate();

      year = await manager.save(year);

      res.status(200).json({
        success: true,
        message: 'Year Created',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async lockYear(req: Request, res: Response, next: NextFunction) {
    try {
      const manager = getManager();

      let year = await manager.findOne(FinancialYear);

      if (!year) {
        throw new Error('Year not found');
      }

      year.closed = true;

      await manager.save(year);

      res.status(200).json({
        success: true,
        message: 'All years',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }
}
