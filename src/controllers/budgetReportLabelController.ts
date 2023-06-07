import { Request, Response, NextFunction } from 'express';
import { BudgetReportLabelRepository } from '../repositories/budgetReportLabelRepository';
import { getCustomRepository } from 'typeorm';

export class BudgetReportLabelController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(BudgetReportLabelRepository);

      let userId = res.locals.jwtPayload.id;
      let response = await repository.createAndSave(req.body, userId);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Label Saved Successfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(BudgetReportLabelRepository);

      let response: string = await repository.getAllActive();

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Get All Labels',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(BudgetReportLabelRepository);

      let response: string = await repository.customDelete(req.params.title);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Target Label Deleted',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async getReport(req: Request, res: Response, next: NextFunction) {
    try {

      let startDate = req.query.fiscalYearStart as string
      let endDate = req.query.fiscalYearEnd as string

      let repository = getCustomRepository(BudgetReportLabelRepository);

      let response: string = await repository.getReport(startDate, endDate);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Get Budget Report ',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateReport(req: Request, res: Response, next: NextFunction) {
    try {
      let repository = getCustomRepository(BudgetReportLabelRepository);

      let response = await repository.updateReport(req.body);

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Report Updated Successfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
