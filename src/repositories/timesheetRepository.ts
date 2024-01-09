import {
  MilestoneEntriesPrintDTO,
  MilestoneEntriesUpdateDTO,
  TimesheetEntryApproveRejectDTO,
  TimesheetDTO,
  BulkTimesheetDTO,
} from '../dto';
import {
  EntityRepository,
  Repository,
  MoreThan,
  In,
  Not,
  IsNull,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { Timesheet } from '../entities/timesheet';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Attachment } from '../entities/attachment';
import {
  TimesheetStatus,
  EntityType,
  OpportunityStatus,
  NotificationEventType,
} from '../constants/constants';
import { Employee } from '../entities/employee';
import { Opportunity } from '../entities/opportunity';
import { OpportunityResourceAllocation } from '../entities/opportunityResourceAllocation';
import moment from 'moment-timezone';
import { Moment } from 'moment';
import { Milestone } from '../entities/milestone';
import { LeaveRequest } from '../entities/leaveRequest';
import { OpportunityResource } from '../entities/opportunityResource';
import { NotificationManager } from '../utilities/notifier';
import PDFDocument, { font } from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

@EntityRepository(Timesheet)
export class TimesheetRepository extends Repository<Timesheet> {
  async getAnyTimesheet(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    authId: number
  ): Promise<any | undefined> {
    let mStartDate = moment(startDate, 'DD-MM-YYYY');
    let mEndDate = moment(endDate, 'DD-MM-YYYY').endOf('day');

    let cStartDate = mStartDate.format('YYYY-MM-DD HH:mm:ss.SSS');
    let cEndDate = mEndDate.format('YYYY-MM-DD HH:mm:ss.SSS');

    console.log(cStartDate, cEndDate);
    let timesheet = await this.findOne({
      where: { startDate: cStartDate, endDate: cEndDate, employeeId: userId },
      relations: [
        'milestoneEntries',
        'milestoneEntries.milestone',
        'milestoneEntries.milestone.project',
        'milestoneEntries.entries',
      ],
    });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }
    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    let milestones: any = [];
    let milestoneStatuses: any = [];

    interface Any {
      [key: string]: any;
    }

    for (const milestoneEntry of timesheet.milestoneEntries) {
      let status: TimesheetStatus = TimesheetStatus.SAVED;

      let attachments = await this.manager.find(Attachment, {
        where: { targetType: 'PEN', targetId: milestoneEntry.id },
        relations: ['file'],
      });

      let attachment: Attachment | null =
        attachments.length > 0 ? attachments[0] : null;
      if (attachment) {
        (attachment as any).uid = attachment.file.uniqueName;
        (attachment as any).name = attachment.file.originalName;
        (attachment as any).type = attachment.file.type;
      }

      let authHaveThisMilestone = false;
      if (
        milestoneEntry.milestone.project.accountDirectorId == authId ||
        milestoneEntry.milestone.project.accountManagerId == authId ||
        milestoneEntry.milestone.project.projectManagerId == authId
      ) {
        authHaveThisMilestone = true;
      }

      milestoneEntry.milestone.project.accountDirectorId;

      let milestone: Any = {
        milestoneEntryId: milestoneEntry.id,
        milestoneId: milestoneEntry.milestoneId,
        milestone: milestoneEntry.milestone.title,
        projectId: milestoneEntry.milestone.projectId,
        projectType: milestoneEntry.milestone.project.type,
        project: milestoneEntry.milestone.project.title,
        phase: milestoneEntry.milestone.project.phase,
        isManaged: authHaveThisMilestone,
        notes: milestoneEntry.notes,
        attachment: attachment,
        totalHours: 0,
        actionNotes: milestoneEntry.actionNotes,
      };

      milestoneEntry.entries.map((entry: TimesheetEntry) => {
        milestone.totalHours += entry.hours;
        milestone[moment(entry.date, 'DD-MM-YYYY').format('D/M')] = {
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

      milestone.status = status;
      milestoneStatuses.push(status);

      milestones.push(milestone);
    }

    let leaveRequests = await this.manager.find(LeaveRequest, {
      where: [
        {
          employeeId: userId,
          submittedAt: Not(IsNull()),
          rejectedAt: IsNull(),
        },
        { employeeId: userId, approvedAt: Not(IsNull()), rejectedAt: IsNull() },
      ],
      relations: ['entries', 'work', 'type'],
    });

    let _projectAndTypeIndexer: any = {};
    leaveRequests.forEach((leaveRequest) => {
      let leaveRequestDetails = leaveRequest.getEntriesDetails;
      if (
        moment(leaveRequestDetails.startDate).isBetween(
          mStartDate,
          mEndDate,
          'date',
          '[]'
        ) ||
        moment(leaveRequestDetails.endDate).isBetween(
          mStartDate,
          mEndDate,
          'date',
          '[]'
        )
      ) {
        let _checker =
          _projectAndTypeIndexer[
            `${leaveRequest.workId ?? 0}_${leaveRequest.typeId ?? 0}`
          ];

        if (_checker !== undefined) {
          let resLeaveRequest = milestones[_checker];

          leaveRequest.entries.forEach((entry) => {
            if (
              entry.hours > 0 &&
              moment(entry.date, 'YYYY-MM-DD').isBetween(
                mStartDate,
                mEndDate,
                'date',
                '[]'
              )
            ) {
              resLeaveRequest[moment(entry.date, 'YYYY-MM-DD').format('D/M')] =
                {
                  date: moment(entry.date, 'YYYY-MM-DD').format('D-M-Y'),
                  hours: entry.hours,
                  status: leaveRequest.getStatus,
                  statusMsg: leaveRequest.note,
                  notes: leaveRequest.desc,
                };
            }
          });
        } else {
          _projectAndTypeIndexer[
            `${leaveRequest.workId ?? '0'}_${leaveRequest.typeId ?? '0'}`
          ] = milestones.length;

          let resLeaveRequest: any = {
            leaveRequest: true,
            project: leaveRequest.work?.title ?? '-',
            workId: leaveRequest.workId,
            leaveType: leaveRequest.type?.label ?? 'Unpaid',
            typeId: leaveRequest.typeId,
            totalHours: 0.0,
          };

          leaveRequest.entries.forEach((entry) => {
            console.log(mStartDate, mEndDate, entry.date);
            if (
              entry.hours > 0 &&
              moment(entry.date, 'YYYY-MM-DD').isBetween(
                mStartDate,
                mEndDate,
                'date',
                '[]'
              )
            ) {
              resLeaveRequest[moment(entry.date, 'YYYY-MM-DD').format('D/M')] =
                {
                  date: moment(entry.date, 'YYYY-MM-DD').format('D-M-Y'),
                  hours: entry.hours,
                  status: leaveRequest.getStatus,
                  statusMsg: leaveRequest.note,
                  notes: leaveRequest.desc,
                };
              // TOTAL HOURS
              resLeaveRequest.totalHours += entry.hours;
            }
          });

          milestones.push(resLeaveRequest);
        }
      }
    });

    console.log(milestoneStatuses);
    let timesheetStatus: TimesheetStatus = milestoneStatuses.includes(
      TimesheetStatus.REJECTED
    )
      ? TimesheetStatus.REJECTED
      : milestoneStatuses.includes(TimesheetStatus.SAVED)
      ? TimesheetStatus.SAVED
      : milestoneStatuses.includes(TimesheetStatus.SUBMITTED)
      ? TimesheetStatus.SUBMITTED
      : milestoneStatuses.includes(TimesheetStatus.APPROVED)
      ? TimesheetStatus.APPROVED
      : TimesheetStatus.SAVED;

    let response = {
      id: timesheet.id,
      status: timesheetStatus,
      notes: timesheet.notes,
      milestones: milestones,
      // leaveRequests: resLeaveRequests,
    };

    return response;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }

  async getManageTimesheet(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    authId: number
  ): Promise<any | undefined> {
    let mStartDate = moment(startDate, 'DD-MM-YYYY');
    let mEndDate = moment(endDate, 'DD-MM-YYYY').endOf('day');

    let cStartDate = mStartDate.format('YYYY-MM-DD HH:mm:ss.SSS');
    let cEndDate = mEndDate.format('YYYY-MM-DD HH:mm:ss.SSS');

    let timesheet = await this.findOne({
      where: { startDate: cStartDate, endDate: cEndDate, employeeId: userId },
      relations: [
        'milestoneEntries',
        'milestoneEntries.milestone',
        'milestoneEntries.milestone.project',
        'milestoneEntries.entries',
      ],
    });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    let milestones: any = [];
    let milestoneStatuses: any = [];

    interface Any {
      [key: string]: any;
    }

    for (const milestoneEntry of timesheet.milestoneEntries) {
      let status: TimesheetStatus = TimesheetStatus.SAVED;

      let attachments = await this.manager.find(Attachment, {
        where: { targetType: 'PEN', targetId: milestoneEntry.id },
        relations: ['file'],
      });

      let attachment: Attachment | null =
        attachments.length > 0 ? attachments[0] : null;
      if (attachment) {
        (attachment as any).uid = attachment.file.uniqueName;
        (attachment as any).name = attachment.file.originalName;
        (attachment as any).type = attachment.file.type;
      }

      let authHaveThisMilestone = false;
      if (
        milestoneEntry.milestone.project.accountDirectorId == authId ||
        milestoneEntry.milestone.project.accountManagerId == authId ||
        milestoneEntry.milestone.project.projectManagerId == authId
      ) {
        authHaveThisMilestone = true;
      }

      let milestone: Any = {
        milestoneEntryId: milestoneEntry.id,
        milestoneId: milestoneEntry.milestoneId,
        milestone: milestoneEntry.milestone.title,
        projectId: milestoneEntry.milestone.projectId,
        projectType: milestoneEntry.milestone.project.type,
        project: milestoneEntry.milestone.project.title,
        phase: milestoneEntry.milestone.project.phase,
        isManaged: authHaveThisMilestone,
        notes: milestoneEntry.notes,
        attachment: attachment,
        totalHours: 0,
        actionNotes: milestoneEntry.actionNotes,
      };

      if (authHaveThisMilestone) {
        milestoneEntry.entries.map((entry: TimesheetEntry) => {
          milestone.totalHours += entry.hours;
          milestone[moment(entry.date, 'DD-MM-YYYY').format('D/M')] = {
            entryId: entry.id,
            startTime: moment(entry.startTime, 'HH:mm').format('HH:mm'),
            endTime: moment(entry.endTime, 'HH:mm').format('HH:mm'),
            breakHours: entry.breakHours,
            actualHours: entry.hours,
            notes: entry.notes,
          };

          if (entry.rejectedAt !== null) status = TimesheetStatus.REJECTED;
          else if (entry.approvedAt !== null) status = TimesheetStatus.APPROVED;
          else if (entry.submittedAt !== null)
            status = TimesheetStatus.SUBMITTED;
        });

        milestone.status = status;
        milestoneStatuses.push(status);

        milestones.push(milestone);
      }
    }

    let leaveRequest = await this.manager.find(LeaveRequest, {
      where: [
        {
          employeeId: userId,
          submittedAt: Not(IsNull()),
          rejectedAt: IsNull(),
        },
        { employeeId: userId, approvedAt: Not(IsNull()), rejectedAt: IsNull() },
      ],
      relations: ['entries', 'work', 'type'],
    });

    let _projectAndTypeIndexer: any = {};
    leaveRequest.forEach((leaveRequest) => {
      let leaveRequestDetails = leaveRequest.getEntriesDetails;
      if (
        moment(leaveRequestDetails.startDate).isBetween(
          cStartDate,
          cEndDate,
          'date',
          '[]'
        ) &&
        moment(leaveRequestDetails.endDate).isBetween(
          cStartDate,
          cEndDate,
          'date',
          '[]'
        )
      ) {
        let _checker =
          _projectAndTypeIndexer[
            `${leaveRequest.workId ?? 0}_${leaveRequest.typeId ?? 0}`
          ];

        if (_checker !== undefined) {
          let resLeaveRequest = milestones[_checker];

          leaveRequest.entries.forEach((entry) => {
            resLeaveRequest[moment(entry.date, 'YYYY-MM-DD').format('D/M')] = {
              date: moment(entry.date, 'YYYY-MM-DD').format('D-M-Y'),
              hours: entry.hours,
              status: leaveRequest.getStatus,
              statusMsg: leaveRequest.note,
              notes: leaveRequest.desc,
            };
          });
        } else {
          _projectAndTypeIndexer[
            `${leaveRequest.workId ?? '0'}_${leaveRequest.typeId ?? '0'}`
          ] = milestones.length;

          let resLeaveRequest: any = {
            leaveRequest: true,
            project: leaveRequest.work?.title ?? '-',
            workId: leaveRequest.workId,
            leaveType: leaveRequest.type?.label ?? 'Unpaid',
            typeId: leaveRequest.typeId,
            totalHours: 0.0,
          };

          leaveRequest.entries.forEach((entry) => {
            if (
              entry.hours > 0 &&
              moment(entry.date, 'YYYY-MM-DD').isSameOrAfter(mStartDate) &&
              moment(entry.date, 'YYYY-MM-DD').isSameOrBefore(mEndDate)
            ) {
              resLeaveRequest[moment(entry.date, 'YYYY-MM-DD').format('D/M')] =
                {
                  date: moment(entry.date, 'YYYY-MM-DD').format('D-M-Y'),
                  hours: entry.hours,
                  status: leaveRequest.getStatus,
                  statusMsg: leaveRequest.note,
                  notes: leaveRequest.desc,
                };
            }
          });

          milestones.push(resLeaveRequest);
        }
      }
    });

    console.log(milestoneStatuses);
    let timesheetStatus: TimesheetStatus = milestoneStatuses.includes(
      TimesheetStatus.REJECTED
    )
      ? TimesheetStatus.REJECTED
      : milestoneStatuses.includes(TimesheetStatus.SAVED)
      ? TimesheetStatus.SAVED
      : milestoneStatuses.includes(TimesheetStatus.SUBMITTED)
      ? TimesheetStatus.SUBMITTED
      : milestoneStatuses.includes(TimesheetStatus.APPROVED)
      ? TimesheetStatus.APPROVED
      : TimesheetStatus.SAVED;

    let response = {
      id: timesheet.id,
      status: timesheetStatus,
      notes: timesheet.notes,
      milestones: milestones,
    };

    return response;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }

  async getOwnTimesheet(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    authId: number
  ): Promise<any | undefined> {
    let mStartDate = moment(startDate, 'DD-MM-YYYY');
    let mEndDate = moment(endDate, 'DD-MM-YYYY').endOf('day');

    let cStartDate = mStartDate.format('YYYY-MM-DD HH:mm:ss.SSS');
    let cEndDate = mEndDate.format('YYYY-MM-DD HH:mm:ss.SSS');

    let timesheet = await this.findOne({
      where: { startDate: cStartDate, endDate: cEndDate, employeeId: userId },
      relations: [
        'milestoneEntries',
        'milestoneEntries.milestone',
        'milestoneEntries.milestone.project',
        'milestoneEntries.entries',
      ],
    });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    let milestones: any = [];
    let milestoneStatuses: any = [];

    interface Any {
      [key: string]: any;
    }

    if (timesheet.employeeId == authId) {
      for (const milestoneEntry of timesheet.milestoneEntries) {
        let status: TimesheetStatus = TimesheetStatus.SAVED;

        let attachments = await this.manager.find(Attachment, {
          where: { targetType: 'PEN', targetId: milestoneEntry.id },
          relations: ['file'],
        });

        let attachment: Attachment | null =
          attachments.length > 0 ? attachments[0] : null;
        if (attachment) {
          (attachment as any).uid = attachment.file.uniqueName;
          (attachment as any).name = attachment.file.originalName;
          (attachment as any).type = attachment.file.type;
        }

        let authHaveThisMilestone = false;
        if (
          milestoneEntry.milestone.project.accountDirectorId == authId ||
          milestoneEntry.milestone.project.accountManagerId == authId ||
          milestoneEntry.milestone.project.projectManagerId == authId
        ) {
          authHaveThisMilestone = true;
        }

        let milestone: Any = {
          milestoneEntryId: milestoneEntry.id,
          milestoneId: milestoneEntry.milestoneId,
          milestone: milestoneEntry.milestone.title,
          projectId: milestoneEntry.milestone.projectId,
          projectType: milestoneEntry.milestone.project.type,
          project: milestoneEntry.milestone.project.title,
          phase: milestoneEntry.milestone.project.phase,
          isManaged: authHaveThisMilestone,
          notes: milestoneEntry.notes,
          attachment: attachment,
          totalHours: 0,
          actionNotes: milestoneEntry.actionNotes,
        };

        milestoneEntry.entries.map((entry: TimesheetEntry) => {
          milestone.totalHours += entry.hours;
          milestone[moment(entry.date, 'DD-MM-YYYY').format('D/M')] = {
            entryId: entry.id,
            startTime: moment(entry.startTime, 'HH:mm').format('HH:mm'),
            endTime: moment(entry.endTime, 'HH:mm').format('HH:mm'),
            breakHours: entry.breakHours,
            actualHours: entry.hours,
            notes: entry.notes,
          };

          if (entry.rejectedAt !== null) status = TimesheetStatus.REJECTED;
          else if (entry.approvedAt !== null) status = TimesheetStatus.APPROVED;
          else if (entry.submittedAt !== null)
            status = TimesheetStatus.SUBMITTED;
        });

        milestone.status = status;
        milestoneStatuses.push(status);

        milestones.push(milestone);
      }
    }

    let leaveRequest = await this.manager.find(LeaveRequest, {
      where: [
        {
          employeeId: userId,
          submittedAt: Not(IsNull()),
          rejectedAt: IsNull(),
        },
        { employeeId: userId, approvedAt: Not(IsNull()), rejectedAt: IsNull() },
      ],
      relations: ['entries', 'work', 'type'],
    });

    let _projectAndTypeIndexer: any = {};
    leaveRequest.forEach((leaveRequest) => {
      let leaveRequestDetails = leaveRequest.getEntriesDetails;
      if (
        moment(leaveRequestDetails.startDate).isBetween(
          cStartDate,
          cEndDate,
          'date',
          '[]'
        ) &&
        moment(leaveRequestDetails.endDate).isBetween(
          cStartDate,
          cEndDate,
          'date',
          '[]'
        )
      ) {
        let _checker =
          _projectAndTypeIndexer[
            `${leaveRequest.workId ?? 0}_${leaveRequest.typeId ?? 0}`
          ];

        if (_checker !== undefined) {
          let resLeaveRequest = milestones[_checker];

          leaveRequest.entries.forEach((entry) => {
            resLeaveRequest[moment(entry.date, 'YYYY-MM-DD').format('D/M')] = {
              date: moment(entry.date, 'YYYY-MM-DD').format('D-M-Y'),
              hours: entry.hours,
              status: leaveRequest.getStatus,
              statusMsg: leaveRequest.note,
              notes: leaveRequest.desc,
            };
          });
        } else {
          _projectAndTypeIndexer[
            `${leaveRequest.workId ?? '0'}_${leaveRequest.typeId ?? '0'}`
          ] = milestones.length;

          let resLeaveRequest: any = {
            leaveRequest: true,
            project: leaveRequest.work?.title ?? '-',
            workId: leaveRequest.workId,
            leaveType: leaveRequest.type?.label ?? 'Unpaid',
            typeId: leaveRequest.typeId,
            totalHours: 0.0,
          };

          leaveRequest.entries.forEach((entry) => {
            if (
              entry.hours > 0 &&
              moment(entry.date, 'YYYY-MM-DD').isSameOrAfter(mStartDate) &&
              moment(entry.date, 'YYYY-MM-DD').isSameOrBefore(mEndDate)
            ) {
              resLeaveRequest[moment(entry.date, 'YYYY-MM-DD').format('D/M')] =
                {
                  date: moment(entry.date, 'YYYY-MM-DD').format('D-M-Y'),
                  hours: entry.hours,
                  status: leaveRequest.getStatus,
                  statusMsg: leaveRequest.note,
                  notes: leaveRequest.desc,
                };
            }
          });

          milestones.push(resLeaveRequest);
        }
      }
    });

    console.log(milestoneStatuses);
    let timesheetStatus: TimesheetStatus = milestoneStatuses.includes(
      TimesheetStatus.REJECTED
    )
      ? TimesheetStatus.REJECTED
      : milestoneStatuses.includes(TimesheetStatus.SAVED)
      ? TimesheetStatus.SAVED
      : milestoneStatuses.includes(TimesheetStatus.SUBMITTED)
      ? TimesheetStatus.SUBMITTED
      : milestoneStatuses.includes(TimesheetStatus.APPROVED)
      ? TimesheetStatus.APPROVED
      : TimesheetStatus.SAVED;

    let response = {
      id: timesheet.id,
      status: timesheetStatus,
      notes: timesheet.notes,
      milestones: milestones,
    };

    return response;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }

  async addTimesheetEntry(
    startDate: string,
    endDate: string,
    userId: number,
    timesheetDTO: TimesheetDTO
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSSS');

    let entry = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet: Timesheet | undefined;
        let milestoneEntry: TimesheetMilestoneEntry | undefined;

        timesheet = await this.manager.findOne(Timesheet, {
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
        });

        if (!timesheet) {
          timesheet = new Timesheet();

          timesheet.startDate = moment(
            `${startDate} 00:00:00`,
            'DD-MM-YYYY HH:mm:ss.SSS'
          )
            .startOf('day')
            .toDate();
          timesheet.endDate = moment(
            `${endDate} 00:00:00`,
            'DD-MM-YYYY HH:mm:ss.SSS'
          )
            .endOf('day')
            .toDate();
          timesheet.employeeId = userId;

          timesheet = await transactionalEntityManager.save(timesheet);
        }

        let employee = await transactionalEntityManager.findOne(
          Employee,
          userId,
          {
            relations: ['contactPersonOrganization'],
          }
        );

        if (!employee) {
          throw new Error('Employee not found');
        }

        milestoneEntry = await this.manager.findOne(TimesheetMilestoneEntry, {
          where: {
            milestoneId: timesheetDTO.milestoneId,
            timesheetId: timesheet.id,
          },
        });

        if (!milestoneEntry) {
          console.log(' I RANN');
          milestoneEntry = new TimesheetMilestoneEntry();

          milestoneEntry.timesheetId = timesheet.id;
          milestoneEntry.milestoneId = timesheetDTO.milestoneId;

          milestoneEntry = await transactionalEntityManager.save(
            milestoneEntry
          );
        }

        let milestone = await transactionalEntityManager.findOne(
          Milestone,
          milestoneEntry.milestoneId
        );

        if (!milestone) {
          throw new Error('Milestone not found');
        }

        let actualHours = 0;

        if (
          moment(timesheetDTO.endTime, 'HH:mm').diff(
            moment(timesheetDTO.startTime, 'HH:mm'),
            'minutes'
          ) /
            60 <
          0
        ) {
          actualHours =
            Math.abs(
              moment(timesheetDTO.endTime, 'HH:mm')
                .add(1, 'days')
                .diff(moment(timesheetDTO.startTime, 'HH:mm'), 'minutes') / 60
            ) - timesheetDTO.breakHours;
        } else {
          actualHours =
            Math.abs(
              moment(timesheetDTO.endTime, 'HH:mm').diff(
                moment(timesheetDTO.startTime, 'HH:mm'),
                'minutes'
              ) / 60
            ) - timesheetDTO.breakHours;
        }

        this._validateEntryDates(
          moment(timesheetDTO.date, 'DD-MM-YYYY').toDate(),
          timesheet
        );

        let resources = await this.manager.find(OpportunityResource, {
          where: [
            {
              startDate: LessThanOrEqual(
                moment(timesheetDTO.date, 'DD-MM-YYYY').toDate()
              ),
              endDate: MoreThanOrEqual(
                moment(timesheetDTO.date, 'DD-MM-YYYY').toDate()
              ),
              milestoneId: milestone.id,
            },
          ],
          relations: ['opportunityResourceAllocations'],
        });

        if (!resources.length) {
          throw new Error('Cannot log timesheet outside of allocation date.');
        }

        let _flagAllocationFound = false;
        for (let resource of resources) {
          for (let allocation of resource.opportunityResourceAllocations) {
            if (
              allocation.contactPersonId ==
                employee.contactPersonOrganization.contactPersonId &&
              allocation.isMarkedAsSelected
            ) {
              _flagAllocationFound = true;
              await this._validateHours(resource, actualHours, employee.id);
            }
            if (_flagAllocationFound) {
              break;
            }
          }
        }

        if (!_flagAllocationFound)
          throw new Error('Cannot log timesheet outside of allocation date.');

        let previousEntry = await this.manager.findOne(TimesheetEntry, {
          where: {
            date: moment(timesheetDTO.date, 'DD-MM-YYYY').format('DD-MM-YYYY'),
            milestoneEntryId: milestoneEntry.id,
          },
        });

        let entry: TimesheetEntry;

        if (previousEntry) {
          entry = previousEntry;
        } else {
          entry = new TimesheetEntry();
        }

        //--COMMENTED TIMEZONE LOGIC
        {
          // console.log(timesheetDTO.date, timesheetDTO.startTime);
          // entry.startTime = createDate(timesheetDTO.startTime).toDate();
          // if (
          //   moment(timesheetDTO.startTime, 'HH:mm') >
          //   moment(timesheetDTO.endTime, 'HH:mm')
          // ) {
          //   console.log('start is greater');
          //   entry.endTime = createDate(timesheetDTO.endTime)
          //     .add(1, 'days')
          //     .toDate();
          // } else {
          //   entry.endTime = createDate(timesheetDTO.endTime).toDate();
          // }
        }

        entry.date = moment(timesheetDTO.date, 'DD-MM-YYYY').format(
          'DD-MM-YYYY'
        );
        entry.startTime = moment(timesheetDTO.startTime, 'HH:mm').format(
          'HH:mm'
        );
        entry.endTime = moment(timesheetDTO.endTime, 'HH:mm').format('HH:mm');
        entry.breakHours = timesheetDTO.breakHours;
        entry.hours = actualHours;

        entry.milestoneEntryId = milestoneEntry.id;
        entry.notes = timesheetDTO.notes;

        entry = await transactionalEntityManager.save(entry);

        return entry;
      }
    );

    // console.log(timesheetDTO);

    return entry;
  }

  async addBulkTimesheetEntry(
    startDate: string,
    endDate: string,
    userId: number,
    bulkTimesheetDTO: BulkTimesheetDTO
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    let entries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let returnEntries: TimesheetEntry[] = [];

        let timesheet: Timesheet | undefined;
        let milestoneEntry: TimesheetMilestoneEntry | undefined;

        timesheet = await this.manager.findOne(Timesheet, {
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
        });

        if (!timesheet) {
          timesheet = new Timesheet();

          timesheet.startDate = moment(
            `${startDate} 00:00:00`,
            'DD-MM-YYYY HH:mm:ss.SSS'
          )
            .startOf('day')
            .toDate();
          timesheet.endDate = moment(
            `${endDate} 00:00:00`,
            'DD-MM-YYYY HH:mm:ss.SSS'
          )
            .endOf('day')
            .toDate();
          timesheet.employeeId = userId;

          timesheet = await transactionalEntityManager.save(timesheet);
        }

        let employee = await transactionalEntityManager.findOne(
          Employee,
          userId,
          {
            relations: ['contactPersonOrganization'],
          }
        );

        if (!employee) {
          throw new Error('Employee not found');
        }

        let milestone = await transactionalEntityManager.findOne(
          Milestone,
          bulkTimesheetDTO.milestoneId,
          {}
        );

        if (!milestone) {
          throw new Error('Milestone not found');
        }

        milestoneEntry = await this.manager.findOne(TimesheetMilestoneEntry, {
          where: {
            milestoneId: milestone.id,
            timesheetId: timesheet.id,
          },
          relations: ['entries'],
        });

        if (!milestoneEntry) {
          milestoneEntry = new TimesheetMilestoneEntry();

          milestoneEntry.timesheetId = timesheet.id;
          milestoneEntry.milestoneId = bulkTimesheetDTO.milestoneId;

          milestoneEntry = await transactionalEntityManager.save(
            milestoneEntry
          );
        }

        if (milestoneEntry.entries) {
          if (
            milestoneEntry.entries[0].submittedAt ||
            milestoneEntry.entries[0].approvedAt
          ) {
            throw new Error('Timesheet Submitted or Approved');
          }
        }

        const bulkStartDate = moment(
          bulkTimesheetDTO.startDate,
          'YYYY-MM-DD',
          true
        );
        const bulkEndDate = moment(
          bulkTimesheetDTO.endDate,
          'YYYY-MM-DD',
          true
        );

        let resources = await this.manager.find(OpportunityResource, {
          where: [
            {
              startDate: LessThanOrEqual(bulkStartDate.toDate()),
              endDate: MoreThanOrEqual(bulkEndDate.toDate()),
              milestoneId: milestone.id,
            },
            {
              startDate: LessThanOrEqual(bulkStartDate.toDate()),
              endDate: IsNull(),
              milestoneId: milestone.id,
            },
          ],
          order: { startDate: 'ASC' },
          relations: ['opportunityResourceAllocations'],
        });

        this._validateBulkEntryDates(bulkStartDate, bulkEndDate, timesheet);

        // await this._validateBulkHours(
        //   bulkStartDate,
        //   bulkEndDate,
        //   resource,
        //   bulkTimesheetDTO,
        //   employee.id
        // );

        let timesheets = await this.manager.find(Timesheet, {
          where: { employeeId: employee.id },
          relations: ['milestoneEntries', 'milestoneEntries.entries'],
        });

        let resourceHours: any = {};

        for (let resource of resources) {
          for (let timesheet of timesheets) {
            if (
              !moment(timesheet.startDate).isBetween(
                resource.startDate,
                resource.endDate,
                'date',
                '[]'
              ) &&
              !moment(timesheet.endDate).isBetween(
                resource.startDate,
                resource.endDate,
                'date',
                '[]'
              )
            )
              continue;
            resourceHours[resource.id] = 0;
            for (let milestoneEntry of timesheet.milestoneEntries) {
              if (milestoneEntry.milestoneId != resource.milestoneId) continue;
              for (let entry of milestoneEntry.entries) {
                if (
                  moment(entry.date, 'DD-MM-YYYY', true).isBetween(
                    bulkStartDate,
                    bulkEndDate,
                    'date',
                    '[]'
                  ) ||
                  !moment(entry.date, 'DD-MM-YYYY', true).isBetween(
                    resource.startDate,
                    resource.endDate,
                    'date',
                    '[]'
                  )
                )
                  continue;
                resourceHours[resource.id] += entry.hours;
              }
            }
          }
        }

        let foundEntries: any[] = [];

        for (let resource of resources) {
          for (let allocation of resource.opportunityResourceAllocations) {
            if (
              allocation.contactPersonId ==
                employee.contactPersonOrganization.contactPersonId &&
              allocation.isMarkedAsSelected
            ) {
              for (let dtoEntry of bulkTimesheetDTO.entries) {
                const entryMomentDate = moment(
                  dtoEntry.date,
                  'DD-MM-YYYY',
                  true
                );

                if (
                  entryMomentDate.isBetween(
                    resource.startDate,
                    resource.endDate,
                    'date',
                    '[]'
                  )
                ) {
                  const entryMomentStartTime = moment(
                    dtoEntry.startTime,
                    'HH:mm',
                    true
                  );
                  const entryMomentEndTime = moment(
                    dtoEntry.endTime,
                    'HH:mm',
                    true
                  );
                  let actualHours = 0;
                  if (
                    entryMomentEndTime.diff(entryMomentStartTime, 'minutes') /
                      60 <
                    0
                  ) {
                    actualHours =
                      Math.abs(
                        entryMomentEndTime
                          .add(1, 'days')
                          .diff(entryMomentStartTime, 'minutes') / 60
                      ) - dtoEntry.breakHours;
                  } else {
                    actualHours =
                      Math.abs(
                        entryMomentEndTime.diff(
                          entryMomentStartTime,
                          'minutes'
                        ) / 60
                      ) - dtoEntry.breakHours;
                  }
                  foundEntries.push(entryMomentDate);
                  resourceHours[resource.id] += actualHours;
                }
              }
            }
          }
        }

        if (foundEntries.length !== bulkTimesheetDTO.entries.length) {
          throw new Error('Cannot log timesheet outside of allocation date.');
        }

        for (let resource of resources) {
          for (let allocation of resource.opportunityResourceAllocations) {
            if (
              allocation.contactPersonId ==
                employee.contactPersonOrganization.contactPersonId &&
              allocation.isMarkedAsSelected
            ) {
              if (resource.billableHours < resourceHours[resource.id]) {
                console.log(
                  '🚀 ~ file: timesheetRepository.ts:1145 ~ TimesheetRepository ~ resourceHours[resource.id]:',
                  resourceHours[resource.id]
                );
                console.log(
                  '🚀 ~ file: timesheetRepository.ts:1145 ~ TimesheetRepository ~ resource.billableHours:',
                  resource.billableHours
                );
                throw new Error(
                  'logged hours cannot be more than billable hours'
                );
              }
            }
          }
        }

        for (let loopedEntry of bulkTimesheetDTO.entries) {
          const entryMomentDate = moment(loopedEntry.date, 'DD-MM-YYYY', true);
          const entryMomentStartTime = moment(
            loopedEntry.startTime,
            'HH:mm',
            true
          );
          const entryMomentEndTime = moment(loopedEntry.endTime, 'HH:mm', true);
          let actualHours = 0;
          if (
            entryMomentEndTime.diff(entryMomentStartTime, 'minutes') / 60 <
            0
          ) {
            actualHours =
              Math.abs(
                entryMomentEndTime
                  .add(1, 'days')
                  .diff(entryMomentStartTime, 'minutes') / 60
              ) - loopedEntry.breakHours;
          } else {
            actualHours =
              Math.abs(
                entryMomentEndTime.diff(entryMomentStartTime, 'minutes') / 60
              ) - loopedEntry.breakHours;
          }

          let entry = new TimesheetEntry();

          if (
            !entryMomentDate.isBetween(bulkStartDate, bulkEndDate, 'date', '[]')
          ) {
            throw new Error('Entry dates are out of range');
          }

          entry.date = entryMomentDate.format('DD-MM-YYYY');
          entry.milestoneEntryId = milestoneEntry.id;

          entry.startTime = entryMomentStartTime.format('HH:mm');
          entry.endTime = moment(loopedEntry.endTime, 'HH:mm').format('HH:mm');
          entry.breakHours = loopedEntry.breakHours;
          entry.hours = actualHours;

          returnEntries.push(entry);
        }

        await transactionalEntityManager
          .getRepository(TimesheetEntry)
          .createQueryBuilder('entry')
          .delete()
          .where("STR_TO_DATE(date, '%d-%m-%Y') >= :startDate", {
            startDate: bulkStartDate.format('YYYY-MM-DD'),
          })
          .andWhere("STR_TO_DATE(date, '%d-%m-%Y') <= :endDate", {
            endDate: bulkEndDate.format('YYYY-MM-DD'),
          })
          .andWhere('milestone_entry_id = :milestoneEntryId', {
            milestoneEntryId: milestoneEntry.id,
          })
          .execute();

        await transactionalEntityManager.save(returnEntries);

        return returnEntries;
      }
    );

    // console.log(bulkTimesheetDTO);

    return entries;
  }

  async editTimesheetEntry(
    entryId: number,
    timesheetDTO: TimesheetDTO
  ): Promise<any | undefined> {
    // console.log(timesheetDTO);
    let entry = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let entry: TimesheetEntry | undefined;
        entry = await transactionalEntityManager.findOne(
          TimesheetEntry,
          entryId,
          { relations: ['milestoneEntry', 'milestoneEntry.timesheet'] }
        );
        if (!entry) {
          throw new Error('Entry not found');
        }

        let employee = await transactionalEntityManager.findOne(
          Employee,
          entry.milestoneEntry.timesheet.employeeId,
          {
            relations: ['contactPersonOrganization'],
          }
        );

        if (!employee) {
          throw new Error('Employee not found');
        }

        let milestone = await transactionalEntityManager.findOne(
          Milestone,
          entry.milestoneEntry.milestoneId,
          {
            relations: [
              'opportunityResources',
              'opportunityResources.opportunityResourceAllocations',
            ],
          }
        );

        if (!milestone) {
          throw new Error('Milestone not found');
        }

        let actualHours = 0;

        if (
          moment(timesheetDTO.endTime, 'HH:mm').diff(
            moment(timesheetDTO.startTime, 'HH:mm'),
            'minutes'
          ) /
            60 <
          0
        ) {
          actualHours =
            Math.abs(
              moment(timesheetDTO.endTime, 'HH:mm')
                .add(1, 'days')
                .diff(moment(timesheetDTO.startTime, 'HH:mm'), 'minutes') / 60
            ) - timesheetDTO.breakHours;
        } else {
          actualHours =
            Math.abs(
              moment(timesheetDTO.endTime, 'HH:mm').diff(
                moment(timesheetDTO.startTime, 'HH:mm'),
                'minutes'
              ) / 60
            ) - timesheetDTO.breakHours;
        }

        for (let resource of milestone.opportunityResources) {
          if (resource.milestoneId == milestone.id) {
            for (let allocation of resource.opportunityResourceAllocations) {
              if (
                allocation.contactPersonId ==
                employee.contactPersonOrganization.contactPersonId
              ) {
                this._validateEntryDates(
                  moment(timesheetDTO.date, 'DD-MM-YYYY').toDate(),
                  entry.milestoneEntry.timesheet
                );

                await this._validateHours(
                  resource,
                  actualHours,
                  employee.id,
                  entry.id
                );
              }
            }
          }
        }

        entry.date = moment(timesheetDTO.date, 'DD-MM-YYYY').format(
          'DD-MM-YYYY'
        );
        entry.startTime = moment(timesheetDTO.startTime, 'HH:mm').format(
          'HH:mm'
        );
        entry.endTime = moment(timesheetDTO.endTime, 'HH:mm').format('HH:mm');
        entry.breakHours = timesheetDTO.breakHours;
        entry.hours = actualHours;

        entry.milestoneEntryId = timesheetDTO.milestoneEntryId;
        entry.notes = timesheetDTO.notes;

        entry = await transactionalEntityManager.save(entry);

        return entry;
      }
    );

    return entry;
  }

  async submitMilestoneTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    requestEntries: Array<number>
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    let milestoneEntries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
          relations: [
            'milestoneEntries',
            'milestoneEntries.milestone',
            'milestoneEntries.entries',
            'employee',
            'employee.contactPersonOrganization',
            'employee.contactPersonOrganization.contactPerson',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let responseEntries: TimesheetMilestoneEntry[] = [];

        for (const requestEntry of requestEntries) {
          let milestoneEntry = timesheet.milestoneEntries.filter(
            (entry) => entry.id === requestEntry
          )[0];

          if (!milestoneEntry) {
            throw new Error('Entry not found!');
          }

          milestoneEntry.entries.map((entry) => {
            entry.submittedAt = moment().toDate();
            entry.approvedAt = null;
            entry.rejectedAt = null;
          });

          responseEntries.push(milestoneEntry);
        }

        await transactionalEntityManager.save(timesheet);

        //NOTIFICATION LOOP
        for (const requestEntry of requestEntries) {
          let milestoneEntry = timesheet.milestoneEntries.filter(
            (entry) => entry.id === requestEntry
          )[0];

          if (milestoneEntry) {
            await NotificationManager.info(
              [timesheet.employee.lineManagerId],
              `Timesheet Submitted`,
              `Timesheet of date ${moment(timesheet.startDate).format(
                'DD-MM-YYYY'
              )} - ${moment(timesheet.endDate).format(
                'DD-MM-YYYY'
              )} is submitted by ${timesheet.employee.getFullName}`,
              `/time-sheet-approval?startDate=${moment(
                timesheet.startDate
              ).format('DD-MM-YYYY')}&endDate=${moment(
                timesheet.endDate
              ).format('DD-MM-YYYY')}&userId=${
                timesheet.employeeId
              }&timesheetId=${timesheet.id}&milestoneId=${
                milestoneEntry.milestoneId
              }`,
              NotificationEventType.TIME_SHEET_SUBMIT,
              [timesheet.employeeId]
            );
          }
        }

        return responseEntries;
      }
    );

    return milestoneEntries;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async approveAnyMilestoneTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    approveEntryDTO: TimesheetEntryApproveRejectDTO
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    let milestoneEntries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheets = await this.find({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
          },
          relations: [
            'milestoneEntries',
            'milestoneEntries.milestone',
            'milestoneEntries.entries',
            'employee',
            'employee.contactPersonOrganization',
            'employee.contactPersonOrganization.contactPerson',
          ],
        });

        if (!timesheets) {
          throw new Error('Timesheet not found!');
        }

        let _flagNotFound = true;

        let responseEntries: TimesheetMilestoneEntry[] = [];

        for (const requestEntry of approveEntryDTO.milestoneEntries) {
          timesheets.forEach((timesheet) => {
            let milestoneEntry = timesheet.milestoneEntries.filter(
              (entry) => entry.id === requestEntry
            )[0];

            if (milestoneEntry) {
              _flagNotFound = false;
              milestoneEntry.entries.map((entry) => {
                entry.approvedAt = moment().toDate();
              });
              milestoneEntry.actionNotes = approveEntryDTO.note;
              responseEntries.push(milestoneEntry);
            }
          });
        }

        if (_flagNotFound == true) {
          throw new Error('Entry not found!');
        }

        await transactionalEntityManager.save(timesheets);

        //NOTIFICATION LOOP
        for (const requestEntry of approveEntryDTO.milestoneEntries) {
          for (let timesheet of timesheets) {
            let milestoneEntry = timesheet.milestoneEntries.filter(
              (entry) => entry.id === requestEntry
            )[0];

            if (milestoneEntry) {
              await NotificationManager.success(
                [timesheet.employeeId],
                `Timesheet Approved`,
                `Timesheet of date ${moment(timesheet.startDate).format(
                  'DD-MM-YYYY'
                )} - ${moment(timesheet.endDate).format(
                  'DD-MM-YYYY'
                )} is approved`,
                `/time-sheet?startDate=${moment(timesheet.startDate).format(
                  'DD-MM-YYYY'
                )}&endDate=${moment(timesheet.endDate).format(
                  'DD-MM-YYYY'
                )}&userId=${timesheet.employeeId}&timesheetId=${timesheet.id}`,
                NotificationEventType.TIME_SHEET_APPROVE
              );
            }
          }
        }

        return responseEntries;
      }
    );

    return milestoneEntries;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async approveManageMilestoneTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    approveEntryDTO: TimesheetEntryApproveRejectDTO,
    authId: number
  ): Promise<any | undefined> {
    let flagUserIsAllowed = 0;
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    let milestoneEntries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
          },
          relations: [
            'milestoneEntries',
            'milestoneEntries.milestone',
            'milestoneEntries.entries',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let responseEntries: TimesheetMilestoneEntry[] = [];

        for (const requestEntry of approveEntryDTO.milestoneEntries) {
          let milestoneEntry = timesheet.milestoneEntries.filter(
            (entry) => entry.id === requestEntry
          )[0];

          if (!milestoneEntry) {
            throw new Error('Entry not found!');
          }
          let users: [] = await this.getUserManageUsers(authId);

          if (!users.length) {
            throw new Error('No users to manage');
          }
          users.forEach((user: any) => {
            if (user.value == userId) {
              flagUserIsAllowed = 1;
            }
          });

          if (flagUserIsAllowed == 0) {
            throw new Error('User is not allowed to change');
          }

          milestoneEntry.entries.map((entry) => {
            entry.approvedAt = moment().toDate();
          });
          milestoneEntry.actionNotes = approveEntryDTO.note;
          responseEntries.push(milestoneEntry);
        }

        await transactionalEntityManager.save(timesheet);

        //NOTIFICATION LOOP
        for (const requestEntry of approveEntryDTO.milestoneEntries) {
          let milestoneEntry = timesheet.milestoneEntries.filter(
            (entry) => entry.id === requestEntry
          )[0];

          if (milestoneEntry) {
            await NotificationManager.success(
              [timesheet.employeeId],
              `Timesheet Approved`,
              `Timesheet of date ${moment(timesheet.startDate).format(
                'DD-MM-YYYY'
              )} - ${moment(timesheet.endDate).format(
                'DD-MM-YYYY'
              )} is approved`,
              `/time-sheet?startDate=${moment(timesheet.startDate).format(
                'DD-MM-YYYY'
              )}&endDate=${moment(timesheet.endDate).format(
                'DD-MM-YYYY'
              )}&userId=${timesheet.employeeId}&timesheetId=${timesheet.id}`,
              NotificationEventType.TIME_SHEET_APPROVE
            );
          }
        }

        return responseEntries;
      }
    );

    return milestoneEntries;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async rejectAnyMilestoneTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    rejectEntryDTO: TimesheetEntryApproveRejectDTO
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    let milestoneEntries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheets = await this.find({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
          },
          relations: [
            'milestoneEntries',
            'milestoneEntries.milestone',
            'milestoneEntries.entries',
          ],
        });

        if (!timesheets) {
          throw new Error('Timesheet not found!');
        }

        let _flagNotFound = true;

        let responseEntries: TimesheetMilestoneEntry[] = [];

        for (const requestEntry of rejectEntryDTO.milestoneEntries) {
          timesheets.forEach((timesheet) => {
            let milestoneEntry = timesheet.milestoneEntries.filter(
              (entry) => entry.id === requestEntry
            )[0];

            if (milestoneEntry) {
              _flagNotFound = false;
              milestoneEntry.entries.map((entry) => {
                entry.rejectedAt = moment().toDate();
              });
              milestoneEntry.actionNotes = rejectEntryDTO.note;
              responseEntries.push(milestoneEntry);
            }
          });
        }

        if (_flagNotFound == true) {
          throw new Error('Entry not found!');
        }

        await transactionalEntityManager.save(timesheets);

        //NOTIFICATION LOOP
        for (const requestEntry of rejectEntryDTO.milestoneEntries) {
          for (let timesheet of timesheets) {
            let milestoneEntry = timesheet.milestoneEntries.filter(
              (entry) => entry.id === requestEntry
            )[0];

            if (milestoneEntry) {
              await NotificationManager.danger(
                [timesheet.employeeId],
                `Timesheet Rejection`,
                `Timesheet of date ${moment(timesheet.startDate).format(
                  'DD-MM-YYYY'
                )} - ${moment(timesheet.endDate).format(
                  'DD-MM-YYYY'
                )} is rejected`,
                `/time-sheet?startDate=${moment(timesheet.startDate).format(
                  'DD-MM-YYYY'
                )}&endDate=${moment(timesheet.endDate).format(
                  'DD-MM-YYYY'
                )}&userId=${timesheet.employeeId}&timesheetId=${timesheet.id}`,
                NotificationEventType.TIME_SHEET_REJECT
              );
            }
          }
        }

        return responseEntries;
      }
    );

    return milestoneEntries;
  }

  async rejectManageMilestoneTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    rejectEntryDTO: TimesheetEntryApproveRejectDTO,
    authId: number
  ): Promise<any | undefined> {
    let flagUserIsAllowed = 0;
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    let milestoneEntries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
          relations: [
            'milestoneEntries',
            'milestoneEntries.milestone',
            'milestoneEntries.entries',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let responseEntries: TimesheetMilestoneEntry[] = [];

        for (const requestEntry of rejectEntryDTO.milestoneEntries) {
          let milestoneEntry = timesheet.milestoneEntries.filter(
            (entry) => entry.id === requestEntry
          )[0];

          if (!milestoneEntry) {
            throw new Error('Entry not found!');
          }

          let users: [] = await this.getUserManageUsers(authId);

          if (!users.length) {
            throw new Error('No users to manage');
          }
          users.forEach((user: any) => {
            if (user.value == userId) {
              flagUserIsAllowed = 1;
            }
          });

          if (flagUserIsAllowed == 0) {
            throw new Error('User is not allowed to change');
          }

          milestoneEntry.entries.map((entry) => {
            entry.rejectedAt = moment().toDate();
          });
          milestoneEntry.actionNotes = rejectEntryDTO.note;
          responseEntries.push(milestoneEntry);
        }
        await transactionalEntityManager.save(timesheet);

        //NOTIFICATION LOOP
        for (const requestEntry of rejectEntryDTO.milestoneEntries) {
          let milestoneEntry = timesheet.milestoneEntries.filter(
            (entry) => entry.id === requestEntry
          )[0];

          if (milestoneEntry) {
            await NotificationManager.danger(
              [timesheet.employeeId],
              `Timesheet Rejection`,
              `Timesheet of date ${moment(timesheet.startDate).format(
                'DD-MM-YYYY'
              )} - ${moment(timesheet.endDate).format(
                'DD-MM-YYYY'
              )} is rejected`,
              `/time-sheet?startDate=${moment(timesheet.startDate).format(
                'DD-MM-YYYY'
              )}&endDate=${moment(timesheet.endDate).format(
                'DD-MM-YYYY'
              )}&userId=${timesheet.employeeId}&timesheetId=${timesheet.id}`,
              NotificationEventType.TIME_SHEET_REJECT
            );
          }
        }

        return responseEntries;
      }
    );

    return milestoneEntries;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async unapproveAnyMilestoneTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    rejectEntryDTO: TimesheetEntryApproveRejectDTO
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    let milestoneEntries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheets = await this.find({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
          },
          relations: [
            'milestoneEntries',
            'milestoneEntries.milestone',
            'milestoneEntries.entries',
          ],
        });

        if (!timesheets) {
          throw new Error('Timesheet not found!');
        }

        let _flagNotFound = true;

        let responseEntries: TimesheetMilestoneEntry[] = [];

        for (const requestEntry of rejectEntryDTO.milestoneEntries) {
          timesheets.forEach((timesheet) => {
            let milestoneEntry = timesheet.milestoneEntries.filter(
              (entry) => entry.id === requestEntry
            )[0];

            if (milestoneEntry) {
              _flagNotFound = false;
              milestoneEntry.entries.map((entry) => {
                entry.approvedAt = null;
                entry.approvedBy = null;
                entry.rejectedAt = moment().toDate();
                // entry.rejectedBy = authId;
              });
              milestoneEntry.actionNotes = rejectEntryDTO.note;
              responseEntries.push(milestoneEntry);
            }
          });
        }

        if (_flagNotFound == true) {
          throw new Error('Entry not found!');
        }

        await transactionalEntityManager.save(timesheets);

        //NOTIFICATION LOOP
        for (const requestEntry of rejectEntryDTO.milestoneEntries) {
          for (let timesheet of timesheets) {
            let milestoneEntry = timesheet.milestoneEntries.filter(
              (entry) => entry.id === requestEntry
            )[0];

            if (milestoneEntry) {
              await NotificationManager.danger(
                [timesheet.employeeId],
                `Timesheet Unapproved`,
                `Timesheet of date ${moment(timesheet.startDate).format(
                  'DD-MM-YYYY'
                )} - ${moment(timesheet.endDate).format(
                  'DD-MM-YYYY'
                )} is unapproved`,
                `/time-sheet?startDate=${moment(timesheet.startDate).format(
                  'DD-MM-YYYY'
                )}&endDate=${moment(timesheet.endDate).format(
                  'DD-MM-YYYY'
                )}&userId=${timesheet.employeeId}&timesheetId=${timesheet.id}`,
                NotificationEventType.TIME_SHEET_UNAPPROVE
              );
            }
          }
        }

        return responseEntries;
      }
    );

    return milestoneEntries;
  }

  async unapproveManageMilestoneTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    rejectEntryDTO: TimesheetEntryApproveRejectDTO,
    authId: number
  ): Promise<any | undefined> {
    let flagUserIsAllowed = 0;
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    let milestoneEntries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
          relations: [
            'milestoneEntries',
            'milestoneEntries.milestone',
            'milestoneEntries.entries',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let responseEntries: TimesheetMilestoneEntry[] = [];

        for (const requestEntry of rejectEntryDTO.milestoneEntries) {
          let milestoneEntry = timesheet.milestoneEntries.filter(
            (entry) => entry.id === requestEntry
          )[0];

          if (!milestoneEntry) {
            throw new Error('Entry not found!');
          }

          let users: [] = await this.getUserManageUsers(authId);

          if (!users.length) {
            throw new Error('No users to manage');
          }
          users.forEach((user: any) => {
            if (user.value == userId) {
              flagUserIsAllowed = 1;
            }
          });

          if (flagUserIsAllowed == 0) {
            throw new Error('User is not allowed to change');
          }

          milestoneEntry.entries.map((entry) => {
            entry.approvedAt = null;
            entry.approvedBy = null;
            entry.rejectedAt = moment().toDate();
          });
          milestoneEntry.actionNotes = rejectEntryDTO.note;
          responseEntries.push(milestoneEntry);
        }

        await transactionalEntityManager.save(timesheet);

        //NOTIFICATION LOOP
        for (const requestEntry of rejectEntryDTO.milestoneEntries) {
          let milestoneEntry = timesheet.milestoneEntries.filter(
            (entry) => entry.id === requestEntry
          )[0];

          if (milestoneEntry) {
            await NotificationManager.danger(
              [timesheet.employeeId],
              `Timesheet Unapproved`,
              `Timesheet of date ${moment(timesheet.startDate).format(
                'DD-MM-YYYY'
              )} - ${moment(timesheet.endDate).format(
                'DD-MM-YYYY'
              )} is unapproved`,
              `/time-sheet?startDate=${moment(timesheet.startDate).format(
                'DD-MM-YYYY'
              )}&endDate=${moment(timesheet.endDate).format(
                'DD-MM-YYYY'
              )}&userId=${timesheet.employeeId}&timesheetId=${timesheet.id}`,
              NotificationEventType.TIME_SHEET_UNAPPROVE
            );
          }
        }

        return responseEntries;
      }
    );

    return milestoneEntries;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async deleteAnyMilestoneTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    requestEntries: Array<number>
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    let milestoneEntries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
          relations: [
            'milestoneEntries',
            'milestoneEntries.milestone',
            'milestoneEntries.entries',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let responseEntries: TimesheetMilestoneEntry[] = [];

        for (const requestEntry of requestEntries) {
          let milestoneEntry = timesheet.milestoneEntries.filter(
            (entry) => entry.id === requestEntry
          )[0];

          if (!milestoneEntry) {
            throw new Error('Entry not found!');
          }

          if (milestoneEntry.entries.length > 0)
            if (milestoneEntry.entries[0].approvedAt != null) {
              throw new Error('Cannot delete approved timesheet entry');
            }
          await transactionalEntityManager.delete(
            TimesheetEntry,
            milestoneEntry.entries
          );

          responseEntries.push(milestoneEntry);
        }

        await transactionalEntityManager.delete(
          TimesheetMilestoneEntry,
          requestEntries
        );

        return responseEntries;
      }
    );

    return milestoneEntries;
    // milestoneEntry.entries.map(entry => entry.submittedAt = )
  }

  async deleteTimesheetEntry(entryId: number): Promise<any | undefined> {
    // console.log(timesheetDTO);
    let entry: TimesheetEntry | undefined;
    let flag_delete = false;

    let response = await this.manager.transaction(
      async (transactionalEntityManager) => {
        entry = await transactionalEntityManager.findOne(
          TimesheetEntry,
          entryId,
          { relations: ['milestoneEntry', 'milestoneEntry.entries'] }
        );

        if (!entry) {
          throw new Error('Entry not found');
        }

        if (entry.approvedAt != null) {
          throw new Error('Cannot delete approved timesheet entry');
        }

        let deletedEntry = await transactionalEntityManager.delete(
          TimesheetEntry,
          entry.id
        );

        if (entry.milestoneEntry.entries.length == 1) {
          await transactionalEntityManager.delete(
            TimesheetMilestoneEntry,
            entry.milestoneEntryId
          );
        }

        return deletedEntry;
      }
    );

    return response;
  }

  async updateTimesheetMilestoneEntryNote(
    milestoneEntriesUpdateDTO: MilestoneEntriesUpdateDTO,
    userId: number
  ): Promise<any | undefined> {
    let entries = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let milestoneEntries = await transactionalEntityManager.find(
          TimesheetMilestoneEntry,
          { where: { id: In(milestoneEntriesUpdateDTO.milestoneEntryIds) } }
        );

        if (milestoneEntries.length < 1) {
          throw new Error('Milestone Entries not found');
        }

        let response: any = [];

        for (let milestoneEntry of milestoneEntries) {
          milestoneEntry.notes = milestoneEntriesUpdateDTO.note;

          milestoneEntry = await transactionalEntityManager.save(
            milestoneEntry
          );

          let deleteableAttachments: Attachment[] = [];
          let newAttachments = [
            ...new Set(milestoneEntriesUpdateDTO.attachments),
          ];
          let oldAttachments = await transactionalEntityManager.find(
            Attachment,
            {
              where: { targetId: milestoneEntry.id, targetType: 'PEN' },
            }
          );

          if (oldAttachments.length > 0) {
            oldAttachments.forEach((oldAttachment) => {
              let flag_found = false;

              newAttachments.forEach((attachment) => {
                let _indexOf = newAttachments.indexOf(attachment);
                if (oldAttachment.fileId === attachment) {
                  flag_found = true;
                  if (_indexOf > -1) {
                    newAttachments.splice(_indexOf, 1);
                  }
                } else {
                  if (_indexOf <= -1) {
                    newAttachments.push(attachment);
                  }
                }
              });
              if (!flag_found) {
                deleteableAttachments.push(oldAttachment);
              }
            });
            await transactionalEntityManager.remove(
              Attachment,
              deleteableAttachments
            );
          }

          console.log('NEW', newAttachments);
          console.log('DELETE', deleteableAttachments);

          for (const file of newAttachments) {
            let attachmentObj = new Attachment();
            attachmentObj.fileId = file;
            attachmentObj.targetId = milestoneEntry.id;
            attachmentObj.targetType = EntityType.PROJECT_ENTRY;
            attachmentObj.userId = userId;
            let attachment = await transactionalEntityManager.save(
              attachmentObj
            );
          }

          response.push(milestoneEntry);
        }

        return response;
      }
    );

    let ids: Array<number> = [],
      tracking: any = {};

    entries.forEach((entry: any, index: number) => {
      ids.push(entry.id);
      tracking[entry.id] = index;
    });

    console.log('IDS', ids);
    console.log('TRACKING', tracking);

    let entriesAttachments = await this.manager.find(Attachment, {
      where: { targetType: 'PEN', targetId: In(ids) },
      relations: ['file'],
    });

    if (entriesAttachments.length > 0) {
      for (let entryAttachment of entriesAttachments) {
        (entryAttachment as any).uid = entryAttachment.file.uniqueName;
        (entryAttachment as any).name = entryAttachment.file.originalName;
        (entryAttachment as any).type = entryAttachment.file.type;

        // console.log('TARGET', entryAttachment.targetId);
        // console.log('ENTRY', entries[tracking[entryAttachment.targetId]]);
        (entries[tracking[entryAttachment.targetId]] as any).attachment =
          entryAttachment;
      }
      // let entryAttachment: Attachment | null =
      //   entryAttachments.length > 0 ? entryAttachments[0] : null;
      // if (entryAttachment) {
      //   (entryAttachment as any).uid = entryAttachment.file.uniqueName;
      //   (entryAttachment as any).name = entryAttachment.file.originalName;
      //   (entryAttachment as any).type = entryAttachment.file.type;
      // }
      // (entry as any).attachment = entryAttachment;
    }

    return entries;
  }

  async getUserAnyUsers(): Promise<any | undefined> {
    let users: any = [];
    let records = await this.manager.find(Employee, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
    });

    records.forEach((record) => {
      let Obj: any = {};
      Obj.label = `${record.contactPersonOrganization.contactPerson.firstName} ${record.contactPersonOrganization.contactPerson.lastName}`;
      Obj.value = record.id;
      users.push(Obj);
    });

    return users;
  }

  async getUserManageAndOwnUsers(
    userId: number,
    userName: string
  ): Promise<any | undefined> {
    let users: any = [];
    let added: any = [];
    let projects = await this.manager.find(Opportunity, {
      where: [
        {
          status: 'P',
          accountDirectorId: userId,
        },
        {
          status: 'P',
          accountManagerId: userId,
        },
        {
          status: 'P',
          projectManagerId: userId,
        },
        {
          status: 'C',
          accountDirectorId: userId,
        },
        {
          status: 'C',
          accountManagerId: userId,
        },
        {
          status: 'C',
          projectManagerId: userId,
        },
      ],
      relations: [
        'opportunityResources',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
        'opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
        'opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee',
      ],
    });

    projects.map((project) => {
      project.opportunityResources.map((resource) => {
        resource.opportunityResourceAllocations.filter((allocation) => {
          if (allocation.isMarkedAsSelected) {
            allocation.contactPerson.contactPersonOrganizations.forEach(
              (org) => {
                if (
                  (org.employee != null || org.status == true) &&
                  !added.includes(org.employee.id)
                ) {
                  let Obj: any = {};
                  Obj.label = `${allocation.contactPerson.firstName} ${allocation.contactPerson.lastName}`;
                  Obj.value = org.employee.id;
                  users.push(Obj);
                  added.push(org.employee.id);
                }
              }
            );
          }
        });
      });
    });

    if (!added.includes(userId)) {
      users.push({ label: userName, value: userId });
    }
    return users;
  }

  async getUserManageUsers(userId: number): Promise<any | undefined> {
    let users: any = [];
    let added: any = [];
    let projects = await this.manager.find(Opportunity, {
      where: [
        {
          status: 'P',
          accountDirectorId: userId,
        },
        {
          status: 'P',
          accountManagerId: userId,
        },
        {
          status: 'P',
          projectManagerId: userId,
        },
        {
          status: 'C',
          accountDirectorId: userId,
        },
        {
          status: 'C',
          accountManagerId: userId,
        },
        {
          status: 'C',
          projectManagerId: userId,
        },
      ],
      relations: [
        'opportunityResources',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
        'opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
        'opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee',
      ],
    });

    projects.forEach((project) => {
      console.log('checking employee', project);
      project.opportunityResources.forEach((resource) => {
        resource.opportunityResourceAllocations.forEach((allocation) => {
          if (allocation.isMarkedAsSelected) {
            allocation.contactPerson.contactPersonOrganizations.forEach(
              (org) => {
                if (
                  (org.employee != null || org.status == true) &&
                  !added.includes(org.employee.id)
                ) {
                  let Obj: any = {};
                  Obj.label = `${allocation.contactPerson.firstName} ${allocation.contactPerson.lastName}`;
                  Obj.value = org.employee.id;
                  users.push(Obj);
                  added.push(org.employee.id);
                }
              }
            );
          }
        });
      });
    });

    return users;
  }

  async getUserOwnUsers(
    userId: number,
    userName: string
  ): Promise<any | undefined> {
    let users: any = [];

    users.push({ label: userName, value: userId });
    return users;
  }

  async getTimesheetPDF(
    milestoneEntryPrintDTO: MilestoneEntriesPrintDTO
  ): Promise<any | undefined> {
    const TOP_MARGIN = 20;
    const RIGHT_MARGIN = 10;
    const BOTTOM_MARGIN = 20;
    const LEFT_MARGIN = 10;
    const BORDER_COLOR = '#f0f0f0';
    const BACKGROUND_COLOR = '#fafafa';
    const WHITE_COLOR = '#ffffff';
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const WARNING_COLOR = '#ff4d4f';
    const TEXT_COLOR = '#000000';

    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: TOP_MARGIN,
        right: RIGHT_MARGIN,
        bottom: BOTTOM_MARGIN,
        left: LEFT_MARGIN,
      },
    });

    const generateTable = (
      doc: PDFKit.PDFDocument,
      rowCount: number,
      start: number,
      difference: number,
      columns: {
        width?: number;
        dataKey?: string;
      }[] = [],
      data: any = []
    ) => {
      let currentY = start;

      for (let i = 0; i < rowCount; i++) {
        var currentX = 25;
        for (let j = 0; j < columns.length; j++) {
          let column = columns[j];
          if (!column.width) continue;

          doc
            .rect(currentX, currentY, column.width, difference)
            .stroke(BORDER_COLOR);

          if (data?.milestone && column.dataKey) {
            doc.fontSize(8);
            doc.text(
              data.milestone.entries[i][column.dataKey] ?? '-',
              currentX,
              currentY + difference / 2,
              {
                height: difference,
                width: column.width,
                align: 'center',
                baseline: 'hanging',
              }
            );
          }

          currentX += column.width;
        }

        doc
          .polygon([25, currentY], [PAGE_WIDTH - 25, currentY])
          .stroke(BORDER_COLOR);

        currentY += difference;
      }
    };

    let milestoneEntries = await this.manager.find(TimesheetMilestoneEntry, {
      where: { id: In(milestoneEntryPrintDTO.milestoneEntryIds) },
      relations: [
        'timesheet',
        'timesheet.employee',
        'timesheet.employee.contactPersonOrganization',
        'timesheet.employee.contactPersonOrganization.organization',
        'timesheet.employee.contactPersonOrganization.contactPerson',
        'milestone',
        'milestone.project',
        'milestone.project.organization',
        'milestone.project.organization.delegateContactPerson',
        'entries',
      ],
    });

    if (!milestoneEntries) {
      throw new Error('Milestone Entry not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    interface Any {
      [key: string]: any;
    }

    let response: Any[] = [];

    milestoneEntries.forEach((milestoneEntry) => {
      let startDate = moment(milestoneEntry.timesheet.startDate, 'DD-MM-YYYY');
      let cStartDate = moment(
        milestoneEntry.timesheet.startDate,
        'DD-MM-YYYY'
      ).format('DD/MM/YYYY');
      let cEndDate = moment(
        milestoneEntry.timesheet.endDate,
        'DD-MM-YYYY'
      ).format('DD/MM/YYYY');

      let cMonthDays = moment(
        milestoneEntry.timesheet.startDate,
        'DD-MM-YYYY'
      ).daysInMonth();

      ``;

      let milestone: Any = {
        milestoneEntryId: milestoneEntry.id,
        milestoneId: milestoneEntry.milestoneId,
        name:
          milestoneEntry.milestone.project.type == 1
            ? `${milestoneEntry.milestone.project.title} - (${milestoneEntry.milestone.title})`
            : `${milestoneEntry.milestone.project.title}`,
        client: milestoneEntry.milestone.project.organization.name,
        contact:
          `${
            milestoneEntry.milestone.project.organization.delegateContactPerson
              ?.firstName ?? '-'
          } ${
            milestoneEntry.milestone.project.organization.delegateContactPerson
              ?.lastName ?? '-'
          }` ?? '-',
        notes: milestoneEntry.notes,
        totalHours: 0,
        invoicedDays: 0,
        hoursPerDay: milestoneEntry.milestone.project.hoursPerDay,
        entries: [],
      };

      for (let i = 1; i <= cMonthDays; i++) {
        let _flagFound = 0;
        let _foundEntry: TimesheetEntry | undefined;
        milestoneEntry.entries.map((entry: TimesheetEntry) => {
          if (parseInt(entry.date.substring(0, 2)) == i) {
            _flagFound = 1;
            _foundEntry = entry;
          }
        });
        if (_flagFound == 1 && _foundEntry != undefined) {
          milestone.totalHours += _foundEntry.hours;
          milestone.entries.push({
            entryId: _foundEntry.id,
            date: moment(_foundEntry.date, 'DD-MM-YYYY').format('D/M/Y'),
            day: moment(_foundEntry.date, 'DD-MM-YYYY').format('dddd'),
            startTime: moment(_foundEntry.startTime, 'HH:mm').format('HH:mm'),
            endTime: moment(_foundEntry.endTime, 'HH:mm').format('HH:mm'),
            breakHours: _foundEntry.breakHours,
            breakMinutes: _foundEntry.breakHours * 60,
            actualHours: _foundEntry.hours,
            notes: _foundEntry.notes,
          });
        } else {
          console.log(`${i}-${startDate.month()}-${startDate.year()}`);
          milestone.totalHours += 0;
          milestone.entries.push({
            entryId: '-',
            date: moment(
              `${i}-${startDate.month() + 1}-${startDate.year()}`,
              'DD-MM-YYYY'
            ).format('D/M/Y'),
            day: moment(
              `${i}-${startDate.month() + 1}-${startDate.year()}`,
              'DD-MM-YYYY'
            ).format('dddd'),
            startTime: '-',
            endTime: '-',
            breakHours: '-',
            breakMinutes: '-',
            actualHours: '-',
            notes: '-',
          });
        }
      }

      milestone.invoicedDays =
        milestone.totalHours / milestoneEntry.milestone.project.hoursPerDay;

      let entry = {
        id: milestoneEntry.id,
        project: milestoneEntry.milestone.project.title,
        company:
          milestoneEntry.timesheet.employee.contactPersonOrganization
            .organization.name,
        employee: `${milestoneEntry.timesheet.employee.contactPersonOrganization.contactPerson.firstName} ${milestoneEntry.timesheet.employee.contactPersonOrganization.contactPerson.lastName}`,
        period: `${cStartDate} - ${cEndDate}`,
        notes: milestoneEntry.timesheet.notes,
        milestone: milestone,
      };

      response.push(entry);
    });

    let uniqueName = uuidv4();
    doc.pipe(
      fs.createWriteStream(
        path.join(__dirname, `../../public/downloads/${uniqueName}.pdf`)
      )
    );

    for (let sheet = 0; sheet < response.length; sheet++) {
      if (sheet > 0) doc.addPage();

      let currentSheet = response[sheet];

      // write to PDF
      // doc.pipe(res); // HTTP response

      doc.fontSize(25);
      doc.text(`Timesheet`, 25, 30);

      // doc.image(
      //   'C:/Users/Shahzaib/Desktop/TimesheetPdf/z-cp-logo.png',
      //   PAGE_WIDTH - 180,
      //   25,
      //   { width: 150 }
      // );

      //-- TOP SECTION
      //* CURRENT HEIGHT 0

      doc.rect(25, 75, PAGE_WIDTH - 50, 80).stroke(BORDER_COLOR);
      // doc.rect(25.5, 75.5, 120, 19).fill(BACKGROUND_COLOR);
      // doc.rect(280, 75.5, 120, 19).fill(BACKGROUND_COLOR);
      // doc.rect(25.5, 135, 120, 19).fill(BACKGROUND_COLOR);
      // doc.rect(280, 135, 120, 19).fill(BACKGROUND_COLOR);

      //* CURRENT HEIGHT 45
      generateTable(doc, 3, 95, 20);

      doc.fontSize(11);
      doc.font('Helvetica-Bold').text(`Company:`, 30, 80, { underline: true });
      doc.font('Helvetica').text(currentSheet.company, 130, 80, {
        width: 150,
        height: 10,
        ellipsis: true,
      });
      doc
        .font('Helvetica-Bold')
        .text(`Employee:`, 300, 80, { underline: true });
      doc.font('Helvetica').text(currentSheet.employee, 380, 80, {
        width: 150,
        height: 10,
        ellipsis: true,
      });
      doc.font('Helvetica-Bold').text(`Client:`, 30, 100, { underline: true });
      doc.font('Helvetica').text(currentSheet.milestone.client, 130, 100, {
        width: 350,
        height: 10,
        ellipsis: true,
      });
      doc.font('Helvetica-Bold').text(`Project:`, 30, 120, { underline: true });
      doc.font('Helvetica').text(currentSheet.project, 130, 120, {
        width: 350,
        height: 10,
        ellipsis: true,
      });
      doc
        .font('Helvetica-Bold')
        .text(`Client Contact:`, 30, 140, { underline: true });
      doc.font('Helvetica').text(currentSheet.milestone.contact, 130, 140, {
        width: 150,
        height: 10,
        ellipsis: true,
      });
      doc
        .font('Helvetica-Bold')
        .text(`Timesheet Period:`, 300, 140, { underline: true });
      doc.font('Helvetica').text(currentSheet.period, 410, 140, {
        width: 150,
        height: 10,
        ellipsis: true,
      });

      //-- CENTER TABLE
      //* CURRENT HEIGHT 125
      doc.rect(25, 160, PAGE_WIDTH - 50, 530).stroke(BORDER_COLOR);

      doc.rect(25, 160, 50, 50).stroke(BORDER_COLOR);
      doc.rect(75, 160, 50, 50).stroke(BORDER_COLOR);
      doc.rect(125, 160, 70, 50).stroke(BORDER_COLOR);
      doc.rect(125, 185, 35, 25).stroke(BORDER_COLOR);
      doc.rect(160, 185, 35, 25).stroke(BORDER_COLOR);
      doc.rect(195, 160, 35, 50).stroke(BORDER_COLOR);
      doc.rect(230, 160, 35, 50).stroke(BORDER_COLOR);
      doc.rect(265, 160, 305, 50).stroke(BORDER_COLOR);

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Date`, 25, 185, { width: 50, align: 'center' });
      doc.text(`Day`, 75, 185, { width: 50, align: 'center' });
      doc.text(`Hours`, 120, 175, { width: 70, align: 'center' });
      doc.text(`Start`, 125, 195, { width: 35, align: 'center' });
      doc.text(`Finish`, 160, 195, { width: 35, align: 'center' });
      doc.text(`Break`, 195, 185, { width: 35, align: 'center' });
      doc.text(`Daily Total`, 230, 175, { width: 35, align: 'center' });
      doc.text(`Comments`, 265, 185, { width: 305, align: 'center' });

      doc.fontSize(6).font('Helvetica');
      doc.text(`(mins)`, 195, 195, { width: 35, align: 'center' });
      doc.text(`(hrs)`, 230, 198, { width: 35, align: 'center' });

      //* CURRENT HEIGHT 150
      generateTable(
        doc,
        currentSheet.milestone.entries.length,
        210,
        16,
        [
          { width: 50, dataKey: 'date' },
          { width: 50, dataKey: 'day' },
          { width: 35, dataKey: 'startTime' },
          { width: 35, dataKey: 'endTime' },
          { width: 35, dataKey: 'breakMinutes' },
          { width: 35, dataKey: 'actualHours' },
          { width: 305, dataKey: 'notes' },
        ],
        currentSheet
      );

      //-- SUM ROW
      //* CURRENT HEIGHT 750
      generateTable(doc, 1, 720, 20, [
        { width: 100 },
        { width: 82 },
        { width: 100 },
        { width: 82 },
        { width: 100 },
        { width: 82 },
      ]);

      doc.fontSize(11).font('Helvetica-Bold');

      doc.text(`Hours in Day`, 25, 728, { width: 100, align: 'center' });
      doc.text(`Total Hours`, 207, 728, { width: 100, align: 'center' });
      doc.text(`Invoiced Days`, 389, 728, { width: 100, align: 'center' });

      doc.font('Helvetica');

      doc.text(currentSheet.milestone.hoursPerDay, 125, 728, {
        width: 82,
        align: 'center',
      });
      doc.text(currentSheet.milestone.totalHours, 307, 728, {
        width: 82,
        align: 'center',
      });
      doc.text(currentSheet.milestone.invoicedDays, 489, 728, {
        width: 82,
        align: 'center',
      });
      // doc.rect(25, 760, PAGE_WIDTH - 50, 20).stroke(BORDER_COLOR);
      // doc.rect(25.5, 760.5, 80, 19).fill(BACKGROUND_COLOR);
      // doc.rect(225, 760.5, 80, 19).fill(BACKGROUND_COLOR);
      // doc.rect(425, 760.5, 80, 19).fill(BACKGROUND_COLOR);

      //-- SIGNATURE ROW
      //* CURRENT HEIGHT 780

      doc
        .fillColor(WARNING_COLOR)
        .fontSize(9)
        .text(
          `I certify that the entries are a true record of attendance.`,
          25,
          750,
          { oblique: true, underline: true }
        );

      doc.fontSize(10).fillColor(TEXT_COLOR);

      doc.text(`Employee Declaration:`, 25, 765);
      doc.text(`Manager Approval:`, (PAGE_WIDTH - 50) / 2 + 40, 765);
      doc
        .rect(25, 780, (PAGE_WIDTH - 50) / 2 - 40, 20)
        .fillAndStroke(BACKGROUND_COLOR, BORDER_COLOR);

      doc
        .rect((PAGE_WIDTH - 50) / 2 + 40, 780, 257, 20)
        .fillAndStroke(BACKGROUND_COLOR, BORDER_COLOR);

      doc.fontSize(11);
      doc.fillColor(TEXT_COLOR);

      doc.text(`Signature:`, 25, 805);
      doc.text(`Date:`, 165, 805);
      doc.text(`Signature:`, (PAGE_WIDTH - 50) / 2 + 40, 805);
      doc.text(`Date:`, (PAGE_WIDTH - 50) / 2 + 180, 805);

      //* CURRENT HEIGHT 795
      // finalize the PDF and end the stream
    }

    doc.end();
    // doc.pipe(res);

    return {
      files: `files/downloads/${uniqueName}.pdf`,
      timesheets: response,
    };
  }

  async _getMilestoneResources(
    milestoneIds: Array<number>,
    type: string = 'A&M'
  ): Promise<any | undefined> {
    let relations: Array<string> = [];

    if (type == 'Allocations' || type == 'A&M') {
      relations.push(
        'opportunityResources',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
        'opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations',
        'opportunityResources.opportunityResourceAllocations.contactPerson.contactPersonOrganizations.employee'
      );
    }
    if (type == 'Managers' || type == 'A&M') {
      relations.push(
        'project',
        'project.projectManager',
        'project.accountDirector',
        'project.accountManager',
        'project.projectManager.contactPersonOrganization',
        'project.accountDirector.contactPersonOrganization',
        'project.accountManager.contactPersonOrganization',
        'project.projectManager.contactPersonOrganization.contactPerson',
        'project.accountDirector.contactPersonOrganization.contactPerson',
        'project.accountManager.contactPersonOrganization.contactPerson'
      );
    }

    let milestones = await this.manager.find(Milestone, {
      relations: relations,
      where: { id: In(milestoneIds) },
    });

    if (!milestones.length) {
      throw new Error('Milestone not found');
    }

    let users: any = {
      ids: [],
      details: {},
    };

    if (type == 'Managers' || type == 'A&M') {
      for (let milestone of milestones) {
        if (milestone.project.accountDirectorId) {
          users.ids.push(milestone.project.accountDirectorId);
          users.details[
            milestone.project.accountDirectorId
          ] = `${milestone.project.accountDirector.contactPersonOrganization.contactPerson.firstName} ${milestone.project.accountDirector.contactPersonOrganization.contactPerson.lastName}`;
        }
        if (milestone.project.projectManagerId) {
          users.ids.push(milestone.project.projectManagerId);
          users.details[
            milestone.project.projectManagerId
          ] = `${milestone.project.projectManager.contactPersonOrganization.contactPerson.firstName} ${milestone.project.projectManager.contactPersonOrganization.contactPerson.lastName}`;
        }
        if (milestone.project.accountManagerId) {
          users.ids.push(milestone.project.accountManagerId);
          users.details[
            milestone.project.accountManagerId
          ] = `${milestone.project.accountManager.contactPersonOrganization.contactPerson.firstName} ${milestone.project.accountManager.contactPersonOrganization.contactPerson.lastName}`;
        }
      }
    }

    if (type == 'Allocations' || type == 'A&M') {
      for (let milestone of milestones) {
        for (let resource of milestone.opportunityResources) {
          for (let allocation of resource.opportunityResourceAllocations) {
            if (allocation.isMarkedAsSelected) {
              allocation.contactPerson.contactPersonOrganizations.forEach(
                (org) => {
                  if (org.employee != null || org.status == true) {
                    users.ids.push(org.employee.id);
                    users.details[
                      org.employee.id
                    ] = `${allocation.contactPerson.firstName} ${allocation.contactPerson.lastName}`;
                  }
                }
              );
            }
          }
        }
      }
    }

    users.ids = [...new Set(users.ids)];
    users.ids.filter(Number);

    console.log('PRINTING USERS', users);
    return users;
  }

  async getAnyTimesheetByMilestone(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    milestoneIds: Array<number>,
    authId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss.SSS'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY')
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss.SSS');

    console.log(cStartDate, cEndDate);

    let users = await this._getMilestoneResources(milestoneIds, 'Allocations');

    let timesheets = await this.find({
      where: {
        startDate: MoreThanOrEqual(cStartDate),
        endDate: LessThanOrEqual(cEndDate),
        employeeId: In(users.ids),
      },
      relations: [
        'employee',
        'employee.contactPersonOrganization',
        'employee.contactPersonOrganization.contactPerson',
        'milestoneEntries',
        'milestoneEntries.milestone',
        'milestoneEntries.milestone.project',
        'milestoneEntries.entries',
      ],
    });

    if (!timesheets) {
      throw new Error('Timesheet not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    let resTimesheets: any = [];

    interface Any {
      [key: string]: any;
    }

    for (let timesheet of timesheets) {
      let resTimesheet: any = {
        userId: timesheet.employeeId,
        user: `${timesheet.employee.contactPersonOrganization.contactPerson.firstName} ${timesheet.employee.contactPersonOrganization.contactPerson.lastName}`,
        milestones: [],
        milestoneStatuses: [],
        timesheetStatus: TimesheetStatus,
      };
      users.ids.splice(users.ids.indexOf(timesheet.employeeId), 1);
      for (let milestoneEntry of timesheet.milestoneEntries) {
        if (milestoneIds.includes(milestoneEntry.milestoneId)) {
          let status: TimesheetStatus = TimesheetStatus.SAVED;

          let attachments = await this.manager.find(Attachment, {
            where: { targetType: 'PEN', targetId: milestoneEntry.id },
            relations: ['file'],
          });

          let attachment: Attachment | null =
            attachments.length > 0 ? attachments[0] : null;
          if (attachment) {
            (attachment as any).uid = attachment.file.uniqueName;
            (attachment as any).name = attachment.file.originalName;
            (attachment as any).type = attachment.file.type;
          }

          let authHaveThisMilestone = false;
          if (
            milestoneEntry.milestone.project.accountDirectorId == authId ||
            milestoneEntry.milestone.project.accountManagerId == authId ||
            milestoneEntry.milestone.project.projectManagerId == authId
          ) {
            authHaveThisMilestone = true;
          }

          let milestone: Any = {
            milestoneEntryId: milestoneEntry.id,
            milestoneId: milestoneEntry.milestoneId,
            milestone: milestoneEntry.milestone.title,
            projectId: milestoneEntry.milestone.projectId,
            projectType: milestoneEntry.milestone.project.type,
            project: milestoneEntry.milestone.project.title,
            phase: milestoneEntry.milestone.project.phase,
            isManaged: authHaveThisMilestone,
            notes: milestoneEntry.notes,
            actionNotes: milestoneEntry.actionNotes,
            totalHours: 0,
            attachment: attachment,
          };

          milestoneEntry.entries.map((entry: TimesheetEntry) => {
            milestone.totalHours += entry.hours;
            milestone[moment(entry.date, 'DD-MM-YYYY').format('D/M')] = {
              entryId: entry.id,
              startTime: moment(entry.startTime, 'HH:mm').format('HH:mm'),
              endTime: moment(entry.endTime, 'HH:mm').format('HH:mm'),
              breakHours: entry.breakHours,
              actualHours: entry.hours,
              notes: entry.notes,
            };

            if (entry.rejectedAt !== null) status = TimesheetStatus.REJECTED;
            else if (entry.approvedAt !== null)
              status = TimesheetStatus.APPROVED;
            else if (entry.submittedAt !== null)
              status = TimesheetStatus.SUBMITTED;
          });

          milestone.status = status;
          resTimesheet.milestoneStatuses.push(status);
          resTimesheet.milestones.push(milestone);
        }
      }

      resTimesheet.timesheetStatus = resTimesheet.milestoneStatuses.includes(
        TimesheetStatus.REJECTED
      )
        ? TimesheetStatus.REJECTED
        : resTimesheet.milestoneStatuses.includes(TimesheetStatus.SAVED)
        ? TimesheetStatus.SAVED
        : resTimesheet.milestoneStatuses.includes(TimesheetStatus.SUBMITTED)
        ? TimesheetStatus.SUBMITTED
        : resTimesheet.milestoneStatuses.includes(TimesheetStatus.APPROVED)
        ? TimesheetStatus.APPROVED
        : TimesheetStatus.NOT_CREATED;

      resTimesheets.push(resTimesheet);
    }

    for (const id of users.ids) {
      let resTimesheet: any = {
        user: users.details[id],
        userId: id,
        milestones: [],
        milestoneStatuses: [],
        timesheetStatus: TimesheetStatus.NOT_CREATED,
      };

      resTimesheets.push(resTimesheet);
    }

    let response = {
      timesheets: resTimesheets,
    };

    return response;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }

  async getAnyUserMilestones(): Promise<any | undefined> {
    let milestones: any = [];
    let projects = await this.manager.find(Opportunity, {
      relations: ['milestones'],
    });

    projects.forEach((project) => {
      project.milestones.forEach((milestone) => {
        let Obj: any = {};
        if (project.type == 2) Obj.label = project.title;
        else Obj.label = `${project.title} - (${milestone.title})`;
        Obj.value = milestone.id;
        milestones.push(Obj);
      });
    });

    return milestones;
  }

  async _getUserAnyMilestones(type = 'value') {
    let milestones: any = [];

    let projects = await this.manager.find(Opportunity, {
      where: [
        { status: OpportunityStatus.WON },
        { status: OpportunityStatus.COMPLETED },
      ],
      relations: ['milestones'],
    });

    for (let project of projects) {
      for (let milestone of project.milestones) {
        if (type === 'value')
          milestones.push({
            label:
              project.type == 2
                ? project.title
                : `${project.title} - (${milestone.title})`,
            value: milestone.id,
          });
        else milestones.push(milestone.id);
      }
    }

    return milestones;
  }

  async _getUserManageMilestones(userId: number, type = 'value') {
    let milestones: any = [];

    let projects = await this.manager.find(Opportunity, {
      where: [
        { status: OpportunityStatus.WON },
        { status: OpportunityStatus.COMPLETED },
      ],
      relations: ['milestones'],
    });

    for (let project of projects) {
      if (project.projectManagerId == userId) {
        for (let milestone of project.milestones) {
          if (type === 'value')
            milestones.push({
              label:
                project.type == 2
                  ? project.title
                  : `${project.title} - (${milestone.title})`,
              value: milestone.id,
            });
          else milestones.push(milestone.id);
        }
      }
    }

    return milestones;
  }

  async _getUserManageAndOwnMilestones(userId: number, type = 'value') {
    let milestones: any = [];

    let projects = await this.manager.find(Opportunity, {
      where: [
        { status: OpportunityStatus.WON },
        { status: OpportunityStatus.COMPLETED },
      ],
      relations: [
        'milestones',
        'organization',
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    // console.log('result', result);

    let employee = await this.manager.findOne(Employee, userId, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }
    let employeeContactPersonId =
      employee.contactPersonOrganization.contactPerson.id;

    for (let project of projects) {
      if (project.projectManagerId == userId) {
        for (let milestone of project.milestones) {
          if (type === 'value')
            milestones.push({
              label:
                project.type == 2
                  ? project.title
                  : `${project.title} - (${milestone.title})`,
              value: milestone.id,
            });
          else milestones.push(milestone.id);
        }
        continue;
      }
      for (let milestone of project.milestones) {
        let flag_found = false;
        for (let resource of milestone.opportunityResources) {
          for (let allocation of resource.opportunityResourceAllocations) {
            if (
              allocation.contactPersonId === employeeContactPersonId &&
              allocation.isMarkedAsSelected
            ) {
              flag_found = true;
            }
          }
          if (flag_found) break;
        }
        if (flag_found)
          if (type === 'value')
            milestones.push({
              label:
                project.type == 2
                  ? project.title
                  : `${project.title} - (${milestone.title})`,
              value: milestone.id,
            });
          else milestones.push(milestone.id);
      }
    }

    return milestones;
  }

  async _getUserOwnMilestones(userId: number, type = 'value') {
    let milestones: any = [];

    let projects = await this.manager.find(Opportunity, {
      where: [
        { status: OpportunityStatus.WON },
        { status: OpportunityStatus.COMPLETED },
      ],
      relations: [
        'milestones',
        'organization',
        'opportunityResources',
        'opportunityResources.panelSkill',
        'opportunityResources.panelSkillStandardLevel',
        'opportunityResources.opportunityResourceAllocations',
        'opportunityResources.opportunityResourceAllocations.contactPerson',
      ],
    });

    // console.log('result', result);

    let employee = await this.manager.findOne(Employee, userId, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
    });

    if (!employee) {
      throw new Error('Employee not found');
    }
    let employeeContactPersonId =
      employee.contactPersonOrganization.contactPerson.id;

    for (let project of projects) {
      for (let milestone of project.milestones) {
        let flag_found = false;
        for (let resource of milestone.opportunityResources) {
          for (let allocation of resource.opportunityResourceAllocations) {
            if (
              allocation.contactPersonId === employeeContactPersonId &&
              allocation.isMarkedAsSelected
            ) {
              flag_found = true;
            }
          }
          if (flag_found) break;
        }
        if (flag_found)
          if (type === 'value')
            milestones.push({
              label:
                project.type == 2
                  ? project.title
                  : `${project.title} - (${milestone.title})`,
              value: milestone.id,
            });
          else milestones.push(milestone.id);
      }
    }

    return milestones;
  }

  async getUserDummyUsersByDate(): Promise<any | undefined> {
    let users: any = [];
    let records = await this.manager.find(Employee, {
      relations: [
        'contactPersonOrganization',
        'contactPersonOrganization.contactPerson',
      ],
    });

    let startDate = moment().startOf('month').toDate();
    let endDate = moment().endOf('month').toDate();

    records.forEach(async (record) => {
      let contactPerson = record.contactPersonOrganization.contactPerson;
      let allocations = await this.manager.find(OpportunityResourceAllocation, {
        where: { contactPersonId: contactPerson.id },
        relations: ['opportunityResource'],
      });

      let _flagFound = false;

      allocations.forEach((allocation) => {
        if (
          startDate >= allocation.opportunityResource.startDate &&
          endDate <= allocation.opportunityResource.endDate
        ) {
          _flagFound = true;
        }
      });

      if (_flagFound) {
        let Obj: any = {};
        Obj.label = `${contactPerson.firstName} ${contactPerson.lastName}`;
        Obj.value = record.id;
        users.push(Obj);
      }
    });

    return users;
  }

  //!--------------------------- HELPER FUNCTIONS ----------------------------//

  _validateEntryDates(date: Date, timesheet: Timesheet) {
    const timesheetStart = moment(timesheet.startDate);
    const timesheetEnd = moment(timesheet.endDate);

    if (
      !moment(date, 'YYYY-MM-DD', true).isBetween(
        timesheetStart,
        timesheetEnd,
        'date',
        '[]'
      )
    ) {
      throw new Error('Entry Date cannot be out of Timesheet dates');
    }

    return true;
  }

  _validateBulkEntryDates(
    startDate: Moment,
    endDate: Moment,
    timesheet: Timesheet
  ) {
    console.log(timesheet.startDate, timesheet.endDate);

    const timesheetStart = moment(timesheet.startDate);
    const timesheetEnd = moment(timesheet.endDate);

    if (!startDate.isBetween(timesheetStart, timesheetEnd, 'date', '[]')) {
      throw new Error('Bulk Start Date cannot be out of Timesheet dates');
    }

    if (!endDate.isBetween(timesheetStart, timesheetEnd, 'date', '[]')) {
      throw new Error('Bulk End Date cannot be out of Timesheet dates');
    }
  }

  async _validateHours(
    resource: OpportunityResource,
    hours: number,
    employeeId: number,
    entryId: number | null = null
  ) {
    let whereCondition: any = {
      employeeId: employeeId,
      startDate: MoreThanOrEqual(resource.startDate),
    };
    if (resource.endDate)
      whereCondition['endDate'] = LessThanOrEqual(resource.endDate);
    let timesheets = await this.manager.find(Timesheet, {
      where: whereCondition,
      relations: ['milestoneEntries', 'milestoneEntries.entries'],
    });

    let pastHours = 0;
    for (let timesheet of timesheets) {
      for (let milestoneEntry of timesheet.milestoneEntries) {
        if (milestoneEntry.milestoneId != resource.milestoneId) continue;
        for (let entry of milestoneEntry.entries) {
          if (entry.id === entryId) continue;
          pastHours += entry.hours;
        }
      }
    }

    console.log(
      '🚀 ~ file: timesheetRepository.ts:2754 ~ TimesheetRepository ~ resource:',
      resource.billableHours,
      pastHours
    );

    if (pastHours + hours > resource.billableHours) {
      throw new Error('logged hours cannot be more than billable hours');
    }

    return true;
  }

  async _validateBulkHours(
    startDate: Moment,
    endDate: Moment,
    resource: OpportunityResource,
    bulkTimesheetDTO: BulkTimesheetDTO,
    employeeId: number
  ) {
    let timesheets = await this.manager.find(Timesheet, {
      where: { employeeId: employeeId },
      relations: ['milestoneEntries', 'milestoneEntries.entries'],
    });

    let pastHours = 0;
    for (let timesheet of timesheets) {
      for (let milestoneEntry of timesheet.milestoneEntries) {
        if (milestoneEntry.milestoneId != resource.milestoneId) continue;
        for (let entry of milestoneEntry.entries) {
          if (
            moment(entry.date, 'DD-MM-YYYY', true).isBetween(
              startDate,
              endDate,
              'date',
              '[]'
            )
          )
            continue;
          pastHours += entry.hours;
        }
      }
    }

    let currentHours = 0;
    for (let currentEntry of bulkTimesheetDTO.entries) {
      const entryMomentDate = moment(currentEntry.date, 'DD-MM-YYYY', true);
      const entryMomentStartTime = moment(
        currentEntry.startTime,
        'HH:mm',
        true
      );
      const entryMomentEndTime = moment(currentEntry.endTime, 'HH:mm', true);
      let actualHours = 0;
      if (entryMomentEndTime.diff(entryMomentStartTime, 'minutes') / 60 < 0) {
        actualHours =
          Math.abs(
            entryMomentEndTime
              .add(1, 'days')
              .diff(entryMomentStartTime, 'minutes') / 60
          ) - currentEntry.breakHours;
      } else {
        actualHours =
          Math.abs(
            entryMomentEndTime.diff(entryMomentStartTime, 'minutes') / 60
          ) - currentEntry.breakHours;
      }
      currentHours += actualHours;
    }

    if (pastHours + currentHours > resource.billableHours) {
      throw new Error('logged hours cannot be more than billable hours');
    }

    return true;
  }
}
