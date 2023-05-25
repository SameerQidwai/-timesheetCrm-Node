import {
  Between,
  EntityManager,
  In,
  MoreThanOrEqual,
  createConnection,
} from 'typeorm';
import { getManager } from 'typeorm';
import { Opportunity } from './entities/opportunity';
import { Employee } from './entities/employee';
import { GlobalSetting } from './entities/globalSetting';
import { FinancialYear } from './entities/financialYear';
import { parseGlobalSetting } from './utilities/helpers';
import moment from 'moment';
import { Milestone } from './entities/milestone';
import {
  LeaveRequestStatus,
  ProjectType,
  TimesheetEntryStatus,
} from './constants/constants';
import { LeaveRequest } from './entities/leaveRequest';
import { LeaveRequestEntry } from './entities/leaveRequestEntry';
import { LeaveRequestBalance } from './entities/leaveRequestBalance';
import { Timesheet } from './entities/timesheet';
import { Expense } from './entities/expense';
import { ExpenseSheet } from './entities/expenseSheet';
import { EmploymentContract } from './entities/employmentContract';

const connection = createConnection();

let execution = async () => {
  const manager = getManager();
  const confirmFlag = true;

  await manager.transaction(async (trx) => {
    let year = await manager.findOne(FinancialYear, {
      where: { closing: true },
    });

    if (!year) throw new Error('Nothing to close');

    const userId = year.closedBy;

    let forceStatusChangeFlag = false;

    let GLOBAL_PROJECTS = await manager.find(Opportunity, {
      where: { status: In(['P', 'C']) },
      relations: ['milestones'],
    });

    let GLOBAL_EMPLOYEES = await manager.find(Employee, {
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
      var systemLock = await manager.findOne(GlobalSetting, {
        where: { keyLabel: 'systemLock' },
      });

      if (!systemLock) {
        throw new Error('Something went wrong');
      }

      systemLock.keyValue = '1';

      await trx.save(systemLock);
    }

    var forceStatusChange = await manager.findOne(GlobalSetting, {
      where: { keyLabel: 'forceStatusChange' },
    });

    if (forceStatusChange) {
      parseGlobalSetting(forceStatusChange)
        ? (forceStatusChangeFlag = true)
        : (forceStatusChangeFlag = false);
    }

    await _closeProjectsAndMilestones(year, trx, confirmFlag);

    await _closeLeaveRequests(
      year,
      userId,
      trx,
      confirmFlag,
      PICKERS,
      forceStatusChangeFlag
    );

    await _closeLeaveRequestBalances(trx, confirmFlag);

    await _closeTimesheets(
      year,
      userId,
      trx,
      confirmFlag,
      PICKERS,
      forceStatusChangeFlag
    );

    await _closeExpenseSheets(
      year,
      userId,
      trx,
      confirmFlag,
      PICKERS,
      forceStatusChangeFlag
    );

    await _closeEmploymentContracts(year, trx, PICKERS);

    if (confirmFlag) {
      year.closed = true;
      year.closedBy = userId;
      year.closedAt = moment().toDate();
      year.closing = false;

      if (!systemLock) {
        throw new Error('Something went wrong');
      }

      systemLock.keyValue = '0';

      await trx.save(systemLock);

      return trx.save(year);
    }
  });

  return true;
};

let _closeProjectsAndMilestones = async (
  year: FinancialYear,
  trx: EntityManager,
  confirmFlag = false
) => {
  //Closing same year projects
  let projects = await trx.find(Opportunity, {
    where: { status: In(['P', 'C']) },
    relations: ['milestones'],
  });

  let effectedProjects: Opportunity[] = [];
  let effectedMilestones: Milestone[] = [];

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
          milestoneEndDate.isBetween(year.startDate, year.endDate, 'date', '[]')
        ) {
          effectedMilestones.push(milestone);
        }
      }

    if (
      projectStartDate.isBetween(year.startDate, year.endDate, 'date', '[]') &&
      projectEndDate.isBetween(year.startDate, year.endDate, 'date', '[]')
    ) {
      project.phase = false;
      effectedProjects.push(project);
    }
  }

  if (confirmFlag) {
    await trx.save(effectedProjects);
    await trx.save(effectedMilestones);
  }

  return true;
};

let _closeLeaveRequests = async (
  year: FinancialYear,
  userId: number,
  trx: EntityManager,
  confirmFlag = false,
  { EMPLOYEE_PICKER, PROJECT_PICKER }: any,
  forceStatusChangeFlag: Boolean
) => {
  let loopedLeaveRequests: Array<number> = [];
  let leaveRequestsIndex: any = {};
  let leaveRequests: Array<LeaveRequest> = [];
  let newLeaveRequests: Array<LeaveRequest> = [];
  let deleteableEntries: Array<LeaveRequestEntry> = [];

  let leaveRequestEntries = await trx.find(LeaveRequestEntry, {
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

    if (momentEntryDate.isBetween(year.startDate, year.endDate, 'date', '[]')) {
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
      leaveRequest.rejectedAt = moment().toDate();
      leaveRequest.rejectedBy = userId;
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

  return true;
};

let _closeLeaveRequestBalances = async (
  trx: EntityManager,
  confirmFlag = false
) => {
  const leaveRequestBalances = await trx.find(LeaveRequestBalance);
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
};

let _closeTimesheets = async (
  year: FinancialYear,
  userId: number,
  trx: EntityManager,
  confirmFlag = false,
  { MILESTONE_PICKER, EMPLOYEE_PICKER }: any,
  forceStatusChangeFlag: Boolean
) => {
  let timesheets = await trx.find(Timesheet, {
    where: {
      startDate: Between(year.startDate, year.endDate),
      endDate: Between(year.startDate, year.endDate),
    },
    relations: ['milestoneEntries', 'milestoneEntries.entries'],
  });

  timesheets.forEach((timesheet) => {
    const timesheetStatus = timesheet.getStatus;

    timesheet.milestoneEntries.forEach((milestoneEntry) => {
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

  return true;
};

let _closeExpenseSheets = async (
  year: FinancialYear,
  userId: number,
  trx: EntityManager,
  confirmFlag = false,
  { EMPLOYEE_PICKER, PROJECT_PICKER }: any,
  forceStatusChangeFlag: Boolean
) => {
  let expenses = await trx.find(Expense, {
    where: {
      date: Between(year.startDate, year.endDate),
    },
    relations: ['entries'],
  });

  let expenseSheets = await trx.find(ExpenseSheet);
  let savingExpenses: Expense[] = [];

  let EXPENSESHEET_PICKER: { [key: number]: ExpenseSheet } = {};

  for (let expenseSheet of expenseSheets) {
    EXPENSESHEET_PICKER[expenseSheet.id] = expenseSheet;
  }

  let loopedExpenseSheets: number[] = [];

  for (let expense of expenses) {
    const expenseLastEntry = expense.entries[expense.entries.length - 1];
    const currentExpenseSheet =
      EXPENSESHEET_PICKER[expense?.expenseSheetId ?? expenseLastEntry.sheetId];

    if (loopedExpenseSheets.includes(currentExpenseSheet.id)) continue;

    loopedExpenseSheets.push(currentExpenseSheet.id);

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

  return true;
};

let _closeEmploymentContracts = async (
  year: FinancialYear,
  trx: EntityManager,
  { EMPLOYEE_PICKER }: any
) => {
  let contracts = await trx.find(EmploymentContract, {
    where: { startDate: Between(year.startDate, year.endDate) },
  });

  for (let contract of contracts) {
    let contractStartDate = moment(contract.startDate);
    let contractEndDate = moment(contract.endDate);

    let across = false;

    if (contractEndDate.isAfter(year.endDate)) {
      across = true;
    }
  }

  return true;
};

connection
  .then(async () => {
    await execution();

    console.log('EXITING');
    process.exit();
  })
  .catch(async (error) => {
    const manager = getManager();
    console.error('error in DB connection: ', error);
    let year = await manager.findOne(FinancialYear, {
      where: { closing: true },
    });

    if (year) {
      year.closing = false;
      (year.closedBy as any) = null;

      await manager.save(year);

      console.log('Rolled back');
    }
  });
