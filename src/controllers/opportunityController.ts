import { OpportunityDTO } from './../dto';
import { BaseController } from './baseController';
import { Request, Response, NextFunction } from 'express';
import { OpportunityRepository } from './../repositories/opportunityRepository';
import { getCustomRepository } from 'typeorm';

export class OpportunityController extends BaseController<
  OpportunityDTO,
  OpportunityRepository
> {
  async markAsLost(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let id = req.params.id;
      let record = await repository.markOpportunityAsLost(
        parseInt(id),
        req.body
      );
      res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Opportunity marked as lost',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async markAsWin(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let id = req.params.id;
      let record = await repository.markOpportunityAsWin(
        parseInt(id),
        req.body
      );
      res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Opportunity moved to projects',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let records: any = [];
      const { grantLevel } = res.locals;
      if (grantLevel.includes('ANY')) {
        records = await repository.getAllActive();
      } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
        // Call repo function that returns both
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.getManageActive(
          parseInt(res.locals.jwtPayload.id)
        );
      } else if (grantLevel.includes('OWN')) {
        // call repo function that return only owned
      }
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Index Opportunity',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async hierarchy(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let id = req.params.opportunityId;
      let records: any = [];
      records = await repository.getHierarchy(parseInt(id));
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Opportunity Hierarchy',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
  async holidays(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      // let id = req.params.opportunityId;
      let records: any = [];
      records = await repository.getHolidays();
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'All Holidays',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
