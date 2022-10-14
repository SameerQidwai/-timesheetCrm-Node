import { ProjectDTO } from './../dto';
import { Request, Response, NextFunction } from 'express';
import { BaseController } from './baseController';
import { ProjectRepository } from '../repositories/projectRepository';
import { getCustomRepository } from 'typeorm';

export class ProjectController extends BaseController<
  ProjectDTO,
  ProjectRepository
> {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let records = [];
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

  async markAsOpen(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.projectId;
      let record = await repository.markProjectAsOpen(parseInt(id));
      res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Project set as Open',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async markAsClosed(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.projectId;
      let record = await repository.markProjectAsClosed(parseInt(id));
      res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Project set as Closed',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async hierarchy(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.projectId;
      let records: any = [];
      records = await repository.getHierarchy(parseInt(id));
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Project Hierarchy',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async getProjecTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.projectId;
      let fiscalYear: any = {
        start: req.query.startDate,
        end: req.query.endDate,
        actual: req.query.actualDate,
      };
      let records: any = [];
      records = await repository.getProjectTracking(parseInt(id), fiscalYear);
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Profit & Loss Statment',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async profit_loss(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.projectId;
      let fiscalYear: any = {
        start: req.query.startDate,
        end: req.query.endDate,
        actual: req.query.actualDate,
      };
      let records: any = [];
      records = await repository.getProfitLoss(parseInt(id), fiscalYear);
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Profit & Loss Statment',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async getCalculatedValue(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.projectId;
      let records: any = [];
      records = await repository.getCalculatedValue(parseInt(id));
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Project Calculated Value',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateProjectValue(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(ProjectRepository);
      let id = req.params.projectId;
      let records: any = [];
      records = await repository.updateProjectValue(parseInt(id));
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Project Calculated Value',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
