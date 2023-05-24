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
      const { user } = res.locals;

      let year = await repository.createAndSave(req.body, user.id);

      res.status(200).json({
        success: true,
        message: 'Year Created',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      const { user } = res.locals;
      let id = parseInt(req.params.id);

      let year = await repository.findOneCustom(id);

      res.status(200).json({
        success: true,
        message: 'Year Created',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateOne(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      const { user } = res.locals;
      let id = parseInt(req.params.id);

      let year = await repository.updateOne(req.body, user.id, id);

      res.status(200).json({
        success: true,
        message: 'Year Created',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteCustom(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(FinancialYearRepository);
      const { user } = res.locals;
      let id = parseInt(req.params.id);

      let year = await repository.deleteCustom(user.id, id);

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
      let queryConfirm = req.query.confirm;
      let confirm = queryConfirm === 'true' ? true : false;

      const { user } = res.locals;

      const response = await repository.closeYear(
        parseInt(id),
        user.id,
        confirm
      );

      res.status(200).json({
        success: true,
        message: 'All years',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
