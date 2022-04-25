import { OpportunityRepository } from './../repositories/opportunityRepository';
import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

export class OpportunityResourceAllocationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let opportunityId = req.params.opportunityId;
      let milestoneId = req.params.milestoneId;
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.addResourceAllocation(
        parseInt(opportunityId),
        parseInt(milestoneId),
        parseInt(opportunityResourceId),
        req.body
      );
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Resource Created Successfully',
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
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.updateResourceAllocation(
        parseInt(opportunityId),
        parseInt(milestoneId),
        parseInt(opportunityResourceId),
        parseInt(id),
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Updated Resource Successfully`,
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
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.findOneCustomResourceAllocation(
        parseInt(opportunityId),
        parseInt(milestoneId),
        parseInt(opportunityResourceId),
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
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.deleteCustomResourceAllocation(
        parseInt(opportunityId),
        parseInt(milestoneId),
        parseInt(opportunityResourceId),
        parseInt(id)
      );
      res.status(200).json({
        success: true,
        message: `Deleted Successfully`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async markAsSelected(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let id = req.params.id;
      let opportunityId = req.params.opportunityId;
      let milestoneId = req.params.milestoneId;
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.markResourceAllocationAsSelected(
        parseInt(opportunityId),
        parseInt(milestoneId),
        parseInt(opportunityResourceId),
        parseInt(id)
      );
      res.status(200).json({
        success: true,
        message: `Marked as Selected`,
        data: null,
      });
    } catch (e) {
      next(e);
    }
  }
}
