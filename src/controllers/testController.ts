import { Request, Response, NextFunction } from 'express';
import { getManager } from 'typeorm';
import xlsx from 'xlsx';
import moment from 'moment';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Milestone } from '../entities/milestone';
import { sendMail } from '../utilities/mailer';
import { Timesheet } from '../entities/timesheet';
import { Employee } from '../entities/employee';

export class TestController {
  async test(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let connection = manager.connection;

      let columns: any = {};

      const ignoreColumns: Array<string> = [
        'id',
        'created_at',
        'updated_at',
        'deleted_at',
      ];

      const ignoreTables: Array<string> = [
        '_view',
        '_metadata',
        'typeorm',
        'db_',
        'system_',
      ];

      const regex = new RegExp(ignoreTables.join('|'));

      let dbTableNames = await manager.query(`SHOW TABLES`);

      let tableNames: string[] = [];

      dbTableNames.forEach((table: any) => {
        tableNames.push(table.Tables_in_onelm);
      });

      for (let table of tableNames) {
        if (regex.test(table)) continue;
        // let dbColumns = await manager.query(`DESCRIBE ${table}`);

        let dbColumns = connection.getMetadata(table).ownColumns;

        columns[table] = {};

        for (let column of dbColumns) {
          if (ignoreColumns.includes(column.databaseName)) continue;
          columns[table][column.databaseName] = {
            databaseName: column.databaseName,
            typeOrmName: column.propertyName,
          };
        }
      }

      res.status(200).json({
        success: true,
        message: 'Hello',
        data: columns,
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

    try {
      sendMail(
        process.env.MAILER_ADDRESS,
        user,
        `Invitation to ${process.env.ORGANIZATION}`,
        `Hello,
You have been invited to ${process.env.ORGANIZATION}. 
Your registered account password is 123123123. Please visit ${process.env.ENV_URL} to login.
        
Regards,
${process.env.ORGANIZATION} Support Team`
      );
    } catch (e) {
      console.log(e);
    }

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
