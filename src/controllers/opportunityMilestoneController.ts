import { Request, Response, NextFunction } from 'express';
import { OpportunityRepository } from '../repositories/opportunityRepository';
import { getCustomRepository } from 'typeorm';
import path from 'path';

export class OpportunityMilestoneController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let records: any = [];
      // const { grantLevel } = res.locals;
      // if (grantLevel.includes('ANY')) {
      // } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
      //   // Call repo function that returns both
      // } else if (grantLevel.includes('MANAGE')) {
      // } else if (grantLevel.includes('OWN')) {
      // }

      records = await repository.getAllActiveMilestones(
        parseInt(req.params.opportunityId)
      );
      res.status(200).json({
        success: true,
        message: 'Opportunity Milestones',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      let opportunityId = parseInt(req.params.opportunityId);
      const repository = getCustomRepository(OpportunityRepository);
      let response = await repository.addMilestone(opportunityId, req.body);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestones Created Succesfully',
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
        parseInt(req.params.opportunityId),
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
        parseInt(req.params.opportunityId),
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
      const repository = getCustomRepository(OpportunityRepository);
      let response = await repository.deleteMilestone(
        parseInt(req.params.opportunityId),
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

  async expenseIndex(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(OpportunityRepository);
      let records: any = [];
      const { grantLevel } = res.locals;
      let opportunityId = parseInt(req.params.opportunityId);
      let milestoneId = parseInt(req.params.milestoneId);
      // if (grantLevel.includes('ANY')) {
      // } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
      //   // Call repo function that returns both
      // } else if (grantLevel.includes('MANAGE')) {
      // } else if (grantLevel.includes('OWN')) {
      // }

      records = await repository.getAllActiveExpenses(
        opportunityId,
        milestoneId
      );
      res.status(200).json({
        success: true,
        message: 'Milestone Expenses',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async expenseCreate(req: Request, res: Response, next: NextFunction) {
    try {
      let opportunityId = parseInt(req.params.opportunityId);
      let milestoneId = parseInt(req.params.milestoneId);
      const repository = getCustomRepository(OpportunityRepository);
      let response = await repository.addExpense(
        opportunityId,
        milestoneId,
        req.body
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Expense Created Successfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async expenseGet(req: Request, res: Response, next: NextFunction) {
    try {
      let opportunityId = parseInt(req.params.opportunityId);
      let milestoneId = parseInt(req.params.milestoneId);

      const repository = getCustomRepository(OpportunityRepository);
      let response = await repository.findOneCustomExpense(
        opportunityId,
        milestoneId,
        parseInt(req.params.id)
      );
      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Milestone Expense View',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async expenseUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      let opportunityId = parseInt(req.params.opportunityId);
      let milestoneId = parseInt(req.params.milestoneId);
      const repository = getCustomRepository(OpportunityRepository);
      let response = await repository.updateExpense(
        opportunityId,
        milestoneId,
        parseInt(req.params.id),
        req.body
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Expense Updated Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async expenseDelete(req: Request, res: Response, next: NextFunction) {
    try {
      let opportunityId = parseInt(req.params.opportunityId);
      let milestoneId = parseInt(req.params.milestoneId);
      const repository = getCustomRepository(OpportunityRepository);
      let response = await repository.deleteCustomExpense(
        opportunityId,
        milestoneId,
        parseInt(req.params.id)
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Expense Deleted Succesfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
