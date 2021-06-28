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

  async index(req: Request, res: Response) {
    const repository = getCustomRepository(OpportunityRepository);
    let records = [];
    const { grantLevel } = res.locals;
    if (grantLevel.includes("ANY")) {

      records = await repository.getAllActive();

    } else if (grantLevel.includes("MANAGE") && grantLevel.includes("OWN")) {
      // Call repo function that returns both

    } else if (grantLevel.includes("MANAGE")) {
      // call repo function that returns only Managed

    } else if (grantLevel.includes("OWN")) {
      // call repo function that return only owned

    }
    console.log("records: ", records);
    res.status(200).json({
        success: true,
        message: "Get ALL",
        data: records
    });
}
}
