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
import { Milestone } from '../entities/milestone';
import { GlobalSetting } from '../entities/globalSetting';
import { ProjectType } from '../constants/constants';

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

    return await this.manager.transaction(async (trx) => {
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

      if (confirm) {
        let systemLock = await this.manager.findOne(GlobalSetting, {
          where: { keyLabel: 'systemLock' },
        });

        if (!systemLock) {
          throw new Error('Something went wrong');
        }

        systemLock.keyValue = '1';

        await trx.save(systemLock);
      }

      const { projects, milestones } = await this._closeProjectsAndMilestones(
        year,
        trx,
        confirm
      );
      const leaveRequests = await this._closeLeaveRequests(
        year,
        userId,
        trx,
        confirm
      );

      await this._closeLeaveRequestBalances(trx, confirm);
      const timesheets = await this._closeTimesheets(
        year,
        userId,
        trx,
        confirm
      );

      if (confirm) {
        year.closed = true;
        year.closedBy = userId;
        year.closedAt = moment().toDate();

        return trx.save(year);
      }

      return {
        projects,
        milestones,
        leaveRequests,
        leaveRequestBalances:
          'All the balances will be shifted to carry forward',
        timesheets,
        expenseSheets: [],
        contracts: [],
      };
    });
  }

  async _closeProjectsAndMilestones(
    year: FinancialYear,
    trx: EntityManager,
    confirm = false
  ) {
    //Closing same year projects
    let projects = await this.manager.find(Opportunity, {
      where: { status: In(['P', 'C']) },
      relations: ['milestones'],
    });

    let effectedProjects: Opportunity[] = [];
    let effectedMilestones: Milestone[] = [];
    let responseProjects: any[] = [];
    let responseMilestones: any[] = [];

    for (let project of projects) {
      if (!project.phase) continue;

      const projectStartDate = moment(project.startDate);
      const projectEndDate = moment(project.endDate);

      if (project.type === ProjectType.MILESTONE_BASE)
        for (let milestone of project.milestones) {
          const milestoneStartDate = moment(milestone.startDate);
          const milestoneEndDate = moment(milestone.endDate);

          if (milestone.closed) continue;

          if (
            milestoneStartDate.isBetween(
              year.startDate,
              year.endDate,
              'date',
              '[]'
            ) &&
            milestoneEndDate.isBetween(
              year.startDate,
              year.endDate,
              'date',
              '[]'
            )
          ) {
            responseMilestones.push({
              id: milestone.id,
              title: milestone.title,
              startDate: milestoneStartDate.format('DD-MM-YYYY'),
              endDate: milestoneEndDate.format('DD-MM-YYYY'),
              content: '',
            });

            milestone.closed = true;
            effectedMilestones.push(milestone);
          }
        }

      if (
        projectStartDate.isBetween(
          year.startDate,
          year.endDate,
          'date',
          '[]'
        ) &&
        projectEndDate.isBetween(year.startDate, year.endDate, 'date', '[]')
      ) {
        responseProjects.push({
          id: project.id,
          title: project.title,
          startDate: projectStartDate.format('DD-MM-YYYY'),
          endDate: projectEndDate.format('DD-MM-YYYY'),
          content: '',
        });

        project.phase = false;
        effectedProjects.push(project);
      }
    }

    if (confirm) {
      await trx.save(effectedProjects);
      await trx.save(effectedMilestones);
    }

    return {
      projects: responseProjects,
      milestones: responseMilestones,
    };
  }

  async _closeLeaveRequests(
    year: FinancialYear,
    userId: number,
    trx: EntityManager,
    confirm = false
  ) {
    let loopedLeaveRequests: Array<Number> = [];
    let leaveRequestsIndex: any = {};
    let leaveRequests: Array<LeaveRequest> = [];
    let newLeaveRequests: Array<LeaveRequest> = [];
    let deleteableEntries: Array<LeaveRequestEntry> = [];

    let responseLeaveRequests: any[] = [];

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
        responseLeaveRequests.push({
          id: leaveRequest.id,
          type: leaveRequest.type,
          submittedBy: leaveRequest.submittedBy,
          submittedAt: leaveRequest.submittedAt,
          split: true,
          content: '',
        });
        newLeaveRequests.push(newLeaveRequest);
      }

      if (
        leaveRequest.getStatus == LeaveRequestStatus.SUBMITTED &&
        (leaveRequest as any).inClosedYear
      ) {
        leaveRequest.rejectedAt = moment().toDate();
        leaveRequest.rejectedBy = userId;
        responseLeaveRequests.push({
          id: leaveRequest.id,
          type: leaveRequest.type,
          submittedBy: leaveRequest.submittedBy,
          submittedAt: leaveRequest.submittedAt,
          split: false,
          content: '',
        });
      }
    }
    // console.log({
    // newLeaveRequests,
    // deleteableEntries,
    // leaveRequests,
    // });

    if (confirm) {
      await trx.remove(LeaveRequestEntry, deleteableEntries);

      await trx.save(LeaveRequest, newLeaveRequests);

      await trx.save(LeaveRequest, leaveRequests);
    }

    return responseLeaveRequests;
  }

  async _closeLeaveRequestBalances(trx: EntityManager, confirm = false) {
    const leaveRequestBalances = await this.manager.find(LeaveRequestBalance);
    let newLeaveRequestBalances: Array<LeaveRequestBalance> = [];
    for (let leaveRequestBalance of leaveRequestBalances) {
      leaveRequestBalance.carryForward = leaveRequestBalance.balanceHours;
      leaveRequestBalance.used = 0;
      newLeaveRequestBalances.push(leaveRequestBalance);
    }

    if (confirm) {
      await trx.save(newLeaveRequestBalances);
    }

    return true;
  }

  async _closeTimesheets(
    year: FinancialYear,
    userId: number,
    trx: EntityManager,
    confirm = false
  ) {
    let timesheets = await this.manager.find(Timesheet, {
      where: {
        startDate: Between(year.startDate, year.endDate),
        endDate: Between(year.startDate, year.endDate),
      },
      relations: ['milestoneEntries', 'milestoneEntries.entries'],
    });

    let responseTimesheets: any[] = [];

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

      responseTimesheets.push({
        id: timesheet.id,
        startDate: timesheet.startDate,
        endDate: timesheet.endDate,
        employee: timesheet.employeeId,
        content: '',
      });
    });

    if (confirm) {
      await trx.save(timesheets);
    }

    return responseTimesheets;
  }
}
