import {
  MilestoneEntriesPrintDTO,
  MilestoneEntriesUpdateDTO,
  TimesheetEntryApproveRejectDTO,
  TimesheetDTO,
} from '../dto';
import {
  EntityRepository,
  Repository,
  MoreThan,
  In,
  Not,
  IsNull,
} from 'typeorm';
import { Timesheet } from '../entities/timesheet';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Attachment } from '../entities/attachment';
import { TimesheetStatus, EntityType } from '../constants/constants';
import { Employee } from '../entities/employee';
import { Opportunity } from '../entities/opportunity';
import { OpportunityResourceAllocation } from '../entities/opportunityResourceAllocation';
import moment from 'moment';
import { Milestone } from '../entities/milestone';
import { LeaveRequest } from '../entities/leaveRequest';

@EntityRepository(Timesheet)
export class TimesheetRepository extends Repository<Timesheet> {
  async getAnyTimesheet(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    authId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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

    let resLeaveRequests: any = [];
    let leaveRequest = await this.manager.find(LeaveRequest, {
      where: [
        {
          employeeId: userId,
          submittedAt: Not(IsNull()),
          rejectedAt: IsNull(),
        },
        { employeeId: userId, approvedAt: Not(IsNull()), rejectedAt: IsNull() },
      ],
      relations: ['entries', 'work', 'type', 'type.leaveRequestType'],
    });

    leaveRequest.forEach((leaveRequest) => {
      let leaveRequestDetails = leaveRequest.getEntriesDetails;
      if (
        moment(leaveRequestDetails.startDate).isSameOrAfter(cStartDate) &&
        moment(leaveRequestDetails.endDate).isSameOrBefore(cEndDate)
      ) {
        let resLeaveRequest: any = {
          leaveRequest: true,
          project: leaveRequest.work?.title ?? '-',
          workId: leaveRequest.workId,
          leaveType: leaveRequest.type?.leaveRequestType.label ?? 'Unpaid',
          typeId: leaveRequest.typeId,
          totalHours: 0.0,
        };
        leaveRequest.entries.forEach((entry) => {
          resLeaveRequest[moment(entry.date, 'YYYY-MM-DD').format('D/M')] = {
            date: moment(entry.date, 'YYYY-MM-DD').format('D-M-Y'),
            hours: entry.hours,
            status: leaveRequest.status,
            statusMsg: leaveRequest.note,
            notes: leaveRequest.desc,
          };
        });
        resLeaveRequests.push(resLeaveRequest);
      }
    });

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
        isManaged: authHaveThisMilestone,
        notes: milestoneEntry.notes,
        attachment: attachment,
        totalHours: 0,
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

    milestones.push(resLeaveRequests);

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
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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

    let resLeaveRequests: any = [];
    let leaveRequest = await this.manager.find(LeaveRequest, {
      where: [
        {
          employeeId: userId,
          submittedAt: Not(IsNull()),
          rejectedAt: IsNull(),
        },
        { employeeId: userId, approvedAt: Not(IsNull()), rejectedAt: IsNull() },
      ],
      relations: ['entries', 'work', 'type', 'type.leaveRequestType'],
    });

    leaveRequest.forEach((leaveRequest) => {
      let leaveRequestDetails = leaveRequest.getEntriesDetails;
      if (
        moment(leaveRequestDetails.startDate).isSameOrAfter(cStartDate) &&
        moment(leaveRequestDetails.endDate).isSameOrBefore(cEndDate)
      ) {
        let resLeaveRequest: any = {
          leaveRequest: true,
          project: leaveRequest.work?.title ?? '-',
          workId: leaveRequest.workId,
          leaveType: leaveRequest.type?.leaveRequestType.label ?? 'Unpaid',
          typeId: leaveRequest.typeId,
          totalHours: 0.0,
        };
        leaveRequest.entries.forEach((entry) => {
          resLeaveRequest[moment(entry.date, 'YYYY-MM-DD').format('D/M')] = {
            date: moment(entry.date, 'YYYY-MM-DD').format('D-M-Y'),
            hours: entry.hours,
            status: leaveRequest.status,
            statusMsg: leaveRequest.note,
            notes: leaveRequest.desc,
          };
        });
        resLeaveRequests.push(resLeaveRequest);
      }
    });

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
        isManaged: authHaveThisMilestone,
        notes: milestoneEntry.notes,
        attachment: attachment,
        totalHours: 0,
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

    milestones.push(resLeaveRequests);

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
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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

    let resLeaveRequests: any = [];
    let leaveRequest = await this.manager.find(LeaveRequest, {
      where: [
        {
          employeeId: userId,
          submittedAt: Not(IsNull()),
          rejectedAt: IsNull(),
        },
        { employeeId: userId, approvedAt: Not(IsNull()), rejectedAt: IsNull() },
      ],
      relations: ['entries', 'work', 'type', 'type.leaveRequestType'],
    });

    leaveRequest.forEach((leaveRequest) => {
      let leaveRequestDetails = leaveRequest.getEntriesDetails;
      if (
        moment(leaveRequestDetails.startDate).isSameOrAfter(cStartDate) &&
        moment(leaveRequestDetails.endDate).isSameOrBefore(cEndDate)
      ) {
        let resLeaveRequest: any = {
          leaveRequest: true,
          project: leaveRequest.work?.title ?? '-',
          workId: leaveRequest.workId,
          leaveType: leaveRequest.type?.leaveRequestType.label ?? 'Unpaid',
          typeId: leaveRequest.typeId,
          totalHours: 0.0,
        };
        leaveRequest.entries.forEach((entry) => {
          resLeaveRequest[moment(entry.date, 'YYYY-MM-DD').format('D/M')] = {
            date: moment(entry.date, 'YYYY-MM-DD').format('D-M-Y'),
            hours: entry.hours,
            status: leaveRequest.status,
            statusMsg: leaveRequest.note,
            notes: leaveRequest.desc,
          };
        });
        resLeaveRequests.push(resLeaveRequest);
      }
    });

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
          isManaged: authHaveThisMilestone,
          notes: milestoneEntry.notes,
          attachment: attachment,
          totalHours: 0,
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

    milestones.push(resLeaveRequests);

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
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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
            'DD-MM-YYYY HH:mm:ss'
          ).toDate();
          timesheet.endDate = moment(
            `${endDate} 00:00:00`,
            'DD-MM-YYYY HH:mm:ss'
          ).toDate();
          timesheet.employeeId = userId;

          timesheet = await transactionalEntityManager.save(timesheet);
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

        let entry = new TimesheetEntry();
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
        if (
          moment(timesheetDTO.endTime, 'HH:mm').diff(
            moment(timesheetDTO.startTime, 'HH:mm'),
            'minutes'
          ) /
            60 <
          0
        ) {
          entry.hours =
            Math.abs(
              moment(timesheetDTO.endTime, 'HH:mm')
                .add(1, 'days')
                .diff(moment(timesheetDTO.startTime, 'HH:mm'), 'minutes') / 60
            ) - timesheetDTO.breakHours;
        } else {
          entry.hours =
            Math.abs(
              moment(timesheetDTO.endTime, 'HH:mm').diff(
                moment(timesheetDTO.startTime, 'HH:mm'),
                'minutes'
              ) / 60
            ) - timesheetDTO.breakHours;
        }

        entry.milestoneEntryId = milestoneEntry.id;
        entry.notes = timesheetDTO.notes;

        entry = await transactionalEntityManager.save(entry);

        return entry;
      }
    );

    // console.log(timesheetDTO);

    return entry;
  }

  async editTimesheetEntry(
    entryId: number,
    timesheetDTO: TimesheetDTO
  ): Promise<any | undefined> {
    // console.log(timesheetDTO);
    let entry = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let entry: TimesheetEntry | undefined;
        entry = await this.manager.findOne(TimesheetEntry, entryId);
        if (!entry) {
          throw new Error('Entry not found');
        }
        entry.date = moment(timesheetDTO.date, 'DD-MM-YYYY').format(
          'DD-MM-YYYY'
        );
        entry.startTime = moment(timesheetDTO.startTime, 'HH:mm').format(
          'HH:mm'
        );
        entry.endTime = moment(timesheetDTO.endTime, 'HH:mm').format('HH:mm');
        entry.breakHours = timesheetDTO.breakHours;

        if (
          moment(timesheetDTO.endTime, 'HH:mm').diff(
            moment(timesheetDTO.startTime, 'HH:mm'),
            'minutes'
          ) /
            60 <
          0
        ) {
          entry.hours =
            Math.abs(
              moment(timesheetDTO.endTime, 'HH:mm')
                .add(1, 'days')
                .diff(moment(timesheetDTO.startTime, 'HH:mm'), 'minutes') / 60
            ) - timesheetDTO.breakHours;
        } else {
          entry.hours =
            Math.abs(
              moment(timesheetDTO.endTime, 'HH:mm').diff(
                moment(timesheetDTO.startTime, 'HH:mm'),
                'minutes'
              ) / 60
            ) - timesheetDTO.breakHours;
        }

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
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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

          milestoneEntry.entries.map((entry) => {
            entry.submittedAt = moment().toDate();
            entry.approvedAt = null;
            entry.rejectedAt = null;
          });

          responseEntries.push(milestoneEntry);
        }

        await transactionalEntityManager.save(timesheet);

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
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

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
          let newAttachments = [...milestoneEntriesUpdateDTO.attachments];
          let oldAttachments = await transactionalEntityManager.find(
            Attachment,
            {
              where: { targetId: milestoneEntry.id, targetType: 'PEN' },
            }
          );

          if (oldAttachments.length > 0) {
            oldAttachments.forEach((oldAttachment) => {
              let flag_found = false;

              milestoneEntriesUpdateDTO.attachments.forEach((attachment) => {
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
    // console.log(cStartDate, cEndDate);
    console.log('MILESTONEENTRYID', milestoneEntryPrintDTO.milestoneEntryIds);
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

    let response: Any = [];

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
    return response;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }

  async getMilestoneResources(
    milestoneId: number,
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

    let milestone = await this.manager.findOne(Milestone, {
      relations: relations,
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    let users: any = {
      ids: [],
      details: {},
    };

    if (type == 'Managers' || type == 'A&M') {
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

    if (type == 'Allocations' || type == 'A&M') {
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

    users.ids = [...new Set(users.ids)];
    users.ids.filter(Number);

    console.log('PRINTING USERS', users);
    return users;
  }

  async getAnyTimesheetByMilestone(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    milestoneId: number,
    authId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

    console.log(cStartDate, cEndDate);

    let users = await this.getMilestoneResources(milestoneId, 'Allocations');
    let timesheets = await this.find({
      where: {
        startDate: cStartDate,
        endDate: cEndDate,
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
        user: `${timesheet.employee.contactPersonOrganization.contactPerson.firstName} ${timesheet.employee.contactPersonOrganization.contactPerson.lastName}`,
        milestones: [],
        milestoneStatuses: [],
        timesheetStatus: TimesheetStatus,
      };
      users.ids.splice(users.ids.indexOf(timesheet.employeeId), 1);
      for (let milestoneEntry of timesheet.milestoneEntries) {
        console.log('GOING THROUGH PROJECTS', milestoneEntry.milestoneId);
        if (milestoneEntry.milestoneId == milestoneId) {
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
}
