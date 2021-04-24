import { OpportunityDTO } from './../dto';
import { BaseController } from './baseController';
import { Request, Response } from 'express';
import { OpportunityRepository } from './../repositories/opportunityRepository';
import { getCustomRepository } from 'typeorm';

export class OpportunityController extends BaseController<
  OpportunityDTO,
  OpportunityRepository
> {
  async markAsLost(req: Request, res: Response) {
    const repository = getCustomRepository(OpportunityRepository);
    let id = req.params.id;
    let record = await repository.markOpportunityAsLost(parseInt(id));
    res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Opportunity marked as lost',
      data: record,
    });
  }

  async markAsWin(req: Request, res: Response) {
    const repository = getCustomRepository(OpportunityRepository);
    let id = req.params.id;
    let record = await repository.markOpportunityAsWin(parseInt(id), req.body);
    res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Opportunity moved to projects',
      data: record,
    });
  }
}
