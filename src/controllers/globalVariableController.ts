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
      let name = req.params.globalVariableName;
      let record = await repository.findOneCustom(name);
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

  async updateGlobalValue(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let id = parseInt(req.params.id);

      let records = await repository.updateValueRow(id, req.body);

      res.status(200).json({
        success: true,
        message: 'UPDATE GLOBAL VARIABLE VALUE',
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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let records = await repository.createAndSave(req.body);
      res.status(200).json({
        success: true,
        message: 'Create Global Variable',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let id = parseInt(req.params.id);
      let records = await repository.updateAndReturn(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Update Global Variable',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let id = parseInt(req.params.id);
      let records = await repository.deleteCustom(id);
      res.status(200).json({
        success: true,
        message: 'Delete Global Variablwe',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
