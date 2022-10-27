import { Request, Response, NextFunction } from 'express';
import { expenseRulesValidator } from '../rules';
import { getCustomRepository } from 'typeorm';
import { ExpenseRepository } from '../repositories/expenseRepository';

export class ExpenseController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ExpenseRepository);
      let records: any = [];
      const { grantLevel } = res.locals;
      if (grantLevel.includes('ANY')) {
        records = await repository.getAllActive();
      } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
        records = await repository.getOwnAndManageActive(
          parseInt(res.locals.jwtPayload.id)
        );
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.getManageActive(
          parseInt(res.locals.jwtPayload.id)
        );
      } else if (grantLevel.includes('OWN')) {
        records = await repository.getOwnActive(
          parseInt(res.locals.jwtPayload.id)
        );
      }
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Index projects',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async availableIndex(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ExpenseRepository);
      let records: any = [];
      const { grantLevel } = res.locals;
      if (grantLevel.includes('ANY')) {
        records = await repository.getAvailableAllActive();
      } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
        records = await repository.getAvailableOwnAndManageActive(
          parseInt(res.locals.jwtPayload.id)
        );
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.getAvailableManageActive(
          parseInt(res.locals.jwtPayload.id)
        );
      } else if (grantLevel.includes('OWN')) {
        records = await repository.getAvailableOwnActive(
          parseInt(res.locals.jwtPayload.id)
        );
      }
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Index projects',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ExpenseRepository);

      await expenseRulesValidator.validateCreate.validateAsync(req.body);

      let record = await repository.createAndSave(
        parseInt(res.locals.jwtPayload.id),
        req.body
      );
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Created Successfully',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ExpenseRepository);

      await expenseRulesValidator.validateUpdate.validateAsync(req.body);

      let id = req.params.id;
      let record = await repository.updateAndReturn(
        parseInt(res.locals.jwtPayload.id),
        parseInt(id),
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Updated Successfully`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ExpenseRepository);

      let id = req.params.id;
      let record = await repository.findOneCustom(
        parseInt(res.locals.jwtPayload.id),
        parseInt(id)
      );
      if (!record) throw new Error('not found');
      res.status(200).json({
        success: true,
        message: `Get`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ExpenseRepository);

      let id = req.params.id;
      let record = await repository.deleteCustom(
        parseInt(res.locals.jwtPayload.id),
        parseInt(id)
      );
      res.status(200).json({
        success: true,
        message: `Deleted Successfully`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }
}
