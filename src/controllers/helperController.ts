import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { RoleRepository } from './../repositories/roleRepository';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { StandardSkillRepository } from './../repositories/standardSkillRepository';

export class HelperController {
  async helperGetAlContactPersons(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let associated = req.query.associated?.toString() ?? ''; //FLAG IF CONTACT PERSON HAS ASSOCIATIONS;
      let organization = req.query.organizationId?.toString() ?? ''; //ID TO FILTER ORGANIZATION;
      let status = req.query.active?.toString() ?? ''; //FLAG TO FILTER STATUS OF ASSOCIATION OR IF EMPLOYEE;
      let getEmployee = req.query.employee?.toString() ?? ''; // FLAG TO SWITCH BETWEEN CP ID AND EMP ID;
      let label = req.query.label?.toString() ?? ''; //FLAG TO ENABLE DISABLE ROLE LABEL
      const repository = getCustomRepository(EmployeeRepository);

      let records = await repository.helperGetAllContactPersons(
        parseInt(associated),
        parseInt(organization),
        parseInt(status),
        parseInt(getEmployee),
        parseInt(label)
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

  async helperGetAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(RoleRepository);
      let records = await repository.helperGetActiveRoles();
      res.status(200).json({
        success: true,
        message: 'Get All Roles',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
