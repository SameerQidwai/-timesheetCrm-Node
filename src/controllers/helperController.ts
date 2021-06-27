import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { StandardSkillRepository } from './../repositories/standardSkillRepository';

export class HelperController {
  async helperGetAlContactPersons(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let associated = req.query.associated?.toString() ?? '';
      let organization = req.query.organizationId?.toString() ?? '';
      let status = req.query.active?.toString() ?? '';
      let getEmployee = req.query.employee?.toString() ?? '';
      const repository = getCustomRepository(EmployeeRepository);

      let records = await repository.helperGetAllContactPersons(
        parseInt(associated),
        parseInt(organization),
        parseInt(status),
        parseInt(getEmployee)
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

  async helperGetLevelsBySkill(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let skillId = req.query.skill?.toString() ?? '';
      const repository = getCustomRepository(StandardSkillRepository);
      let records = await repository.helplerGetLevelsBySkill(parseInt(skillId));
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
