import { TimesheetDTO } from '../dto';
import { EntityRepository, Repository, MoreThan } from 'typeorm';
import moment from 'moment';
import { Timesheet } from '../entities/timesheet';
import { TimesheetProjectEntry } from '../entities/timesheetProjectEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Attachment } from '../entities/attachment';
import { TimesheetStatus, EntityType } from '../constants/constants';

@EntityRepository(Timesheet)
export class TimesheetRepository extends Repository<Timesheet> {
  async getTimesheet(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format(
      'YYYY-MM-DD HH:mm:ss'
    );
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD HH:mm:ss');

    console.log(cStartDate, cEndDate);
    return this.findOne({
      where: { startDate: cStartDate, endDate: cEndDate, employeeId: userId },
      relations: [
        'projectEntries',
        'projectEntries.project',
        'projectEntries.entries',
      ],
    });
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
          where: { projectId: timesheetDTO.projectId },
        });

        if (!projectEntry) {
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
          for (const file of attachments) {
            let attachmentObj = new Attachment();
            attachmentObj.fileId = file;
            attachmentObj.targetId = projectEntry.id;
            attachmentObj.type = EntityType.PROJECT_ENTRY;
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
}
