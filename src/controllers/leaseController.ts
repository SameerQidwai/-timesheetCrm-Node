import { OpportunityDTO, OpportunityResourceDTO } from './../dto';
import { BaseController } from './baseController';
import { OpportunityRepository } from './../repositories/opportunityRepository';
import { Request, Response, NextFunction } from 'express';
import { OpportunityResource } from 'src/entities/opportunityResource';
import { getCustomRepository } from 'typeorm';
import { EmployeeRepository } from './../repositories/employeeRepository';

export class LeaseController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let employeeId = req.params.employeeId;
      let records = await repository.getAllLeases(parseInt(employeeId));
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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let employeeId = req.params.employeeId;
      let record = await repository.addLease(parseInt(employeeId), req.body);
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Create',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let id = req.params.id;
      let employeeId = req.params.employeeId;
      let record = await repository.updateLease(
        parseInt(employeeId),
        parseInt(id),
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Update ${req.params.id}`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let id = req.params.id;
      let employeeId = req.params.employeeId;
      let record = await repository.findOneCustomLease(
        parseInt(employeeId),
        parseInt(id)
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

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(EmployeeRepository);
      let id = req.params.id;
      let employeeId = req.params.employeeId;
      let record = await repository.deleteLease(
        parseInt(employeeId),
        parseInt(id)
      );
      res.status(200).json({
        success: true,
        message: `Delete ${req.params.id}`,
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }
}
