import { TimesheetDTO } from '../dto';
import { EntityRepository, Repository, MoreThan } from 'typeorm';
import moment from 'moment';
import { Timesheet } from '../entities/timesheet';
import { TimesheetProjectEntry } from '../entities/timesheetProjectEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Attachment } from '../entities/attachment';
import { TimesheetStatus, EntityType } from '../constants/constants';
import { Employee } from '../entities/employee';
import { Opportunity } from '../entities/opportunity';

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
        'projectEntries',
        'projectEntries.project',
        'projectEntries.entries',
      ],
    });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    let projects: any = [];
    let projectStatuses: any = [];

    interface Any {
      [key: string]: any;
    }

    timesheet.projectEntries.map((projectEntry: TimesheetProjectEntry) => {
      let status: TimesheetStatus = TimesheetStatus.SAVED;

      let authHaveThisProject = false;
      if (
        projectEntry.project.accountDirectorId == authId ||
        projectEntry.project.accountManagerId == authId ||
        projectEntry.project.projectManagerId == authId
      ) {
        authHaveThisProject = true;
      }

      projectEntry.project.accountDirectorId;

      let project: Any = {
        projectEntryId: projectEntry.id,
        projectId: projectEntry.projectId,
        project: projectEntry.project.title,
        isManaged: authHaveThisProject,
        notes: projectEntry.notes,
        totalHours: 0,
      };

      projectEntry.entries.map((entry: TimesheetEntry) => {
        project.totalHours += entry.hours;
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
      id: timesheet.id,
      status: timesheetStatus,
      notes: timesheet.notes,
      projects: projects,
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
        'projectEntries',
        'projectEntries.project',
        'projectEntries.entries',
      ],
    });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    let projects: any = [];
    let projectStatuses: any = [];

    interface Any {
      [key: string]: any;
    }

    timesheet.projectEntries.map((projectEntry: TimesheetProjectEntry) => {
      let status: TimesheetStatus = TimesheetStatus.SAVED;

      let authHaveThisProject = false;
      if (
        projectEntry.project.accountDirectorId == authId ||
        projectEntry.project.accountManagerId == authId ||
        projectEntry.project.projectManagerId == authId
      ) {
        authHaveThisProject = true;
      }

      let project: Any = {
        projectEntryId: projectEntry.id,
        projectId: projectEntry.projectId,
        project: projectEntry.project.title,
        isManaged: authHaveThisProject,
        notes: projectEntry.notes,
        totalHours: 0,
      };

      console.log({
        gotProject: authHaveThisProject,
        authId: authId,
        comparingWith: projectEntry.project.accountDirectorId,
      });

      if (authHaveThisProject) {
        projectEntry.entries.map((entry: TimesheetEntry) => {
          project.totalHours += entry.hours;
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
          else if (entry.submittedAt !== null)
            status = TimesheetStatus.SUBMITTED;
        });

        project.status = status;
        projectStatuses.push(status);

        projects.push(project);
      }
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
      id: timesheet.id,
      status: timesheetStatus,
      notes: timesheet.notes,
      projects: projects,
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
        'projectEntries',
        'projectEntries.project',
        'projectEntries.entries',
      ],
    });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    let projects: any = [];
    let projectStatuses: any = [];

    interface Any {
      [key: string]: any;
    }

    if (timesheet.employeeId == authId) {
      timesheet.projectEntries.map((projectEntry: TimesheetProjectEntry) => {
        let status: TimesheetStatus = TimesheetStatus.SAVED;

        let authHaveThisProject = false;
        if (
          projectEntry.project.accountDirectorId == authId ||
          projectEntry.project.accountManagerId == authId ||
          projectEntry.project.projectManagerId == authId
        ) {
          authHaveThisProject = true;
        }

        let project: Any = {
          projectEntryId: projectEntry.id,
          projectId: projectEntry.projectId,
          project: projectEntry.project.title,
          isManaged: authHaveThisProject,
          notes: projectEntry.notes,
          totalHours: 0,
        };

        projectEntry.entries.map((entry: TimesheetEntry) => {
          project.totalHours += entry.hours;
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
          else if (entry.submittedAt !== null)
            status = TimesheetStatus.SUBMITTED;
        });

        project.status = status;
        projectStatuses.push(status);

        projects.push(project);
      });
    }

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
      id: timesheet.id,
      status: timesheetStatus,
      notes: timesheet.notes,
      projects: projects,
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
        let projectEntry: TimesheetProjectEntry | undefined;

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

        projectEntry = await this.manager.findOne(TimesheetProjectEntry, {
          where: {
            projectId: timesheetDTO.projectId,
            timesheetId: timesheet.id,
          },
        });

        if (!projectEntry) {
          console.log(' I RANN');
          projectEntry = new TimesheetProjectEntry();

          projectEntry.timesheetId = timesheet.id;
          projectEntry.projectId = timesheetDTO.projectId;

          projectEntry = await transactionalEntityManager.save(projectEntry);
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

        entry.projectEntryId = projectEntry.id;
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

        entry.projectEntryId = timesheetDTO.projectEntryId;
        entry.notes = timesheetDTO.notes;

        entry = await transactionalEntityManager.save(entry);

        return entry;
      }
    );

    return entry;
  }

  async submitProjectTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    projectEntryId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

    let projectEntry = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
          relations: [
            'projectEntries',
            'projectEntries.project',
            'projectEntries.entries',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let projectEntry = timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        )[0];

        if (!projectEntry) {
          throw new Error('Entry not found!');
        }

        projectEntry.entries.map((entry) => {
          entry.submittedAt = moment().toDate();
          entry.approvedAt = null;
          entry.rejectedAt = null;
        });

        await transactionalEntityManager.save(timesheet);

        return timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        );
      }
    );

    return projectEntry;
    // projectEntry.entries.map(entry => entry.submittedAt = )
  }

  async approveAnyProjectTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    projectEntryId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

    let projectEntry = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
          relations: [
            'projectEntries',
            'projectEntries.project',
            'projectEntries.entries',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let projectEntry = timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        )[0];

        if (!projectEntry) {
          throw new Error('Entry not found!');
        }

        projectEntry.entries.map((entry) => {
          entry.approvedAt = moment().toDate();
        });

        await transactionalEntityManager.save(timesheet);

        return timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        );
      }
    );

    return projectEntry;
    // projectEntry.entries.map(entry => entry.submittedAt = )
  }

  async approveManageProjectTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    projectEntryId: number,
    authId: number
  ): Promise<any | undefined> {
    let flagUserIsAllowed = 0;
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

    let projectEntry = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
          relations: [
            'projectEntries',
            'projectEntries.project',
            'projectEntries.entries',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let projectEntry = timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        )[0];

        if (!projectEntry) {
          throw new Error('Entry not found!');
        }

        let users: [] = await this.getManageProjectUsers(authId);

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

        projectEntry.entries.map((entry) => {
          entry.approvedAt = moment().toDate();
        });

        await transactionalEntityManager.save(timesheet);

        return timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        );
      }
    );

    return projectEntry;
    // projectEntry.entries.map(entry => entry.submittedAt = )
  }

  async rejectAnyProjectTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    projectEntryId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

    let projectEntry = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
          relations: [
            'projectEntries',
            'projectEntries.project',
            'projectEntries.entries',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let projectEntry = timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        )[0];

        if (!projectEntry) {
          throw new Error('Entry not found!');
        }

        projectEntry.entries.map((entry) => {
          entry.rejectedAt = moment().toDate();
        });

        await transactionalEntityManager.save(timesheet);

        return timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        );
      }
    );

    return projectEntry;
    // projectEntry.entries.map(entry => entry.submittedAt = )
  }

  async rejectManageProjectTimesheetEntry(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    projectEntryId: number,
    authId: number
  ): Promise<any | undefined> {
    let flagUserIsAllowed = 0;
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

    let projectEntry = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let timesheet = await this.findOne({
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
          relations: [
            'projectEntries',
            'projectEntries.project',
            'projectEntries.entries',
          ],
        });

        if (!timesheet) {
          throw new Error('Timesheet not found!');
        }

        let projectEntry = timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        )[0];

        if (!projectEntry) {
          throw new Error('Entry not found!');
        }

        let users: [] = await this.getManageProjectUsers(authId);

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

        projectEntry.entries.map((entry) => {
          entry.rejectedAt = moment().toDate();
        });

        await transactionalEntityManager.save(timesheet);

        return timesheet.projectEntries.filter(
          (entry) => entry.id === projectEntryId
        );
      }
    );

    return projectEntry;
    // projectEntry.entries.map(entry => entry.submittedAt = )
  }

  async deleteTimesheetEntry(entryId: number): Promise<any | undefined> {
    // console.log(timesheetDTO);
    let entry: TimesheetEntry | undefined;
    entry = await this.manager.findOne(TimesheetEntry, entryId);
    if (!entry) {
      throw new Error('Entry not found');
    }

    return await this.manager.delete(TimesheetEntry, entry.id);
  }

  async updateTimesheetProjectEntryNote(
    projectEntryId: number,
    notes: string,
    attachments: [],
    userId: number
  ): Promise<any | undefined> {
    let entry = await this.manager.transaction(
      async (transactionalEntityManager) => {
        let projectEntry: TimesheetProjectEntry | undefined;
        projectEntry = await this.manager.findOne(
          TimesheetProjectEntry,
          projectEntryId
        );

        if (!projectEntry) {
          throw new Error('Project Entry not found');
        }
        projectEntry.notes = notes;

        projectEntry = await transactionalEntityManager.save(projectEntry);

        if (attachments) {
          let oldAttachments = await this.manager.find(Attachment, {
            select: ['id'],
            where: { targetId: projectEntry.id, targetType: 'PEN' },
          });

          if (oldAttachments.length > 0)
            await this.manager.softDelete(Attachment, oldAttachments);

          for (const file of attachments) {
            let attachmentObj = new Attachment();
            attachmentObj.fileId = file;
            attachmentObj.targetId = projectEntry.id;
            attachmentObj.targetType = EntityType.PROJECT_ENTRY;
            attachmentObj.userId = userId;
            let attachment = await transactionalEntityManager.save(
              attachmentObj
            );
          }
        }

        return projectEntry;
      }
    );

    return entry;
  }

  async getAnyProjectUsers(): Promise<any | undefined> {
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

  async getManageAndOwnProjectUsers(
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

  async getManageProjectUsers(userId: number): Promise<any | undefined> {
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

  async getOwnProjectUsers(
    userId: number,
    userName: string
  ): Promise<any | undefined> {
    let users: any = [];

    users.push({ label: userName, value: userId });
    return users;
  }

  async getTimesheetPDF(projectEntryId: number): Promise<any | undefined> {
    // console.log(cStartDate, cEndDate);
    let projectEntry = await this.manager.findOne(
      TimesheetProjectEntry,
      projectEntryId,
      {
        relations: [
          'timesheet',
          'timesheet.employee',
          'timesheet.employee.contactPersonOrganization',
          'timesheet.employee.contactPersonOrganization.organization',
          'timesheet.employee.contactPersonOrganization.contactPerson',
          'project',
          'project.organization',
          'project.organization.delegateContactPerson',
          'entries',
        ],
      }
    );

    if (!projectEntry) {
      throw new Error('Project Entry not found');
    }

    //-- START OF MODIFIED RESPSONSE FOR FRONTEND

    interface Any {
      [key: string]: any;
    }

    let startDate = moment(projectEntry.timesheet.startDate, 'DD-MM-YYYY');
    let cStartDate = moment(
      projectEntry.timesheet.startDate,
      'DD-MM-YYYY'
    ).format('DD/MM/YYYY');
    let cEndDate = moment(projectEntry.timesheet.endDate, 'DD-MM-YYYY').format(
      'DD/MM/YYYY'
    );

    let cMonthDays = moment(
      projectEntry.timesheet.startDate,
      'DD-MM-YYYY'
    ).daysInMonth();

    console.log(cMonthDays);

    let project: Any = {
      projectEntryId: projectEntry.id,
      projectId: projectEntry.projectId,
      name: projectEntry.project.title,
      client: projectEntry.project.organization.name,
      contact:
        `${projectEntry.project.organization.delegateContactPerson?.firstName} ${projectEntry.project.organization.delegateContactPerson?.lastName}` ??
        '-',
      notes: projectEntry.notes,
      totalHours: 0,
      invoicedDays: projectEntry.entries.length,
      entries: [],
    };

    for (let i = 1; i <= cMonthDays; i++) {
      let _flagFound = 0;
      let _foundEntry: TimesheetEntry | undefined;
      projectEntry.entries.map((entry: TimesheetEntry) => {
        if (parseInt(entry.date.substring(0, 2)) == i) {
          _flagFound = 1;
          _foundEntry = entry;
        }
      });
      if (_flagFound == 1 && _foundEntry != undefined) {
        project.totalHours += _foundEntry.hours;
        project.entries.push({
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
        project.totalHours += 0;
        project.entries.push({
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

    let response = {
      id: projectEntry.id,
      company:
        projectEntry.timesheet.employee.contactPersonOrganization.organization
          .name,
      employee: `${projectEntry.timesheet.employee.contactPersonOrganization.contactPerson.firstName} ${projectEntry.timesheet.employee.contactPersonOrganization.contactPerson.lastName}`,
      period: `${cStartDate} - ${cEndDate}`,
      notes: projectEntry.timesheet.notes,
      project: project,
    };

    return response;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }

  async getAnyTimesheetByProject(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    projectId: number,
    authId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

    console.log(cStartDate, cEndDate);
    let timesheets = await this.find({
      where: { startDate: cStartDate, endDate: cEndDate },
      relations: [
        'employee',
        'employee.contactPersonOrganization',
        'employee.contactPersonOrganization.contactPerson',
        'projectEntries',
        'projectEntries.project',
        'projectEntries.entries',
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

    timesheets.forEach((timesheet) => {
      let resTimesheet: any = {
        user: timesheet.employee.contactPersonOrganization.contactPerson
          .firstName,
        projects: [],
        projectStatuses: [],
        timesheetStatus: TimesheetStatus,
      };
      timesheet.projectEntries.map((projectEntry: TimesheetProjectEntry) => {
        console.log('GOING THROUGH PROJECTS', projectEntry.projectId);
        if (projectEntry.projectId == projectId) {
          let status: TimesheetStatus = TimesheetStatus.SAVED;

          let authHaveThisProject = false;
          if (
            projectEntry.project.accountDirectorId == authId ||
            projectEntry.project.accountManagerId == authId ||
            projectEntry.project.projectManagerId == authId
          ) {
            authHaveThisProject = true;
          }

          projectEntry.project.accountDirectorId;

          let project: Any = {
            projectEntryId: projectEntry.id,
            projectId: projectEntry.projectId,
            project: projectEntry.project.title,
            isManaged: authHaveThisProject,
            notes: projectEntry.notes,
            totalHours: 0,
          };

          projectEntry.entries.map((entry: TimesheetEntry) => {
            project.totalHours += entry.hours;
            project[moment(entry.date, 'DD-MM-YYYY').format('D/M')] = {
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

          project.status = status;
          resTimesheet.projectStatuses.push(status);
          resTimesheet.projects.push(project);
        }
      });

      resTimesheet.timesheetStatus = resTimesheet.projectStatuses.includes(
        TimesheetStatus.REJECTED
      )
        ? TimesheetStatus.REJECTED
        : resTimesheet.projectStatuses.includes(TimesheetStatus.SAVED)
        ? TimesheetStatus.SAVED
        : resTimesheet.projectStatuses.includes(TimesheetStatus.SUBMITTED)
        ? TimesheetStatus.SUBMITTED
        : resTimesheet.projectStatuses.includes(TimesheetStatus.APPROVED)
        ? TimesheetStatus.APPROVED
        : TimesheetStatus.SAVED;

      resTimesheets.push(resTimesheet);
    });

    let response = {
      timesheets: resTimesheets,
    };

    return response;

    //-- END OF MODIFIED RESPONSE FOR FRONTEND
  }
}
