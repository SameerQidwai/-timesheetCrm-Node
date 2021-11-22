import { Request, Response, NextFunction } from 'express';
import { OpportunityRepository } from '../repositories/opportunityRepository';
import { MilestoneRepository } from '../repositories/milestoneRepository';
import { getCustomRepository } from 'typeorm';
import path from 'path';

export class ProjectMilestoneController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let records: any = [];
      const { grantLevel } = res.locals;
      // if (grantLevel.includes('ANY')) {
      // } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
      //   // Call repo function that returns both
      // } else if (grantLevel.includes('MANAGE')) {
      // } else if (grantLevel.includes('OWN')) {
      // }

      records = await repository.getAllActiveMilestones(
        parseInt(req.params.projectId)
      );
      res.status(200).json({
        success: true,
        message: 'Project Milestones',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      let projectId = parseInt(req.params.projectId);
      const repository = getCustomRepository(OpportunityRepository);
      let response = await repository.addMilestone(projectId, req.body);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestone Created Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let response = await repository.findOneCustomMilestone(
        parseInt(req.params.projectId),
        parseInt(req.params.id)
      );
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
      const repository = getCustomRepository(OpportunityRepository);
      let response = await repository.updateMilestone(
        parseInt(req.params.projectId),
        parseInt(req.params.id),
        req.body
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
