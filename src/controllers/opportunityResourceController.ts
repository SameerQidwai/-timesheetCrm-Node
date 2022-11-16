import { OpportunityRepository } from './../repositories/opportunityRepository';
import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

export class OpportunityResourceController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('controller - index: ', this);
      const repository = getCustomRepository(OpportunityRepository);
      let opportunityId = req.params.opportunityId;
      let milestoneId = req.params.milestoneId;
      let records = await repository.getAllActiveResources(
        parseInt(opportunityId),
        parseInt(milestoneId)
      );
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Get ALL',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let opportunityId = req.params.opportunityId;
      let milestoneId = req.params.milestoneId;
      let record = await repository.addResource(
        parseInt(opportunityId),
        parseInt(milestoneId),
        req.body
      );
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Position Created Successfully',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let id = req.params.id;
      let opportunityId = req.params.opportunityId;
      let milestoneId = req.params.milestoneId;
      let record = await repository.updateResource(
        parseInt(opportunityId),
        parseInt(milestoneId),
        parseInt(id),
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Position Updated Successfully`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let id = req.params.id;
      let opportunityId = req.params.opportunityId;
      let milestoneId = req.params.milestoneId;
      let record = await repository.findOneCustomResource(
        parseInt(opportunityId),
        parseInt(milestoneId),
        parseInt(id)
      );
      if (!record) throw new Error('not found');
      res.status(200).json({
        success: true,
        message: `Get`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let id = req.params.id;
      let opportunityId = req.params.opportunityId;
      let milestoneId = req.params.milestoneId;
      let record = await repository.deleteCustomResource(
        parseInt(opportunityId),
        parseInt(milestoneId),
        parseInt(id)
      );
      res.status(200).json({
        success: true,
        message: `Position Deleted Successfully`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }
}
