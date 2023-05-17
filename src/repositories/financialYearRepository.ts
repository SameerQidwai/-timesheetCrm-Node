import {
  Between,
  EntityManager,
  EntityRepository,
  In,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { FinancialYear } from '../entities/financialYear';
import { FinancialYearDTO } from '../dto';
import moment from 'moment';
import { Opportunity } from '../entities/opportunity';
import { LeaveRequest } from '../entities/leaveRequest';
import { LeaveRequestEntry } from '../entities/leaveRequestEntry';
import {
  LeaveRequestStatus,
  TimesheetEntryStatus,
} from '../constants/constants';
import { LeaveRequestBalance } from '../entities/leaveRequestBalance';
import { Timesheet } from '../entities/timesheet';

@EntityRepository(FinancialYear)
export class FinancialYearRepository extends Repository<FinancialYear> {
  async getAllActive(): Promise<any> {
    let years = await this.find({});

    return years;
  }

  async createAndSave(
    financialYearDTO: FinancialYearDTO,
    userId: number
  ): Promise<any> {
    let years = await this.find({
      order: { endDate: 'DESC' },
    });

    let { label } = financialYearDTO;

    const startDate = moment(financialYearDTO.startDate).startOf('day');
    const endDate = moment(financialYearDTO.endDate).endOf('day');

    let lastClosedFinancialYear = await this.findOne({
      order: { endDate: 'DESC' },
      where: { closed: true },
    });

    if (lastClosedFinancialYear) {
      if (moment(lastClosedFinancialYear.endDate).isAfter(startDate, 'date')) {
        throw new Error('Cannot create year before last closed year');
      }
    }

    if (years.length) {
      const lastYear = years[0];
      const firstYear = years[years.length - 1];

      const firstYearStartDate = moment(firstYear.startDate);
      const lastYearEndDate = moment(lastYear.endDate);

      if (
        !startDate.isAfter(lastYearEndDate, 'date') &&
        !endDate.isBefore(firstYearStartDate, 'date')
      ) {
        throw new Error('Years Cannot Overlap');
      }

      if (
        (endDate.isBefore(firstYearStartDate, 'date') &&
          !endDate.isSame(
            firstYearStartDate.subtract(1, 'day').startOf('day'),
            'date'
          )) ||
        (startDate.isAfter(lastYearEndDate, 'date') &&
          !startDate.isSame(lastYearEndDate.add(1, 'day'), 'date'))
      ) {
        throw new Error('Gap is not allowed between Financial Years');
      }
    }

    if (startDate.isSameOrAfter(endDate)) {
      throw new Error('Incorrect date range');
    }

    let year = new FinancialYear();

    year.label = label;
    year.startDate = moment(startDate).toDate();
    year.endDate = moment(endDate).toDate();

    // return 'hi';
    return this.save(year);
  }

  async closeYear(id: number, userId: number, confirm = false): Promise<any> {
    if (!id) throw new Error('Year not found');

    return await this.manager.transaction(
      async (transactionalEntityManager) => {
        let year = await this.findOne(id);

        if (!year) throw new Error('Year not found');

        if (year.closed) throw new Error('Year is already closed');

        let years = await this.find({
          where: { endDate: LessThan(year.startDate) },
        });

        for (let loopYear of years) {
          if (!loopYear.closed) {
            throw new Error('All the previous years are required to be closed');
          }
        }

        if (!confirm) {
          return {
            projects: [],
            leaveRequests: [],
            leaveRequestBalances: [],
            timesheets: [],
            expenseSheets: [],
            contracts: [],
          };
        }

        await this._closeProjects(year, transactionalEntityManager);
        await this._closeLeaveRequests(
          year,
          userId,
          transactionalEntityManager
        );
        await this._closeLeaveRequestBalances(year, transactionalEntityManager);
        await this._closeTimesheets(year, userId, transactionalEntityManager);

        year.closed = true;
        year.closedBy = userId;
        year.closedAt = moment().toDate();

        return transactionalEntityManager.save(year);
      }
    );
  }

  async _closeProjects(year: FinancialYear, trx: EntityManager) {
    //Closing same year projects
    let projects = await this.manager.find(Opportunity, {
      where: { status: In(['P', 'C']) },
    });

    let savingProjects: Opportunity[] = [];

    for (let project of projects) {
      const projectStartDate = moment(project.startDate);
      const projectEndDate = moment(project.endDate);

      if (
        projectStartDate.isBetween(
          year.startDate,
          year.endDate,
          'date',
          '[]'
        ) &&
        projectEndDate.isBetween(year.startDate, year.endDate, 'date', '[]') &&
        project.phase
      ) {
        project.phase = false;
        savingProjects.push(project);
      }
    }

    await trx.save(savingProjects);

    return true;
  }

  async _closeLeaveRequests(
    year: FinancialYear,
    userId: number,
    trx: EntityManager
  ) {
    let loopedLeaveRequests: Array<Number> = [];
    let leaveRequestsIndex: any = {};
    let leaveRequests: Array<LeaveRequest> = [];
    let newLeaveRequests: Array<LeaveRequest> = [];
    let deleteableEntries: Array<LeaveRequestEntry> = [];

    let leaveRequestEntries = await this.manager.find(LeaveRequestEntry, {
      where: { date: MoreThanOrEqual(year.startDate) },
      relations: ['leaveRequest'],
    });

    for (let entry of leaveRequestEntries) {
      let momentEntryDate = moment(entry.date);
      let leaveRequestId = entry.leaveRequestId;
      let leaveRequest: LeaveRequest = entry.leaveRequest;
      delete (entry as any).leaveRequest;
      delete (entry as any).leaveRequestId;
      (leaveRequest as any).inClosedYear = false;
      (leaveRequest as any).inNextYear = false;

      if (loopedLeaveRequests.includes(leaveRequestId)) {
        if (momentEntryDate.isAfter(year.endDate, 'date')) {
          (
            leaveRequests[leaveRequestsIndex[leaveRequestId]] as any
          ).futureEntries.push(entry);
          deleteableEntries.push(entry);
        }

        continue;
      }

      loopedLeaveRequests.push(leaveRequestId);
      leaveRequestsIndex[leaveRequestId] = leaveRequests.length;
      (leaveRequest as any).futureEntries = [];

      if (
        momentEntryDate.isBetween(year.startDate, year.endDate, 'date', '[]')
      ) {
        (leaveRequest as any).inClosedYear = true;
      }

      if (
        momentEntryDate.isAfter(year.endDate, 'date') &&
        (leaveRequest as any).inClosedYear
      ) {
        (leaveRequest as any).inNextYear = true;
        (leaveRequest as any).futureEntries.push(entry);
        deleteableEntries.push(entry);
      }
      leaveRequests.push(leaveRequest);
    }

    for (let leaveRequest of leaveRequests) {
      // let entryDetails = leaveRequest.getEntriesDetails;
      // if (
      //   moment(entryDetails.startDate).isBetween(
      //     year.startDate,
      //     year.endDate,
      //     'date',
      //     '[]'
      //   ) &&
      //   moment(entryDetails.endDate).isAfter(year.endDate, 'date')
      // ) {

      if ((leaveRequest as any).futureEntries.length) {
        let newLeaveRequest = JSON.parse(
          JSON.stringify(leaveRequests[leaveRequestsIndex[leaveRequest.id]])
        );
        delete (newLeaveRequest as any).id;
        newLeaveRequest.entries = (newLeaveRequest as any).futureEntries;
        delete (newLeaveRequest as any).futureEntries;
        newLeaveRequests.push(newLeaveRequest);
      }

      if (
        leaveRequest.getStatus == LeaveRequestStatus.SUBMITTED &&
        (leaveRequest as any).inClosedYear
      ) {
        console.log(' I CAME IN ', leaveRequest.id);
        leaveRequest.rejectedAt = moment().toDate();
        leaveRequest.rejectedBy = userId;
      }
    }
    // console.log({
    // newLeaveRequests,
    // deleteableEntries,
    // leaveRequests,
    // });

    await trx.remove(LeaveRequestEntry, deleteableEntries);

    await trx.save(LeaveRequest, newLeaveRequests);

    await trx.save(LeaveRequest, leaveRequests);

    return true;
  }

  async _closeLeaveRequestBalances(year: FinancialYear, trx: EntityManager) {
    const leaveRequestBalances = await this.manager.find(LeaveRequestBalance);
    let newLeaveRequestBalances: Array<LeaveRequestBalance> = [];
    for (let leaveRequestBalance of leaveRequestBalances) {
      leaveRequestBalance.carryForward = leaveRequestBalance.balanceHours;
      leaveRequestBalance.used = 0;
      newLeaveRequestBalances.push(leaveRequestBalance);
    }

    await trx.save(newLeaveRequestBalances);
    return true;
  }

  async _closeTimesheets(
    year: FinancialYear,
    userId: number,
    trx: EntityManager
  ) {
    let timesheets = await this.manager.find(Timesheet, {
      where: {
        startDate: Between(year.startDate, year.endDate),
        endDate: Between(year.startDate, year.endDate),
      },
      relations: ['milestoneEntries', 'milestoneEntries.entries'],
    });

    timesheets.forEach((timesheet) => {
      timesheet.milestoneEntries.forEach((milestoneEntry) => {
        milestoneEntry.actionNotes = 'Rejected because of Year closing';
        milestoneEntry.entries.forEach((entry) => {
          if (
            entry.getStatus === TimesheetEntryStatus.SAVED ||
            entry.getStatus === TimesheetEntryStatus.SUBMITTED
          ) {
            entry.rejectedAt = moment().toDate();
            entry.rejectedBy = userId;
            entry.notes = 'Rejected because of Year closing';
          }
        });
      });
    });

    await trx.save(timesheets);

    return true;
  }
}
