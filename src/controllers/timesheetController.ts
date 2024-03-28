import { TimesheetDTO } from './../dto';
import { BaseController } from './baseController';
import { Request, Response, NextFunction } from 'express';
import { TimesheetRepository } from './../repositories/timesheetRepository';
import { getCustomRepository } from 'typeorm';
import moment from 'moment-timezone';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
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

      const { user, grantLevel } = res.locals;

      // if (grantLevel.includes('ANY')) {
      // } else if (grantLevel.includes('MANAGE')) {
      // } else {
      //   if (user.id != userId) {
      //     throw new Error('Not Allowed');
      //   }
      // }
      let record = await repository.addTimesheetEntry(
        startDate,
        endDate,
        userId,
        user.id,
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

  async bulkAddTimesheetEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;

      const { user } = res.locals;

      let record = await repository.addBulkTimesheetEntry(
        startDate,
        endDate,
        userId,
        user.id,
        req.body
      );
      // console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Bulk Timesheet Created Successfully',
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
      const { user } = res.locals;

      let record = await repository.editTimesheetEntry(
        entryId,
        user.id,
        req.body
      );
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

  async submitTimesheetMilestoneEntry(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;

      // console.log(req.body);
      const { user } = res.locals;

      let requestEntries = req.body.milestoneEntries;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not foun');
      }

      let record = await repository.submitMilestoneTimesheetEntry(
        startDate,
        endDate,
        userId,
        user.id,
        requestEntries
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

  async deleteTimesheetMilestoneEntry(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;

      let record: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;
      // console.log(req.body);

      let requestEntries = req.body.milestoneEntries;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not foun');
      }

      record = await repository.deleteAnyMilestoneTimesheetEntry(
        startDate,
        endDate,
        userId,
        requestEntries
      );

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

  async approveTimesheetMilestoneEntry(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;

      let record: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;
      // console.log(req.body);

      let requestEntries = req.body.milestoneEntries;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not foun');
      }

      if (grantLevel.includes('ANY')) {
        record = await repository.approveAnyMilestoneTimesheetEntry(
          startDate,
          endDate,
          userId,
          req.body
        );
      } else if (grantLevel.includes('MANAGE')) {
        record = await repository.approveManageMilestoneTimesheetEntry(
          startDate,
          endDate,
          userId,
          req.body,
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

  async rejectTimesheetMilestoneEntry(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;

      let record: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;
      // console.log(req.body);

      let requestEntries = req.body.milestoneEntries;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not foun');
      }

      if (grantLevel.includes('ANY')) {
        record = await repository.rejectAnyMilestoneTimesheetEntry(
          startDate,
          endDate,
          userId,
          req.body
        );
      } else if (grantLevel.includes('MANAGE')) {
        record = await repository.rejectManageMilestoneTimesheetEntry(
          startDate,
          endDate,
          userId,
          req.body,
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

  async unapproveTimesheetMilestoneEntry(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let userId = parseInt(req.params.userId) as number;

      let record: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;
      // console.log(req.body);

      let requestEntries = req.body.milestoneEntries;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not foun');
      }

      if (grantLevel.includes('ANY')) {
        record = await repository.unapproveAnyMilestoneTimesheetEntry(
          startDate,
          endDate,
          userId,
          req.body
        );
      } else if (grantLevel.includes('MANAGE')) {
        record = await repository.unapproveManageMilestoneTimesheetEntry(
          startDate,
          endDate,
          userId,
          req.body,
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

  async updateTimesheetMilestoneEntryNote(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      const { user } = res.locals;

      let record = await repository.updateTimesheetMilestoneEntryNote(
        req.body,
        user.id
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
        records = await repository.getUserAnyUsers();
      } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
        records = await repository.getUserManageAndOwnUsers(
          user.id,
          `${user.contactPersonOrganization.contactPerson.firstName} ${user.contactPersonOrganization.contactPerson.lastName}`
        );
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.getUserManageUsers(user.id);
      } else if (grantLevel.includes('OWN')) {
        records = await repository.getUserOwnUsers(
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

      let record: any = [];
      const { grantLevel } = res.locals;
      const { user } = res.locals;

      record = await repository.getTimesheetPDF(req.body);

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

  async getTimesheetByMilestone(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(TimesheetRepository);
      let startDate = req.params.startDate as string;
      let endDate = req.params.endDate as string;
      let milestoneId = parseInt(req.params.milestoneId) as number;

      const { grantLevel } = res.locals;
      const { user } = res.locals;
      let records: any = [];

      if (grantLevel.includes('ANY')) {
        let milestoneIds = await repository._getUserAnyMilestones('array');

        if (!milestoneIds.includes(milestoneId) && milestoneId != 0) {
          throw new Error('Milestone not found');
        }

        records = await repository.getAnyTimesheetByMilestone(
          startDate,
          endDate,
          milestoneId == 0 ? milestoneIds : [milestoneId],
          user.id
        );
      } else if (grantLevel.includes('MANAGE')) {
        let milestoneIds = await repository._getUserManageMilestones(
          user.id,
          'array'
        );

        if (!milestoneIds.includes(milestoneId) && milestoneId != 0) {
          throw new Error('Milestone not found');
        }

        records = await repository.getAnyTimesheetByMilestone(
          startDate,
          endDate,
          milestoneId == 0 ? milestoneIds : [milestoneId],
          user.id
        );
      } else {
        records = [];
      }

      res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Specific Timesheet by Date (Milestone)',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async getTimesheetUserMilestones(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let records: any = [];
      const repository = getCustomRepository(TimesheetRepository);
      const { grantLevel } = res.locals;
      const { user } = res.locals;

      if (grantLevel.includes('ANY')) {
        records = await repository._getUserAnyMilestones();
      } else if (grantLevel.includes('MANAGE') && grantLevel.includes('OWN')) {
        records = await repository._getUserManageAndOwnMilestones(user.id);
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository._getUserManageMilestones(user.id);
      } else if (grantLevel.includes('OWN')) {
        records = await repository._getUserOwnMilestones(user.id);
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

  _customQueryParser(query = '') {
    let ids = [];

    for (let item of query.split(',')) {
      if (isNaN(parseInt(item))) continue;

      ids.push(parseInt(item));
    }

    return ids;
  }
}
