import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { GlobalVariableValueRepository } from './../repositories/globalVariableValueRepository';

export class GlobalVariableController {
  async addGlobalValue(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalVariableValueRepository);
      let records = await repository.addValueRow(req.body);
      res.status(200).json({
        success: true,
        message: 'ADD GLOBAL VARIABLE VALUE',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}