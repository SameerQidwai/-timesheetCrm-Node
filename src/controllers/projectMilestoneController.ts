import { Request, Response, NextFunction } from 'express';
import { ProjectRepository } from '../repositories/projectRepository';
import { getCustomRepository } from 'typeorm';
import path from 'path';

export class ProjectMilestoneController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
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

  async approvalIndex(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let records: any = [];
      let projectId = req.query.projectId?.toString() ?? '';
      const { grantLevel, user } = res.locals;
      if (grantLevel.includes('ANY')) {
        records = await repository.getAllApprovalMilestones(
          parseInt(projectId)
        );
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.getManagerApprovalMilestones(
          user.id,
          parseInt(projectId)
        );
      }

      res.status(200).json({
        success: true,
        message: 'Milestones Approval',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async approveMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let records: any = [];
      let milestoneId = req.params.id;
      const { grantLevel, user } = res.locals;
      if (grantLevel.includes('ANY')) {
        records = await repository.approveAnyMilestone(parseInt(milestoneId));
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.approveManageMilestone(
          user.id,
          parseInt(milestoneId)
        );
      }

      res.status(200).json({
        success: true,
        message: 'Milestone Approved',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async exportMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let records: any = [];
      let milestoneId = req.params.id;
      const { grantLevel, user } = res.locals;
      if (grantLevel.includes('ANY')) {
        records = await repository.exportAnyMilestone(parseInt(milestoneId));
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.exportManageMilestone(
          user.id,
          parseInt(milestoneId)
        );
      }

      res.status(200).json({
        success: true,
        message: 'Milestones Approval',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async uploadMilestoneFile(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let records: any = [];
      let milestoneId = req.params.id;
      const { grantLevel, user } = res.locals;
      if (grantLevel.includes('ANY')) {
        records = await repository.uploadAnyMilestoneFile(
          parseInt(milestoneId),
          req.body
        );
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.uploadManageMilestoneFile(
          user.id,
          parseInt(milestoneId),
          req.body
        );
      }

      res.status(200).json({
        success: true,
        message: 'Milestone File Uploaded',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      let projectId = parseInt(req.params.projectId);
      const repository = getCustomRepository(ProjectRepository);
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
      const repository = getCustomRepository(ProjectRepository);
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
      const repository = getCustomRepository(ProjectRepository);
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

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let response = await repository.deleteMilestone(
        parseInt(req.params.projectId),
        parseInt(req.params.id)
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestones Deleted Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
