import { Request, Response, NextFunction } from 'express';
import { ExpenseTypeRepository } from '../repositories/expenseTypeRepository';
import { getCustomRepository } from 'typeorm';

export class ExpenseTypeController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      let select = req.query.select;
      const repository = getCustomRepository(ExpenseTypeRepository);
      let records = await repository.getAllActive(select ? true : false);
      res.status(200).json({
        success: true,
        message: 'Expense Types List',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ExpenseTypeRepository);
      let records = await repository.createAndSave(req.body);
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Expense Type Created',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ExpenseTypeRepository);
      let records = await repository.updateAndReturn(
        parseInt(req.params.id),
        req.body
      );
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Expense Type Updated',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ExpenseTypeRepository);
      let records = await repository.deleteCustom(parseInt(req.params.id));
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Expense Type Deleted',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
