import { TimesheetDTO } from './../dto';
import { BaseController } from './baseController';
import { Request, Response, NextFunction } from 'express';
import { TimesheetRepository } from './../repositories/timesheetRepository';
import { getCustomRepository } from 'typeorm';
import moment from 'moment';
import { TimesheetProjectEntry } from '../entities/timesheetProjectEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Timesheet } from '../entities/timesheet';
import { TimesheetStatus } from '../constants/constants';

export class TimesheetController {
  async getTimesheet(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;

      let record: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;
      if (grantLevel.includes('ANY')) {
        record = await repository.getAnyTimesheet(
          startDate,
          endDate,
          userId,
          user.id
        );
      } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
        if (user.id == userId) {
          record = await repository.getOwnTimesheet(
            startDate,
            endDate,
            userId,
            parseInt(user.id)
          );
        } else {
          record = await repository.getManageTimesheet(
            startDate,
            endDate,
            userId,
            parseInt(user.id)
          );
        }
      } else if (grantLevel.includes('MANAGE')) {
        record = await repository.getManageTimesheet(
          startDate,
          endDate,
          userId,
          parseInt(user.id)
        );
      } else if (grantLevel.includes('OWN')) {
        record = await repository.getOwnTimesheet(
          startDate,
          endDate,
          userId,
          parseInt(user.id)
        );
      }

      res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Specific Timesheet by Date',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async addTimesheetEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;

      const { user } = res.locals;

      if (user.id != userId) {
        throw new Error('Not Allowed');
      }
      let record = await repository.addTimesheetEntry(
        startDate,
        endDate,
        userId,
        req.body
      );
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Timesheet Created Successfully',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async editTimesheetEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let entryId = parseInt(req.params.id);

      let record = await repository.editTimesheetEntry(entryId, req.body);
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Timesheet Updated Succesfully',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async submitTimesheetProjectEntry(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;
      let projectEntryId = parseInt(req.params.id);

      // console.log(req.body);
      const { user } = res.locals;

      if (user.id != userId) {
        throw new Error('Not Allowed');
      }

      let record = await repository.submitProjectTimesheetEntry(
        startDate,
        endDate,
        userId,
        projectEntryId
      );
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Timesheet Submitted',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async approveTimesheetProjectEntry(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;
      let projectEntryId = parseInt(req.params.id);

      let record: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;
      // console.log(req.body);

      if (grantLevel.includes('ANY')) {
        record = await repository.approveAnyProjectTimesheetEntry(
          startDate,
          endDate,
          userId,
          projectEntryId
        );
      } else if (grantLevel.includes('MANAGE')) {
        record = await repository.approveManageProjectTimesheetEntry(
          startDate,
          endDate,
          userId,
          projectEntryId,
          user.id
        );
      }

      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Timesheet Approved',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async rejectTimesheetProjectEntry(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;
      let projectEntryId = parseInt(req.params.id);

      let record: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;
      // console.log(req.body);

      if (grantLevel.includes('ANY')) {
        record = await repository.rejectAnyProjectTimesheetEntry(
          startDate,
          endDate,
          userId,
          projectEntryId
        );
      } else if (grantLevel.includes('MANAGE')) {
        record = await repository.rejectManageProjectTimesheetEntry(
          startDate,
          endDate,
          userId,
          projectEntryId,
          user.id
        );
      }

      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Timesheet Rejected',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteTimesheetEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let entryId = parseInt(req.params.id);

      // console.log(req.body);

      let record = await repository.deleteTimesheetEntry(entryId);
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Timesheet Deleted',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateTimesheetProjectEntryNote(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let projectEntryId = parseInt(req.params.id);

      let record = await repository.updateTimesheetProjectEntryNote(
        projectEntryId,
        req.body.note,
        req.body.attachments
      );
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Note Updated Successfully',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async getTimesheetProjectUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let records: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;
      if (grantLevel.includes('ANY')) {
        records = await repository.getAnyProjectUsers();
      } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
        records = await repository.getManageAndOwnProjectUsers(
          user.id,
          `${user.contactPersonOrganization.contactPerson.firstName} ${user.contactPersonOrganization.contactPerson.lastName}`
        );
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.getManageProjectUsers(user.id);
      } else if (grantLevel.includes('OWN')) {
        records = await repository.getOwnProjectUsers(
          user.id,
          `${user.contactPersonOrganization.contactPerson.firstName} ${user.contactPersonOrganization.contactPerson.lastName}`
        );
      }
      console.log('records: ', records);
      res.status(200).json({
        success: true,
        message: 'Index Users',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async getTimesheetPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let projectEntryId = parseInt(req.params.projectEntryId) as number;

      let record: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;

      record = await repository.getTimesheetPDF(projectEntryId);

      res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Specific Timesheet by Date',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }
}
