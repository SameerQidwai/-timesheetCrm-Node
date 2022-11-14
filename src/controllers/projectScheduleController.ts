import { NextFunction, Request, Response } from 'express';
import { schduleRulesValidator } from '../rules';
import { getCustomRepository } from 'typeorm';
import { ProjectRepository } from '../repositories/projectRepository';

export class ProjectScheduleController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let records: any = [];
      let projectId = parseInt(req.params.projectId);

      records = await repository.getAllSchedules(projectId);
      res.status(200).json({
        success: true,
        message: 'Project Schedules',
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

      let response = await repository.addSchedule(projectId, req.body);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Schedule Created Successfully',
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
      let response = await repository.findOneSchedule(
        projectId,
        parseInt(req.params.id)
      );
      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestone Schedule View',
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

      let response = await repository.updateSchedule(
        projectId,
        parseInt(req.params.id),
        req.body
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Schedule Updated Succesfully',
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
      let response = await repository.deleteSchedule(
        projectId,
        parseInt(req.params.id)
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Schedule Deleted Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
