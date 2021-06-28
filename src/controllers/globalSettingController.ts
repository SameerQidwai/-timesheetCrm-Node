import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { GlobalSettingRepository } from './../repositories/globalSettingRepository';

export class GlobalSettingController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalSettingRepository);
      let records = await repository.getAllActive();
      res.status(200).json({
        success: true,
        message: 'GET GLOBAL SETTING',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(GlobalSettingRepository);
      let records = await repository.createAndSave(req.body);
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'SET GLOBAL SETTING',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
