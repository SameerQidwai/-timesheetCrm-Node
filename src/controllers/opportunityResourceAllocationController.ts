import { OpportunityDTO, OpportunityResourceDTO } from './../dto';
import { BaseController } from './baseController';
import { OpportunityRepository } from './../repositories/opportunityRepository';
import { Request, Response, NextFunction } from 'express';
import { OpportunityResource } from 'src/entities/opportunityResource';
import { getCustomRepository } from 'typeorm';

export class OpportunityResourceAllocationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let opportunityId = req.params.opportunityId;
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.addResourceAllocation(
        parseInt(opportunityId),
        parseInt(opportunityResourceId),
        req.body
      );
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Create',
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
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.updateResourceAllocation(
        parseInt(opportunityId),
        parseInt(opportunityResourceId),
        parseInt(id),
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Update ${req.params.id}`,
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
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.findOneCustomResourceAllocation(
        parseInt(opportunityId),
        parseInt(opportunityResourceId),
        parseInt(id)
      );
      if (!record) throw new Error('not found');
      res.status(200).json({
        success: true,
        message: `Get ${req.params.id}`,
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
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.deleteCustomResourceAllocation(
        parseInt(opportunityId),
        parseInt(opportunityResourceId),
        parseInt(id)
      );
      res.status(200).json({
        success: true,
        message: `Delete ${req.params.id}`,
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
      let opportunityResourceId = req.params.opportunityResourceId;
      let record = await repository.markResourceAllocationAsSelected(
        parseInt(opportunityId),
        parseInt(opportunityResourceId),
        parseInt(id)
      );
      res.status(200).json({
        success: true,
        message: `Marked as Selected ${req.params.id}`,
        data: null,
      });
    } catch (e) {
      next(e);
    }
  }
}
