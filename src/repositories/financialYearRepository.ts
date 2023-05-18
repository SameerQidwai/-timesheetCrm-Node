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
  ExpenseSheetStatus,
  LeaveRequestStatus,
  TimesheetEntryStatus,
  TimesheetStatus,
} from '../constants/constants';
import { LeaveRequestBalance } from '../entities/leaveRequestBalance';
import { Timesheet } from '../entities/timesheet';
import { Milestone } from '../entities/milestone';
import { GlobalSetting } from '../entities/globalSetting';
import { ProjectType } from '../constants/constants';
import { Expense } from '../entities/expense';
import { ExpenseSheet } from '../entities/expenseSheet';
import { EmploymentContract } from '../entities/employmentContract';
import { Employee } from '../entities/employee';
import { parseGlobalSetting } from '../utilities/helpers';

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

  async closeYear(
    id: number,
    userId: number,
    confirmFlag = false
  ): Promise<any> {
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

      let forceStatusChangeFlag = false;

      let GLOBAL_PROJECTS = await this.manager.find(Opportunity, {
        where: { status: In(['P', 'C']) },
        relations: ['milestones'],
      });

      let GLOBAL_EMPLOYEES = await this.manager.find(Employee, {
        relations: [
          'contactPersonOrganization',
          'contactPersonOrganization.contactPerson',
        ],
      });

      let PROJECT_PICKER: any = {};
      let MILESTONE_PICKER: any = {};
      let EMPLOYEE_PICKER: any = {};
      let CONTACTPERSON_PICKER: any = {};

      for (let project of GLOBAL_PROJECTS) {
        for (let milestone of project.milestones) {
          MILESTONE_PICKER[milestone.id] = {
            id: milestone.id,
            title: milestone.title,
            projectId: milestone.projectId,
            projectName: project.title,
            projectType: project.type,
          };
        }

        PROJECT_PICKER[project.id] = {
          id: project.id,
          title: project.title,
          type: project.type,
        };
      }

      for (let employee of GLOBAL_EMPLOYEES) {
        const contactPerson = employee.contactPersonOrganization.contactPerson;

        EMPLOYEE_PICKER[employee.id] = {
          id: employee.id,
          name: employee.getFullName,
        };

        CONTACTPERSON_PICKER[contactPerson.id] = {
          id: contactPerson.id,
          name: contactPerson.getFullName,
        };
      }

      let PICKERS = {
        PROJECT_PICKER,
        MILESTONE_PICKER,
        EMPLOYEE_PICKER,
        CONTACTPERSON_PICKER,
      };

      if (confirmFlag) {
        var systemLock = await this.manager.findOne(GlobalSetting, {
          where: { keyLabel: 'systemLock' },
        });

        if (!systemLock) {
          throw new Error('Something went wrong');
        }

        systemLock.keyValue = '1';

        await trx.save(systemLock);
      }

      var forceStatusChange = await this.manager.findOne(GlobalSetting, {
        where: { keyLabel: 'forceStatusChange' },
      });

      if (forceStatusChange) {
        parseGlobalSetting(forceStatusChange)
          ? (forceStatusChangeFlag = true)
          : (forceStatusChangeFlag = false);
      }

      const { projects, milestones } = await this._closeProjectsAndMilestones(
        year,
        trx,
        confirmFlag
      );

      const leaveRequests = await this._closeLeaveRequests(
        year,
        userId,
        trx,
        confirmFlag,
        PICKERS,
        forceStatusChangeFlag
      );

      await this._closeLeaveRequestBalances(trx, confirmFlag);

      const timesheets = await this._closeTimesheets(
        year,
        userId,
        trx,
        confirmFlag,
        PICKERS,
        forceStatusChangeFlag
      );

      const expenseSheets = await this._closeExpenseSheets(
        year,
        userId,
        trx,
        confirmFlag,
        PICKERS,
        forceStatusChangeFlag
      );

      const contracts = await this._closeEmploymentContracts(year, PICKERS);

      if (confirmFlag) {
        year.closed = true;
        year.closedBy = userId;
        year.closedAt = moment().toDate();

        if (!systemLock) {
          throw new Error('Something went wrong');
        }

        systemLock.keyValue = '0';

        await trx.save(systemLock);

        return trx.save(year);
      }

      return {
        projects,
        milestones,
        leaveRequests,
        leaveRequestBalances:
          'All the balances will be shifted to carry forward',
        timesheets,
        expenseSheets,
        contracts,
      };
    });
  }

  async _closeProjectsAndMilestones(
    year: FinancialYear,
    trx: EntityManager,
    confirmFlag = false
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
            });

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
        });

        project.phase = false;
        effectedProjects.push(project);
      }
    }

    if (confirmFlag) {
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
    confirmFlag = false,
    { EMPLOYEE_PICKER, PROJECT_PICKER }: any,
    forceStatusChangeFlag: Boolean
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
          // startDate: leaveRequest.id,
          // endDate: leaveRequest.id,
          typeId: leaveRequest.typeId,
          employeeId: leaveRequest.employeeId,
          employeeName: EMPLOYEE_PICKER[leaveRequest.employeeId].name,
          projectId: leaveRequest.workId ?? null,
          projectName: leaveRequest.workId
            ? PROJECT_PICKER[leaveRequest.workId].title
            : '',
          split: true,
          status: leaveRequest.getStatus,
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
          // startDate: leaveRequest.id,
          // endDate: leaveRequest.id,
          typeId: leaveRequest.typeId,
          employeeId: leaveRequest.employeeId,
          employeeName: EMPLOYEE_PICKER[leaveRequest.employeeId].name,
          projectId: leaveRequest.workId ?? null,
          projectName: leaveRequest.workId
            ? PROJECT_PICKER[leaveRequest.workId].title
            : '-',
          split: false,
          status: leaveRequest.getStatus,
        });
      }
    }
    // console.log({
    // newLeaveRequests,
    // deleteableEntries,
    // leaveRequests,
    // });

    if (confirmFlag) {
      if (forceStatusChangeFlag) {
        await trx.save(LeaveRequest, leaveRequests);
      }

      await trx.remove(LeaveRequestEntry, deleteableEntries);
      await trx.save(LeaveRequest, newLeaveRequests);
    }

    return responseLeaveRequests;
  }

  async _closeLeaveRequestBalances(trx: EntityManager, confirmFlag = false) {
    const leaveRequestBalances = await this.manager.find(LeaveRequestBalance);
    let newLeaveRequestBalances: Array<LeaveRequestBalance> = [];
    for (let leaveRequestBalance of leaveRequestBalances) {
      leaveRequestBalance.carryForward = leaveRequestBalance.balanceHours;
      leaveRequestBalance.used = 0;
      newLeaveRequestBalances.push(leaveRequestBalance);
    }

    if (confirmFlag) {
      await trx.save(newLeaveRequestBalances);
    }

    return true;
  }

  async _closeTimesheets(
    year: FinancialYear,
    userId: number,
    trx: EntityManager,
    confirmFlag = false,
    { MILESTONE_PICKER, EMPLOYEE_PICKER }: any,
    forceStatusChangeFlag: Boolean
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
      const timesheetStatus = timesheet.getStatus;

      timesheet.milestoneEntries.forEach((milestoneEntry) => {
        responseTimesheets.push({
          id: milestoneEntry.id,
          startDate: timesheet.startDate,
          endDate: timesheet.endDate,
          employeeId: timesheet.employeeId,
          employeeName: EMPLOYEE_PICKER[timesheet.employeeId].name,
          projectId: MILESTONE_PICKER[milestoneEntry.milestoneId].projectId,
          projectName: MILESTONE_PICKER[milestoneEntry.milestoneId].projectName,
          projectType: MILESTONE_PICKER[milestoneEntry.milestoneId].projectType,
          milestoneId: milestoneEntry.milestoneId,
          milestoneName: MILESTONE_PICKER[milestoneEntry.milestoneId].title,
          status: timesheetStatus,
        });

        milestoneEntry.actionNotes =
          'Systematically Rejected because of Year closing';
        if (confirmFlag)
          milestoneEntry.entries.forEach((entry) => {
            if (
              entry.getStatus === TimesheetEntryStatus.SAVED ||
              entry.getStatus === TimesheetEntryStatus.SUBMITTED
            ) {
              entry.rejectedAt = moment().toDate();
              entry.rejectedBy = userId;
              entry.notes = 'Systematically Rejected because of Year closing';
            }
          });
      });
    });

    if (confirmFlag && forceStatusChangeFlag) {
      await trx.save(timesheets);
    }

    return responseTimesheets;
  }

  async _closeExpenseSheets(
    year: FinancialYear,
    userId: number,
    trx: EntityManager,
    confirmFlag = false,
    { EMPLOYEE_PICKER, PROJECT_PICKER }: any,
    forceStatusChangeFlag: Boolean
  ) {
    let expenses = await this.manager.find(Expense, {
      where: {
        date: Between(year.startDate, year.endDate),
      },
      relations: ['entries'],
    });

    let expenseSheets = await this.manager.find(ExpenseSheet);
    let savingExpenses: Expense[] = [];

    let EXPENSESHEET_PICKER: { [key: number]: ExpenseSheet } = {};

    for (let expenseSheet of expenseSheets) {
      EXPENSESHEET_PICKER[expenseSheet.id] = expenseSheet;
    }

    let loopedExpenseSheets: number[] = [];

    let responseExpenseSheets: any[] = [];

    for (let expense of expenses) {
      const expenseLastEntry = expense.entries[expense.entries.length - 1];
      const currentExpenseSheet =
        EXPENSESHEET_PICKER[
          expense?.expenseSheetId ?? expenseLastEntry.sheetId
        ];

      if (loopedExpenseSheets.includes(currentExpenseSheet.id)) continue;

      loopedExpenseSheets.push(currentExpenseSheet.id);

      responseExpenseSheets.push({
        id: currentExpenseSheet.id,
        employeeId: currentExpenseSheet.createdBy,
        employeeName: EMPLOYEE_PICKER[currentExpenseSheet.createdBy].name,
        projectId: PROJECT_PICKER[currentExpenseSheet.projectId].id ?? null,
        projectName:
          PROJECT_PICKER[currentExpenseSheet.projectId].title ?? null,
        submittedAt: expense.submittedAt,
        status: 'Not Defined',
      });

      if (!expense.rejectedAt && !expense.approvedAt) {
        expense.rejectedAt = moment().toDate();
        expense.rejectedBy = userId;
        expense.notes = 'Systematically Rejected because of Year closing';
      }

      savingExpenses.push(expense);
    }

    if (confirmFlag && forceStatusChangeFlag) {
      await trx.save(savingExpenses);
    }

    return responseExpenseSheets;
  }

  async _closeEmploymentContracts(
    year: FinancialYear,
    { EMPLOYEE_PICKER }: any
  ) {
    let responseContracts: any = [];

    let contracts = await this.manager.find(EmploymentContract, {
      where: { startDate: Between(year.startDate, year.endDate) },
    });

    for (let contract of contracts) {
      let contractStartDate = moment(contract.startDate);
      let contractEndDate = moment(contract.endDate);

      let across = false;

      if (contractEndDate.isAfter(year.endDate)) {
        across = true;
      }

      responseContracts.push({
        id: contract.id,
        startDate: contract.startDate,
        endDate: contract.endDate,
        employeeId: contract.employeeId,
        employeeName: EMPLOYEE_PICKER[contract.employeeId].name,
        across,
      });
    }

    return responseContracts;
  }
}
