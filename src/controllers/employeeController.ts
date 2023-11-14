import { EmployeeDTO } from './../dto';
import { BaseController } from './baseController';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';

export class EmployeeController extends BaseController<
  EmployeeDTO,
  EmployeeRepository
> {
  async contactPersons(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let records = await repository.getAllContactPersons();
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Get Employee ContactPersons',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async getEmployeesBySkill(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let panelSkillStandardLevelId = req.query.psslId?.toString();
      let workType = req.query.workType?.toString() ?? 'O';

      if (!panelSkillStandardLevelId) {
        throw new Error('panelSkillStandardLevelId is required');
      }
      // console.log("req.params.panelSkillStandardLevelId: ", req.query.panelSkillStandardLevelId);

      let records = await repository.getEmployeesBySkill(
        parseInt(panelSkillStandardLevelId),
        workType
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

  async getEmployeeCost(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let employeeId = req.params.employeeId;
      let searchIn = !!(req.query.searchIn === 'contactPerson');
      let startDate = req.query.startDate as string;
      let record = await repository.costCalculator(
        parseInt(employeeId),
        searchIn,
        startDate
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

  async toggleActiveStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let employeeId = parseInt(req.params.employeeId);
      const { user } = res.locals;

      if (user.id === employeeId) {
        throw new Error('Cannot change own active status');
      }

      let record = await repository.toggleActiveStatus(employeeId);
      res.status(200).json({
        success: true,
        message: `Employee Status Changed`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }
}
