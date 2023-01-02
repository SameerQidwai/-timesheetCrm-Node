import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { RoleRepository } from './../repositories/roleRepository';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { StandardSkillRepository } from './../repositories/standardSkillRepository';
import { OpportunityRepository } from './../repositories/opportunityRepository';
import { ProjectRepository } from './../repositories/projectRepository';

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

  async helperGetAllWork(req: Request, res: Response, next: NextFunction) {
    let type = req.query.type?.toString() ?? '';
    let employeeId = parseInt(req.query.employee?.toString() ?? '');
    let contactId = parseInt(req.query.contact?.toString() ?? '');
    let organizationId = parseInt(req.query.organization?.toString() ?? '');
    let delegateId = parseInt(req.query.delegate?.toString() ?? '');

    try {
      const repository = getCustomRepository(OpportunityRepository);
      let records = await repository.helperGetAllWork(
        type,
        employeeId,
        contactId,
        organizationId,
        delegateId
      );
      res.status(200).json({
        success: true,
        message: 'Get All Work',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async helperGetProjectsByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let employeeId = parseInt(req.query.userId?.toString() ?? '');
    if (isNaN(employeeId) || employeeId == 0) {
      throw new Error('Employee Id is required');
    }
    let mode = req.query.mode?.toString() ?? '';
    let phase = parseInt(req.query.phase?.toString() ?? '');

    try {
      const repository = getCustomRepository(ProjectRepository);
      let records = await repository.helperGetProjectsByUserId(
        employeeId,
        mode,
        isNaN(phase) ? 1 : phase
      );
      res.status(200).json({
        success: true,
        message: 'Get All Project By Id',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async helperGetMilestonesByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let employeeId = parseInt(req.query.userId?.toString() ?? '');
    let phase = parseInt(req.query.phase?.toString() ?? '');

    let queryStartDate = req.query.startDate as string;
    let queryEndDate = req.query.endDate as string;

    if (isNaN(employeeId) || employeeId == 0) {
      throw new Error('Employee Id is required');
    }
    try {
      const repository = getCustomRepository(ProjectRepository);

      let records = await repository.helperGetMilestonesByUserId(
        employeeId,
        isNaN(phase) ? 1 : phase,
        queryStartDate,
        queryEndDate
      );

      res.status(200).json({
        success: true,
        message: 'Get All Milestones By Id',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
