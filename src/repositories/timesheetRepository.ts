import { TimesheetDTO } from '../dto';
import { EntityRepository, Repository, MoreThan } from 'typeorm';
import { Timesheet } from '../entities/timesheet';
import moment from 'moment';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { TimesheetStatus } from '../constants/constants';

@EntityRepository(Timesheet)
export class TimesheetRepository extends Repository<Timesheet> {
  async getTimesheet(
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
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
    startDate: string = moment().startOf('month').format('DD-MM-YYYY'),
    endDate: string = moment().endOf('month').format('DD-MM-YYYY'),
    userId: number,
    timesheetDTO: TimesheetDTO
  ): Promise<any | undefined> {
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let timesheet = this.findOne({
      where: { startDate: cStartDate, endDate: cEndDate, employeeId: userId },
    });

    if (!timesheet) {
      throw new Error('Timesheet not found!');
    }

    // console.log(timesheetDTO);
    let entry = await this.manager.transaction(
      async (transactionalEntityManager) => {
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
        entry.hours = Math.abs(
          moment(timesheetDTO.startTime, 'HH:mm').diff(
            moment(timesheetDTO.endTime, 'HH:mm'),
            'minutes'
          ) / 60
        );
        entry.notes = timesheetDTO.notes;
        entry.projectEntryId = timesheetDTO.projectEntryId;
        entry = await transactionalEntityManager.save(entry);

        return entry;
      }
    );

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
        entry.notes = timesheetDTO.notes;
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
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');

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
        });

        timesheet.status = TimesheetStatus.SUBMITTED;

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
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');

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
    let cStartDate = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let cEndDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');

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
}
