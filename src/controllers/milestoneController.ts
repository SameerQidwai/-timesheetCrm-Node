import { Request, Response, NextFunction } from 'express';
import { MilestoneRepository } from './../repositories/milestoneRepository';
import { getCustomRepository } from 'typeorm';
import path from 'path';

export class MilestoneController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(MilestoneRepository);
      let response = await repository.getAllActive();

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestones Index',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(MilestoneRepository);
      let userId = res.locals.jwtPayload.id;
      let response = await repository.createAndSave(req.body, userId);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestones Created Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(MilestoneRepository);
      let response = await repository.findOneCustom(parseInt(req.params.id));
      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestones View Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(MilestoneRepository);
      let userId = res.locals.jwtPayload.id;
      let response = await repository.updateAndReturn(
        parseInt(req.params.id),
        req.body,
        userId
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestones Updated Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
