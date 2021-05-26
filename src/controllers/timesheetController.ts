import { TimesheetDTO } from './../dto';
import { BaseController } from './baseController';
import { Request, Response } from 'express';
import { TimesheetRepository } from './../repositories/timesheetRepository';
import { getCustomRepository } from 'typeorm';
import moment from 'moment';
import { TimesheetProjectEntry } from '../entities/timesheetProjectEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Timesheet } from '../entities/timesheet';
import { TimesheetStatus } from '../constants/constants';

export class TimesheetController {
  async getTimesheet(req: Request, res: Response) {
    const repository = getCustomRepository(TimesheetRepository);
    let startDate = req.params.startDate as string;
    let endDate = req.params.endDate as string;
    let userId = parseInt(req.params.userId) as number;

    console.log(startDate, endDate, userId);
    let record: Timesheet = await repository.getTimesheet(
      startDate,
      endDate,
      userId
    );

    if (!record) {
      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Specific Timesheet by Date',
        data: null,
      });
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    let projects: any = [];
    let projectStatuses: any = [];

    interface Any {
      [key: string]: any;
    }

    record.projectEntries.map((projectEntry: TimesheetProjectEntry) => {
      let status: TimesheetStatus = TimesheetStatus.SAVED;

      let project: Any = {
        projectEntryId: projectEntry.id,
        projectId: projectEntry.projectId,
        project: projectEntry.project.title,
        notes: projectEntry.notes,
      };

      projectEntry.entries.map((entry: TimesheetEntry) => {
        project[moment(entry.date, 'DD-MM-YYYY').format('D/M')] = {
          entryId: entry.id,
          startTime: moment(entry.startTime, 'HH:mm').format('HH:mm'),
          endTime: moment(entry.endTime, 'HH:mm').format('HH:mm'),
          breakHours: entry.breakHours,
          actualHours: entry.hours,
          notes: entry.notes,
        };

        if (entry.rejectedAt !== null) status = TimesheetStatus.REJECTED;
        else if (entry.approvedAt !== null) status = TimesheetStatus.APPROVED;
        else if (entry.submittedAt !== null) status = TimesheetStatus.SUBMITTED;
      });

      project.status = status;
      projectStatuses.push(status);

      projects.push(project);
    });

    console.log(projectStatuses);
    let timesheetStatus: TimesheetStatus = projectStatuses.includes(
      TimesheetStatus.REJECTED
    )
      ? TimesheetStatus.REJECTED
      : projectStatuses.includes(TimesheetStatus.SAVED)
      ? TimesheetStatus.SAVED
      : projectStatuses.includes(TimesheetStatus.SUBMITTED)
      ? TimesheetStatus.SUBMITTED
      : projectStatuses.includes(TimesheetStatus.APPROVED)
      ? TimesheetStatus.APPROVED
      : TimesheetStatus.SAVED;

    let response = {
      id: record.id,
      status: timesheetStatus,
      notes: record.notes,
      projects: projects,
    };

    //-- END OF MODIFIED RESPONSE FOR FRONTEND

    res.status(200).json({
      success: true,
      // message: `Win Opportunity ${req.params.id}`,
      message: 'Specific Timesheet by Date',
      data: response,
    });
  }

  async addTimesheetEntry(req: Request, res: Response) {
    const repository = getCustomRepository(TimesheetRepository);
    let startDate = req.params.startDate as string;
    let endDate = req.params.endDate as string;
    let userId = parseInt(req.params.userId) as number;

    // console.log(req.body);

    let record = await repository.addTimesheetEntry(
      startDate,
      endDate,
      userId,
      req.body
    );
    console.log('record: ', record);
    res.status(200).json({
      success: true,
      message: 'Create',
      data: record,
    });
  }

  async editTimesheetEntry(req: Request, res: Response) {
    const repository = getCustomRepository(TimesheetRepository);
    let entryId = parseInt(req.params.id);

    // console.log(req.body);

    let record = await repository.editTimesheetEntry(entryId, req.body);
    console.log('record: ', record);
    res.status(200).json({
      success: true,
      message: 'Edit',
      data: record,
    });
  }

  async submitTimesheetProjectEntry(req: Request, res: Response) {
    const repository = getCustomRepository(TimesheetRepository);
    let startDate = req.params.startDate as string;
    let endDate = req.params.endDate as string;
    let userId = parseInt(req.params.userId) as number;
    let projectEntryId = parseInt(req.params.id);

    // console.log(req.body);

    let record = await repository.submitProjectTimesheetEntry(
      startDate,
      endDate,
      userId,
      projectEntryId
    );
    console.log('record: ', record);
    res.status(200).json({
      success: true,
      message: 'Submit',
      data: record,
    });
  }

  async approveTimesheetProjectEntry(req: Request, res: Response) {
    const repository = getCustomRepository(TimesheetRepository);
    let startDate = req.params.startDate as string;
    let endDate = req.params.endDate as string;
    let userId = parseInt(req.params.userId) as number;
    let projectEntryId = parseInt(req.params.id);

    // console.log(req.body);

    let record = await repository.approveProjectTimesheetEntry(
      startDate,
      endDate,
      userId,
      projectEntryId
    );
    console.log('record: ', record);
    res.status(200).json({
      success: true,
      message: 'Approve',
      data: record,
    });
  }

  async rejectTimesheetProjectEntry(req: Request, res: Response) {
    const repository = getCustomRepository(TimesheetRepository);
    let startDate = req.params.startDate as string;
    let endDate = req.params.endDate as string;
    let userId = parseInt(req.params.userId) as number;
    let projectEntryId = parseInt(req.params.id);

    // console.log(req.body);

    let record = await repository.rejectProjectTimesheetEntry(
      startDate,
      endDate,
      userId,
      projectEntryId
    );
    console.log('record: ', record);
    res.status(200).json({
      success: true,
      message: 'Reject',
      data: record,
    });
  }

  async deleteTimesheetEntry(req: Request, res: Response) {
    const repository = getCustomRepository(TimesheetRepository);
    let entryId = parseInt(req.params.id);

    // console.log(req.body);

    let record = await repository.deleteTimesheetEntry(entryId);
    console.log('record: ', record);
    res.status(200).json({
      success: true,
      message: 'Deleted',
      data: record,
    });
  }

  async updateTimesheetProjectEntryNote(req: Request, res: Response) {
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
      message: 'Project Entry note updated',
      data: record,
    });
  }
}