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
    userId: number
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
    AuthId: number
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

      let project: Any = {
        projectEntryId: projectEntry.id,
        projectId: projectEntry.projectId,
        project: projectEntry.project.title,
        notes: projectEntry.notes,
      };
      let authHaveThisProject = 0;
      if (
        projectEntry.project.accountDirectorId == AuthId ||
        projectEntry.project.accountManagerId == AuthId ||
        projectEntry.project.opportunityManagerId == AuthId ||
        projectEntry.project.projectManagerId == AuthId
      ) {
        authHaveThisProject = 1;
      }
      console.log({
        gotProject: authHaveThisProject,
        AuthId: AuthId,
        comparingWith: projectEntry.project.accountDirectorId,
      });

      if (authHaveThisProject == 1) {
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
    AuthId: number
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

    if (timesheet.employeeId == AuthId) {
      timesheet.projectEntries.map((projectEntry: TimesheetProjectEntry) => {
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
        let flag_newTimesheet = 0;
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
        entry.hours =
          Math.abs(
            moment(timesheetDTO.startTime, 'HH:mm').diff(
              moment(timesheetDTO.endTime, 'HH:mm'),
              'minutes'
            ) / 60
          ) - timesheetDTO.breakHours;
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
        entry.hours = Math.abs(
          moment(timesheetDTO.startTime, 'HH:mm').diff(
            moment(timesheetDTO.endTime, 'HH:mm'),
            'minutes'
          ) / 60
        );
        entry.projectEntryId = timesheetDTO.projectEntryId;

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

  async approveProjectTimesheetEntry(
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

  async rejectProjectTimesheetEntry(
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
    attachments: []
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

          this.manager.softDelete(Attachment, oldAttachments);
          for (const file of attachments) {
            let attachmentObj = new Attachment();
            attachmentObj.fileId = file;
            attachmentObj.targetId = projectEntry.id;
            attachmentObj.targetType = EntityType.PROJECT_ENTRY;
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
          accountManagerId: userId,
          opportunityManagerId: userId,
          projectManagerId: userId,
        },
        {
          status: 'C',
          accountDirectorId: userId,
          accountManagerId: userId,
          opportunityManagerId: userId,
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
          if (
            allocation.contactPersonId === userId &&
            allocation.isMarkedAsSelected
          ) {
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
          accountManagerId: userId,
          opportunityManagerId: userId,
          projectManagerId: userId,
        },
        {
          status: 'C',
          accountDirectorId: userId,
          accountManagerId: userId,
          opportunityManagerId: userId,
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
          if (
            allocation.contactPersonId === userId &&
            allocation.isMarkedAsSelected
          ) {
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
}
