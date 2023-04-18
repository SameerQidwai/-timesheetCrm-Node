import { Request, Response, NextFunction } from 'express';
import { getCustomRepository, getManager } from 'typeorm';
import { FinancialYear } from '../entities/financialYear';
import { FinancialYearRepository } from '../repositories/financialYearRepository';

export class FinancialYearController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);

      let years = await repository.getAllActive();

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
      const repository = getCustomRepository(FinancialYearRepository);

      let year = await repository.createAndSave(req.body);

      res.status(200).json({
        success: true,
        message: 'Year Created',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async closeYear(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      let id = req.params.id;

      const year = await repository.closeYear(parseInt(id));

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
