import { EmployeeDTO } from './../dto';
import { BaseController } from './baseController';
import { EmployeeRepository } from './../repositories/employeeRepository';
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

export class EmployeeController extends BaseController<
  EmployeeDTO,
  EmployeeRepository
> {
  async contactPersons(req: Request, res: Response) {
    const repository = getCustomRepository(EmployeeRepository);
    let records = await repository.getAllContactPersons();
    console.log('records: ', records);
    res.status(200).json({
      success: true,
      message: 'Get ALL',
      data: records,
    });
  }

  async getEmployeesBySkill(req: Request, res: Response) {
    const repository = getCustomRepository(EmployeeRepository);
    let panelSkillStandardLevelId =
      req.query.panelSkillStandardLevelId?.toString();
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
  }

  async helperGetAlContactPersons(req: Request, res: Response) {
    let associated = req.query.associated?.toString() ?? '';
    let organization = req.query.organizationId?.toString() ?? '';
    let status = req.query.active?.toString() ?? '';
    let getEmployee = req.query.employee?.toString() ?? '';
    console.log({ organization, status });
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
  }
}
