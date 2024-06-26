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
      if (!panelSkillStandardLevelId) {
        throw Error('panelSkillStandardLevelId is required');
      }
      // console.log("req.params.panelSkillStandardLevelId: ", req.query.panelSkillStandardLevelId);

      let records = await repository.getEmployeesBySkill(
        parseInt(panelSkillStandardLevelId)
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
}
