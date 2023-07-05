import {
  Between,
  EntityManager,
  EntityRepository,
  In,
  LessThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { FinancialYear } from '../entities/financialYear';
import { FinancialYearDTO } from '../dto';
import moment from 'moment-timezone';
import { Moment } from 'moment';
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
import { exec, spawn } from 'child_process';
import { ExpenseSheetExpense } from '../entities/expenseSheetExpense';

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
    let { label } = financialYearDTO;

    const startDate = moment(financialYearDTO.startDate).startOf('day');
    const endDate = moment(financialYearDTO.endDate).endOf('day');

    await this._validateCreateFinancialYearDates(startDate, endDate);

    let year = new FinancialYear();

    console.log(
      '🚀 ~ file: financialYearRepository.ts:52 ~ startDate:',
      startDate
    );
    console.log('🚀 ~ file: financialYearRepository.ts:54 ~ endDate:', endDate);

    console.log(
      '🚀 ~ file: financialYearRepository.ts:52 ~ startDate:',
      startDate.toDate()
    );
    console.log(
      '🚀 ~ file: financialYearRepository.ts:54 ~ endDate:',
      endDate.toDate()
    );

    year.label = label;
    year.startDate = startDate.toDate();
    year.endDate = endDate.set('milliseconds', 0).toDate();

    // return 'hi';
    return this.save(year);
  }

  async findOneCustom(id: number): Promise<FinancialYear> {
    let year = await this.findOne(id);

    if (!year) {
      throw new Error('Financial year not found');
    }

    return year;
  }

  async updateOne(
    financialYearDTO: FinancialYearDTO,
    userId: number,
    id: number
  ): Promise<any> {
    let year = await this.findOne(id);

    if (!year) {
      throw new Error('Financial year not found');
    }

    if (year.closed) {
      throw new Error('Closed year cannot be updated');
    }

    const startDate = moment(financialYearDTO.startDate).startOf('day');
    const endDate = moment(financialYearDTO.endDate).endOf('day');

    await this._validateUpdateFinancialYearDates(startDate, endDate, year);

    year.label = financialYearDTO.label;
    year.startDate = startDate.toDate();
    year.endDate = endDate.toDate();
    return this.save(year);
  }

  async deleteCustom(userId: number, id: number): Promise<any> {
    let year = await this.findOne(id);

    if (!year) {
      throw new Error('Financial year not found');
    }

    if (year.closed) {
      throw new Error('Cannot delete closed year');
    }

    let years = await this.find({ order: { endDate: 'DESC' } });

    if (years[0].id != year.id) {
      throw new Error('Cannot delete any year other than last year');
    }

    return this.remove(year);
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

        year.closing = true;
        year.closedBy = userId;

        await trx.save(year);

        let child_process = spawn('ts-node src/financialYearLocker.ts', [], {
          shell: true,
        });

        child_process.stdout.on('data', function (data) {
          console.log('stdout: ' + data);
        });

        child_process.stderr.on('data', function (data) {
          console.log('stderr: ' + data);

          //     let year = await this.findOne({
          //       where: { closing: true },
          //     });

          //     if (year) {
          //       year.closing = false;
          //       (year.closedBy as any) = null;

          //       await this.save(year);

          //       console.log('Rolled back in repository');
        });

        child_process.on('close', function (code) {
          console.log('child process exited with code ' + code);
        });
        // exec(
        //   'ts-node src/financialYearLocker.ts',
        //   async (error, stdout, stderr) => {
        //     if (error) {
        //       console.log(`error: ${error.message}`);
        //       return;
        //     }
        //     if (stderr) {
        //       console.log(`stderr: ${stderr}`);
        //       return;
        //     }
        //     console.log(`stdout: ${stdout}`);

        //     let year = await this.findOne({
        //       where: { closing: true },
        //     });

        //     if (year) {
        //       year.closing = false;
        //       (year.closedBy as any) = null;

        //       await this.save(year);

        //       console.log('Rolled back in repository');
        //     }
        //   }
        // );

        return true;
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

  async revertYear(id: number): Promise<any> {
    if (!id) throw new Error('Year not found');

    return await this.manager.transaction(async (trx) => {
      let year = await this.findOne(id);

      if (!year) throw new Error('Year not found');

      let allYears = await this.find({
        where: { closed: true },
        order: { startDate: 'DESC' },
      });

      if (allYears.length && allYears[0].id !== year.id)
        throw new Error('Cannot revert this year');

      if (!year.closed) throw new Error('Year is not closed');

      var systemLock = await this.manager.findOne(GlobalSetting, {
        where: { keyLabel: 'systemLock' },
      });

      if (!systemLock) {
        throw new Error('Something went wrong');
      }

      systemLock.keyValue = '1';

      await trx.save(systemLock);

      year.closing = true;

      await trx.save(year);

      let child_process = spawn('ts-node src/databaseReverter.ts', [], {
        shell: true,
      });

      child_process.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
      });

      child_process.stderr.on('data', function (data) {
        console.log('stderr: ' + data);

        //     let year = await this.findOne({
        //       where: { closing: true },
        //     });

        //     if (year) {
        //       year.closing = false;
        //       (year.closedBy as any) = null;

        //       await this.save(year);

        //       console.log('Rolled back in repository');
      });

      child_process.on('close', function (code) {
        console.log('child process exited with code ' + code);
      });
    });
  }

  async _validateCreateFinancialYearDates(startDate: Moment, endDate: Moment) {
    let years = await this.find({
      order: { endDate: 'DESC' },
    });
    let lastClosedFinancialYear = await this.findOne({
      order: { endDate: 'DESC' },
      where: { closed: true },
    });

    if (lastClosedFinancialYear) {
      if (moment(lastClosedFinancialYear.endDate).isAfter(startDate, 'date')) {
        throw new Error('Cannot create year before last closed year');
      }
    }

    if (startDate.isSameOrAfter(endDate)) {
      throw new Error('Incorrect date range');
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

    return true;
  }

  async _validateUpdateFinancialYearDates(
    startDate: Moment,
    endDate: Moment,
    updateYear: FinancialYear
  ) {
    // let updateYearStart = moment(updateYear.startDate);
    // let updateYearEnd = moment(updateYear.endDate);

    let years = await this.find({
      order: { endDate: 'DESC' },
    });

    let lastClosedFinancialYear = await this.findOne({
      order: { endDate: 'DESC' },
      where: { closed: true },
    });

    let previousYear: FinancialYear | null = null;
    let nextYear: FinancialYear | null = null;
    let index = 0;

    if (startDate.isSameOrAfter(endDate)) {
      throw new Error('Incorrect date range');
    }

    if (lastClosedFinancialYear) {
      if (moment(lastClosedFinancialYear.endDate).isAfter(startDate, 'date')) {
        throw new Error('Cannot create year before last closed year');
      }
    }

    for (let loopYear of years) {
      if (loopYear.id === updateYear.id) {
        if (index != 0) nextYear = years[index - 1];

        if (index != years.length - 1) previousYear = years[index + 1];
      }

      index++;
    }

    if (
      previousYear &&
      previousYear.closed &&
      !startDate.isSame(updateYear.startDate)
    ) {
      throw new Error('Cannot change start date when previous year is locked');
    }

    for (let loopedYear of years) {
      if (loopedYear.id == updateYear.id) continue;

      if (previousYear && previousYear.id == loopedYear.id) continue;

      if (nextYear && nextYear.id == loopedYear.id) continue;

      // let loopedStartDate = moment(loopedYear.startDate);
      // let loopedEndDate = moment(loopedYear.endDate);

      if (
        startDate.isBetween(
          loopedYear.startDate,
          loopedYear.endDate,
          'date',
          '[]'
        ) ||
        endDate.isBetween(
          loopedYear.startDate,
          loopedYear.endDate,
          'date',
          '[]'
        )
      ) {
        throw new Error('Cannot over lap date');
      }
    }

    if (previousYear) {
      if (
        startDate.isBetween(
          previousYear.startDate,
          previousYear.endDate,
          'date',
          '[]'
        )
      ) {
        if (moment(previousYear.startDate).add(30, 'days').isAfter(startDate)) {
          throw new Error('Span of financial year can be minimum of 30 days');
        }
        previousYear.endDate = startDate
          .clone()
          .subtract(1, 'day')
          .endOf('day')
          .toDate();
      }
    }

    if (nextYear) {
      if (
        endDate.isBetween(nextYear.startDate, nextYear.endDate, 'date', '[]')
      ) {
        if (moment(nextYear.endDate).subtract(30, 'days').isBefore(endDate)) {
          throw new Error('Span of financial year can be minimum of 30 days');
        }
        nextYear.startDate = endDate
          .clone()
          .add(1, 'day')
          .startOf('day')
          .toDate();
      }
    }

    if (
      startDate.isBetween(
        updateYear.startDate,
        updateYear.endDate,
        'date',
        '[]'
      )
    ) {
      if (previousYear) {
        previousYear.endDate = startDate
          .clone()
          .subtract(1, 'day')
          .endOf('day')
          .toDate();
      }
    }

    if (
      endDate.isBetween(updateYear.startDate, updateYear.endDate, 'date', '[]')
    ) {
      if (nextYear) {
        nextYear.startDate = endDate
          .clone()
          .add(1, 'day')
          .startOf('day')
          .toDate();
      }
    }

    if (previousYear) await this.save(previousYear);

    if (nextYear) await this.save(nextYear);

    return true;
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
              projectId: project.id,
              projectName: project.title,
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
    let loopedLeaveRequests: Array<number> = [];
    let leaveRequestsIndex: any = {};
    let leaveRequests: Array<LeaveRequest> = [];
    let newLeaveRequests: Array<LeaveRequest> = [];
    let deleteableEntries: Array<LeaveRequestEntry> = [];
    let yearStartDate = moment(year.startDate);
    let yearEndDate = moment(year.endDate);

    let responseLeaveRequests: any[] = [];

    let leaveRequestEntries = await trx.find(LeaveRequestEntry, {
      where: { date: MoreThanOrEqual(year.startDate) },
      order: { date: 'ASC' },
      relations: ['leaveRequest'],
    });

    for (let entry of leaveRequestEntries) {
      let momentEntryDate = moment(entry.date);

      let leaveRequestId = entry.leaveRequestId;
      let leaveRequest: LeaveRequest;
      //FOUND
      if (loopedLeaveRequests.includes(leaveRequestId)) {
        leaveRequest = leaveRequests[leaveRequestsIndex[leaveRequestId]];
        delete (entry as any).leaveRequest;
        delete (entry as any).leaveRequestId;

        (leaveRequest as any).endDate = momentEntryDate.format('YYYY-MM-DD');

        if (momentEntryDate.isAfter(yearEndDate, 'date')) {
          (leaveRequest as any).inNextYear = true;
          if ((leaveRequest as any).inClosedYear) {
            (leaveRequest as any).futureEntries.push(entry);
            deleteableEntries.push(entry);
          }
        } else if (
          momentEntryDate.isBetween(yearStartDate, yearEndDate, 'date', '[]')
        ) {
          (leaveRequest as any).inClosedYear = true;
        }
        leaveRequests[leaveRequestsIndex[leaveRequestId]] = leaveRequest;
        continue;
      }

      //NOT FOUND
      leaveRequest = entry.leaveRequest;
      delete (entry as any).leaveRequest;
      delete (entry as any).leaveRequestId;
      loopedLeaveRequests.push(leaveRequestId);
      leaveRequestsIndex[leaveRequestId] = leaveRequests.length;
      (leaveRequest as any).inClosedYear = false;
      (leaveRequest as any).inNextYear = false;
      (leaveRequest as any).startDate = momentEntryDate.format('YYYY-MM-DD');
      (leaveRequest as any).futureEntries = [];

      if (momentEntryDate.isAfter(yearEndDate, 'year')) {
        (leaveRequest as any).inNextYear = true;
        // (leaveRequest as any).futureEntries.push(entry);
        // deleteableEntries.push(entry);
      } else if (
        momentEntryDate.isBetween(yearStartDate, yearEndDate, 'date', '[]')
      ) {
        (leaveRequest as any).inClosedYear = true;
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
          startDate: (leaveRequest as any).startDate,
          endDate: (leaveRequest as any).endDate,
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
          startDate: (leaveRequest as any).startDate,
          endDate: (leaveRequest as any).endDate,
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

    for (let timesheet of timesheets) {
      for (let milestoneEntry of timesheet.milestoneEntries) {
        const timesheetStatus = timesheet.getStatus;

        if (
          timesheetStatus !== TimesheetStatus.SUBMITTED &&
          timesheetStatus !== TimesheetStatus.SAVED
        )
          continue;

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
      }
    }

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
    let expenses = await this.manager.find(ExpenseSheetExpense, {
      where: {
        submittedAt: Between(year.startDate, year.endDate),
      },
      relations: ['sheet', 'expense'],
    });

    let expenseSheets = await this.manager.find(ExpenseSheet, {
      relations: ['expenseSheetExpenses', 'expenseSheetExpenses.expense'],
    });
    let savingExpenses: ExpenseSheetExpense[] = [];

    let EXPENSESHEET_PICKER: { [key: number]: ExpenseSheet } = {};

    for (let expenseSheet of expenseSheets) {
      EXPENSESHEET_PICKER[expenseSheet.id] = expenseSheet;
    }

    let loopedExpenseSheets: number[] = [];

    let responseExpenseSheets: any[] = [];

    for (let expense of expenses) {
      const currentExpenseSheet = expense.sheet;
      currentExpenseSheet.expenseSheetExpenses =
        EXPENSESHEET_PICKER[currentExpenseSheet.id].expenseSheetExpenses;

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
        status: currentExpenseSheet.getStatus,
      });

      if (!expense.rejectedAt && !expense.approvedAt) {
        expense.rejectedAt = moment().toDate();
        expense.rejectedBy = userId;
        expense.expense.notes = `${expense.expense.notes} -
          Systematically Rejected because of Year closing`;
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
      let contractEndDate;
      if (contract.endDate) contractEndDate = moment(contract.endDate);
      else contractEndDate = moment().add(10, 'year');

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
