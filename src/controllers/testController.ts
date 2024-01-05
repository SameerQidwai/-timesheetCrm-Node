import { Request, Response, NextFunction } from 'express';
import { getManager, In } from 'typeorm';
import xlsx from 'xlsx';
import moment from 'moment-timezone';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Milestone } from '../entities/milestone';
import { dispatchMail } from '../utilities/mailer';
import { Timesheet } from '../entities/timesheet';
import { Employee } from '../entities/employee';
import { WelcomeMail } from '../mails/welcomeMail';
import { ResetPasswordMail } from '../mails/resetPasswordMail';
import { FinancialYear } from '../entities/financialYear';
import { exec } from 'child_process';
import { Notification } from '../entities/notification';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class TestController {
  async test(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();

      // exec('node fakeWriter.ts');
      // const { exec } = require("child_process");

      exec('ts-node src/financialYearLocker.ts', (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });

      res.status(200).json({
        success: true,
        message: 'Hello',
        data: [],
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

      let cStartDate = startDate.format('YYYY-MM-DD HH:mm:ss.SSS');
      let cEndDate = endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss.SSS');

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

  async createDummyNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let title = (req.query.title ?? 'Dummy Title') as string;
      let content = (req.query.event ??
        'This is Dummy Content about the Timesheet Approval Notification') as string;
      let type = parseInt((req.query.type ?? 1) as string);
      type = isNaN(type) ? 1 : type;
      let event = (req.query.event ?? 'timesheet.approve') as string;

      const manager = getManager();

      const notification = manager.create(Notification, {
        title,
        content,
        type: 1,
        notifiableId: 1,
        url: `/time-sheet/`,
        event,
      });

      await manager.save(notification);

      res.status(200).json({
        success: true,
        message: 'Notification created',
        data: notification,
      });
    } catch (e) {
      next(e);
    }
  }

  async createDummyPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const TOP_MARGIN = 20;
      const RIGHT_MARGIN = 10;
      const BOTTOM_MARGIN = 20;
      const LEFT_MARGIN = 10;
      const BORDER_COLOR = '#f0f0f0';
      const BACKGROUND_COLOR = '#fafafa';
      const WHITE_COLOR = '#ffffff';
      const PAGE_WIDTH = 595.28;
      const PAGE_HEIGHT = 841.89;
      const manager = getManager();

      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: TOP_MARGIN,
          right: RIGHT_MARGIN,
          bottom: BOTTOM_MARGIN,
          left: LEFT_MARGIN,
        },
      });

      const generateTable = (
        doc: PDFKit.PDFDocument,
        rowCount: number,
        start: number,
        difference: number,
        columns: {
          width?: number;
          dataKey?: string;
        }[] = [],
        data: any = []
      ) => {
        let currentY = start;

        for (let i = 0; i < rowCount; i++) {
          var currentX = 25;
          for (let j = 0; j < columns.length; j++) {
            let column = columns[j];
            if (!column.width) continue;

            doc
              .rect(currentX, currentY, column.width, difference)
              .stroke(BORDER_COLOR);

            if (data?.milestone && column.dataKey) {
              doc.fontSize(8);
              doc.text(
                data.milestone.entries[i][column.dataKey] ?? '-',
                currentX,
                currentY + difference / 2,
                {
                  height: difference,
                  width: column.width,
                  align: 'center',
                  baseline: 'hanging',
                }
              );
            }

            currentX += column.width;
          }

          doc
            .polygon([25, currentY], [PAGE_WIDTH - 25, currentY])
            .stroke(BORDER_COLOR);

          currentY += difference;
        }
      };

      let milestoneEntries = await manager.find(TimesheetMilestoneEntry, {
        where: { id: In([472]) },
        relations: [
          'timesheet',
          'timesheet.employee',
          'timesheet.employee.contactPersonOrganization',
          'timesheet.employee.contactPersonOrganization.organization',
          'timesheet.employee.contactPersonOrganization.contactPerson',
          'milestone',
          'milestone.project',
          'milestone.project.organization',
          'milestone.project.organization.delegateContactPerson',
          'entries',
        ],
      });

      if (!milestoneEntries) {
        throw new Error('Milestone Entry not found');
      }

      //-- START OF MODIFIED RESPSONSE FOR FRONTEND

      interface Any {
        [key: string]: any;
      }

      let response: Any = [];

      milestoneEntries.forEach((milestoneEntry) => {
        let startDate = moment(
          milestoneEntry.timesheet.startDate,
          'DD-MM-YYYY'
        );
        let cStartDate = moment(
          milestoneEntry.timesheet.startDate,
          'DD-MM-YYYY'
        ).format('DD/MM/YYYY');
        let cEndDate = moment(
          milestoneEntry.timesheet.endDate,
          'DD-MM-YYYY'
        ).format('DD/MM/YYYY');

        let cMonthDays = moment(
          milestoneEntry.timesheet.startDate,
          'DD-MM-YYYY'
        ).daysInMonth();

        ``;

        let milestone: Any = {
          milestoneEntryId: milestoneEntry.id,
          milestoneId: milestoneEntry.milestoneId,
          name:
            milestoneEntry.milestone.project.type == 1
              ? `${milestoneEntry.milestone.project.title} - (${milestoneEntry.milestone.title})`
              : `${milestoneEntry.milestone.project.title}`,
          client: milestoneEntry.milestone.project.organization.name,
          contact:
            `${
              milestoneEntry.milestone.project.organization
                .delegateContactPerson?.firstName ?? '-'
            } ${
              milestoneEntry.milestone.project.organization
                .delegateContactPerson?.lastName ?? '-'
            }` ?? '-',
          notes: milestoneEntry.notes,
          totalHours: 0,
          invoicedDays: 0,
          hoursPerDay: milestoneEntry.milestone.project.hoursPerDay,
          entries: [],
        };

        for (let i = 1; i <= cMonthDays; i++) {
          let _flagFound = 0;
          let _foundEntry: TimesheetEntry | undefined;
          milestoneEntry.entries.map((entry: TimesheetEntry) => {
            if (parseInt(entry.date.substring(0, 2)) == i) {
              _flagFound = 1;
              _foundEntry = entry;
            }
          });
          if (_flagFound == 1 && _foundEntry != undefined) {
            milestone.totalHours += _foundEntry.hours;
            milestone.entries.push({
              entryId: _foundEntry.id,
              date: moment(_foundEntry.date, 'DD-MM-YYYY').format('D/M/Y'),
              day: moment(_foundEntry.date, 'DD-MM-YYYY').format('dddd'),
              startTime: moment(_foundEntry.startTime, 'HH:mm').format('HH:mm'),
              endTime: moment(_foundEntry.endTime, 'HH:mm').format('HH:mm'),
              breakHours: _foundEntry.breakHours,
              breakMinutes: _foundEntry.breakHours * 60,
              actualHours: _foundEntry.hours,
              notes: _foundEntry.notes,
            });
          } else {
            console.log(`${i}-${startDate.month()}-${startDate.year()}`);
            milestone.totalHours += 0;
            milestone.entries.push({
              entryId: '-',
              date: moment(
                `${i}-${startDate.month() + 1}-${startDate.year()}`,
                'DD-MM-YYYY'
              ).format('D/M/Y'),
              day: moment(
                `${i}-${startDate.month() + 1}-${startDate.year()}`,
                'DD-MM-YYYY'
              ).format('dddd'),
              startTime: '-',
              endTime: '-',
              breakHours: '-',
              breakMinutes: '-',
              actualHours: '-',
              notes: '-',
            });
          }
        }

        milestone.invoicedDays =
          milestone.totalHours / milestoneEntry.milestone.project.hoursPerDay;

        let entry = {
          id: milestoneEntry.id,
          project: milestoneEntry.milestone.project.title,
          company:
            milestoneEntry.timesheet.employee.contactPersonOrganization
              .organization.name,
          employee: `${milestoneEntry.timesheet.employee.contactPersonOrganization.contactPerson.firstName} ${milestoneEntry.timesheet.employee.contactPersonOrganization.contactPerson.lastName}`,
          period: `${cStartDate} - ${cEndDate}`,
          notes: milestoneEntry.timesheet.notes,
          milestone: milestone,
        };

        response.push(entry);
      });

      doc.pipe(
        fs.createWriteStream(
          path.join(__dirname, '../../public/downloads/dummy.pdf')
        )
      );

      // write to PDF
      // doc.pipe(res); // HTTP response

      let car: PDFKit.Mixins.TextOptions;
      doc.fontSize(25);
      doc.text(`Timesheet`, 25, 30);

      // doc.image(
      //   'C:/Users/Shahzaib/Desktop/TimesheetPdf/z-cp-logo.png',
      //   PAGE_WIDTH - 180,
      //   25,
      //   { width: 150 }
      // );

      //-- TOP SECTION
      //* CURRENT HEIGHT 0

      doc.rect(25, 75, PAGE_WIDTH - 50, 80).stroke(BORDER_COLOR);
      // doc.rect(25.5, 75.5, 120, 19).fill(BACKGROUND_COLOR);
      // doc.rect(280, 75.5, 120, 19).fill(BACKGROUND_COLOR);
      // doc.rect(25.5, 135, 120, 19).fill(BACKGROUND_COLOR);
      // doc.rect(280, 135, 120, 19).fill(BACKGROUND_COLOR);

      //* CURRENT HEIGHT 45
      generateTable(doc, 3, 95, 20);

      doc.fontSize(12);
      doc.text(`Company`, 30, 80);
      doc.text(`Employee`, 285, 80);
      doc.text(`Client`, 30, 100);
      doc.text(`Project`, 30, 120);
      doc.text(`Client Contact`, 30, 140);
      doc.text(`Timesheet Period`, 285, 140);

      //-- CENTER TABLE
      //* CURRENT HEIGHT 125
      doc.rect(25, 180, PAGE_WIDTH - 50, 530).stroke(BORDER_COLOR);

      doc.rect(25, 180, 50, 50).stroke(BORDER_COLOR);
      doc.rect(75, 180, 50, 50).stroke(BORDER_COLOR);
      doc.rect(125, 180, 70, 50).stroke(BORDER_COLOR);
      doc.rect(125, 205, 35, 25).stroke(BORDER_COLOR);
      doc.rect(160, 205, 35, 25).stroke(BORDER_COLOR);
      doc.rect(195, 180, 35, 50).stroke(BORDER_COLOR);
      doc.rect(230, 180, 35, 50).stroke(BORDER_COLOR);
      doc.rect(265, 180, 305, 50).stroke(BORDER_COLOR);

      doc.fontSize(10);
      doc.text(`Date`, 30, 150);

      //* CURRENT HEIGHT 150
      generateTable(
        doc,
        response[0].milestone.entries.length,
        230,
        16,
        [
          { width: 50, dataKey: 'date' },
          { width: 50, dataKey: 'day' },
          { width: 35, dataKey: 'startTime' },
          { width: 35, dataKey: 'endTime' },
          { width: 35, dataKey: 'breakMinutes' },
          { width: 35, dataKey: 'actualHours' },
          { width: 305, dataKey: 'notes' },
        ],
        response[0]
      );

      //-- SUM ROW
      //* CURRENT HEIGHT 750
      generateTable(doc, 1, 740, 20, [
        { width: 100 },
        { width: 82 },
        { width: 100 },
        { width: 82 },
        { width: 100 },
        { width: 82 },
      ]);
      // doc.rect(25, 760, PAGE_WIDTH - 50, 20).stroke(BORDER_COLOR);
      // doc.rect(25.5, 760.5, 80, 19).fill(BACKGROUND_COLOR);
      // doc.rect(225, 760.5, 80, 19).fill(BACKGROUND_COLOR);
      // doc.rect(425, 760.5, 80, 19).fill(BACKGROUND_COLOR);

      //-- SIGNATURE ROW
      //* CURRENT HEIGHT 780

      doc
        .rect(25, 780, (PAGE_WIDTH - 50) / 2 - 40, 20)
        .fillAndStroke(BACKGROUND_COLOR, BORDER_COLOR);

      doc
        .rect((PAGE_WIDTH - 50) / 2 + 40, 780, 257, 20)
        .fillAndStroke(BACKGROUND_COLOR, BORDER_COLOR);

      //* CURRENT HEIGHT 795
      // finalize the PDF and end the stream
      doc.end();

      // doc.pipe(res);

      return res.status(200).json({
        success: true,
        message: 'Notification created',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
