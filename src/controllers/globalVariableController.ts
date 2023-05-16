import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { GlobalVariableValueRepository } from './../repositories/globalVariableValueRepository';

export class GlobalVariableController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let records = await repository.getAllActive();
      res.status(200).json({
        success: true,
        message: 'GET GLOBAL VARIABLE VALUE',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let id = req.params.globalVariableId;
      let record = await repository.findOneCustom(parseInt(id));
      res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Single Global Variable',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async addGlobalValue(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let records = await repository.addOrUpdate(req.body);
      res.status(200).json({
        success: true,
        message: 'ADD GLOBAL VARIABLE VALUE',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async addOrUpdateGlobalVariable(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let records = await repository.addOrUpdate(req.body);
      res.status(200).json({
        success: true,
        message: 'ADD GLOBAL VARIABLE LABEL + VALUE',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async getCostCalculatorVariable(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let type = parseInt(req.query.type as string);
      let records = await repository.costCalculatorVariable(type);
      res.status(200).json({
        success: true,
        message: 'ADD GLOBAL VARIABLE LABEL + VALUE',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
