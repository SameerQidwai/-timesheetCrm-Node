import { NextFunction, Request, Response } from 'express';
import { schduleRulesValidator } from '../rules';
import { getCustomRepository } from 'typeorm';
import { ProjectRepository } from '../repositories/projectRepository';

export class ProjectShutdownPeriodController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let records: any = [];
      let projectId = parseInt(req.params.projectId);

      records = await repository.getAllShutdownPeriods(projectId);
      res.status(200).json({
        success: true,
        message: 'Project ShutdownPeriods',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      let projectId = parseInt(req.params.projectId);

      await schduleRulesValidator.validateCreate.validateAsync(req.body);

      const repository = getCustomRepository(ProjectRepository);

      let response = await repository.addShutdownPeriod(projectId, req.body);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'ShutdownPeriod Created Successfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      let projectId = parseInt(req.params.projectId);

      const repository = getCustomRepository(ProjectRepository);
      let response = await repository.findOneShutdownPeriod(
        projectId,
        parseInt(req.params.id)
      );
      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestone ShutdownPeriod View',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      let projectId = parseInt(req.params.projectId);

      await schduleRulesValidator.validateCreate.validateAsync(req.body);

      const repository = getCustomRepository(ProjectRepository);

      let response = await repository.updateShutdownPeriod(
        projectId,
        parseInt(req.params.id),
        req.body
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'ShutdownPeriod Updated Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      let projectId = parseInt(req.params.projectId);
      const repository = getCustomRepository(ProjectRepository);
      let response = await repository.deleteShutdownPeriod(
        projectId,
        parseInt(req.params.id)
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'ShutdownPeriod Deleted Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
