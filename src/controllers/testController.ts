import { Request, Response, NextFunction } from 'express';
import { getManager } from 'typeorm';
import xlsx from 'xlsx';
import moment from 'moment';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Milestone } from '../entities/milestone';
import { dispatchMail } from '../utilities/mailer';
import { Timesheet } from '../entities/timesheet';
import { Employee } from '../entities/employee';
import { WelcomeMail } from '../mails/welcomeMail';
import { ResetPasswordMail } from '../mails/resetPasswordMail';
import { FinancialYear } from '../entities/financialYear';

export class TestController {
  async test(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();

      let year = await manager.findOne(FinancialYear, {});
      if (year) {
        year.endDate = moment('2024-01-01').toDate();

        await manager.save(year);
      }
      res.status(200).json({
        success: true,
        message: 'Hello',
        data: year,
      });
    } catch (e) {
      next(e);
    }
  }

  async testMailFunction(req: Request, res: Response, next: NextFunction) {
    let token = req.query.token as string;
    let email = req.query.email as string;

    let user = {
      username: 'Shahzaib Ahmed',
      email: email != '' ? email : 'shahzaibahmed.98@hotmail.com',
    };

    if (token !== 'thisisrandomstring') {
      return res.status(200).json({
        success: true,
        message: 'Hi',
        data: [],
      });
    }

    dispatchMail(new ResetPasswordMail(user.username, 'abcdefg'), user);
    dispatchMail(new WelcomeMail(user.username, user.email, '123123'), user);

    return res.status(200).json({
      success: true,
      message: 'Mail sent',
      data: [],
    });
  }

  async uploadTimesheetFunction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let manager = getManager();
    // let userId = parseInt(req.body.employeeId);
    let userId = 1;
    // let milestoneId = parseInt(req.body.milestoneId);
    let milestoneId = 2;

    if (isNaN(userId)) {
      throw new Error('Unknown employee ID');
    }

    if (isNaN(milestoneId)) {
      throw new Error('Unknown milestone ID');
    }

    let workbook = xlsx.read(req.file.buffer, {
      cellDates: true,
    });

    let jsonData: { Date: string; Hours: 'string'; Notes: string }[] =
      xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        raw: false,
        dateNF: 'dd/mm/yyyy',
      });

    for (let jsonEntry of jsonData) {
      if (parseInt(jsonEntry.Hours) === 0) continue;

      let currentDate = moment(jsonEntry.Date, 'DD/MM/YYYY', true);

      let startDate = currentDate.clone().startOf('month').startOf('day');
      let endDate = currentDate.clone().endOf('month').startOf('day');

      let cStartDate = startDate.format('YYYY-MM-DD HH:mm:ss');
      let cEndDate = endDate.format('YYYY-MM-DD HH:mm:ss');

      console.log({
        currentDate,
        startDate,
        endDate,
        cStartDate,
        cEndDate,
      });

      await manager.transaction(async (transactionalEntityManager) => {
        let timesheet: Timesheet | undefined;
        let milestoneEntry: TimesheetMilestoneEntry | undefined;

        timesheet = await manager.findOne(Timesheet, {
          where: {
            startDate: cStartDate,
            endDate: cEndDate,
            employeeId: userId,
          },
        });

        if (!timesheet) {
          timesheet = new Timesheet();

          timesheet.startDate = startDate.toDate();
          timesheet.endDate = endDate.toDate();
          timesheet.employeeId = userId;

          timesheet = await transactionalEntityManager.save(timesheet);
        }

        let employee = await transactionalEntityManager.findOne(
          Employee,
          userId,
          {
            relations: ['contactPersonOrganization'],
          }
        );

        if (!employee) {
          throw new Error('Employee not found');
        }

        let milestone = await transactionalEntityManager.findOne(
          Milestone,
          milestoneId,
          {
            relations: [
              'opportunityResources',
              'opportunityResources.opportunityResourceAllocations',
            ],
          }
        );

        if (!milestone) {
          throw new Error('Milestone not found');
        }

        milestoneEntry = await manager.findOne(TimesheetMilestoneEntry, {
          where: {
            milestoneId: milestone.id,
            timesheetId: timesheet.id,
          },
        });

        if (!milestoneEntry) {
          milestoneEntry = new TimesheetMilestoneEntry();

          milestoneEntry.timesheetId = timesheet.id;
          milestoneEntry.milestoneId = milestone.id;

          milestoneEntry = await transactionalEntityManager.save(
            milestoneEntry
          );
        }

        // for (let resource of milestone.opportunityResources) {
        //   if (resource.milestoneId == milestone.id) {
        //     for (let allocation of resource.opportunityResourceAllocations) {
        //       if (
        //         allocation.contactPersonId ==
        //         employee.contactPersonOrganization.contactPersonId
        //       ) {
        //         this._validateEntryDates(
        //           currentDate.toDate(),
        //           resource,
        //           timesheet
        //         );
        //       }
        //     }
        //   }
        // }

        let entry = new TimesheetEntry();

        entry.milestoneEntryId = milestoneEntry.id;

        entry.hours = parseInt(jsonEntry.Hours);

        entry.breakHours = 0;

        entry.date = currentDate.format('DD-MM-YYYY');

        let entryStartTime = currentDate.startOf('day').add(9, 'hours');

        entry.startTime = entryStartTime.format('HH:mm');

        entry.endTime = entryStartTime
          .add(parseInt(jsonEntry.Hours), 'hours')
          .format('HH:mm');

        await transactionalEntityManager.save(entry);
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data',
      data: jsonData,
    });
  }
}
