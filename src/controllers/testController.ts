import { Request, Response, NextFunction, json } from 'express';
import { getManager, LessThanOrEqual } from 'typeorm';
import { Comment } from '../entities/comment';
import { LeaveRequest } from '../entities/leaveRequest';
import { PurchaseOrder } from '../entities/purchaseOrder';
import { getRandomInt } from '../utilities/helpers';
import { Attachment } from '../entities/attachment';
import { Opportunity } from '../entities/opportunity';
import { EntityType } from '../constants/constants';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Milestone } from '../entities/milestone';
import { OpportunityResource } from '../entities/opportunityResource';
import { OpportunityResourceAllocation } from '../entities/opportunityResourceAllocation';
import { LeaveRequestEntry } from '../entities/leaveRequestEntry';
import { sendMail } from '../utilities/mailer';
import xlsx from 'xlsx';
import moment from 'moment';
import { Timesheet } from '../entities/timesheet';
import { Employee } from '../entities/employee';

export class TestController {
  async test(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let data = await manager.find(Opportunity, {
        relations: [
          'purchaseOrders',
          'milestones',
          'milestones.opportunityResources',
          'milestones.opportunityResources.opportunityResourceAllocations',
          'milestones.timesheetMilestoneEntries',
          'milestones.timesheetMilestoneEntries.entries',
          'leaveRequests',
          'leaveRequests.entries',
        ],
        where: { id: LessThanOrEqual(28), status: 'P ' },
        withDeleted: true,
      });

      for (let entry of data) {
        for (let milestone of entry.milestones) {
          if (milestone.timesheetMilestoneEntries.length) {
            for (let tmentry of milestone.timesheetMilestoneEntries) {
              if (tmentry.entries.length)
                await manager.delete(TimesheetEntry, tmentry.entries);
            }
            await manager.delete(
              TimesheetMilestoneEntry,
              milestone.timesheetMilestoneEntries
            );
          }

          for (let position of milestone.opportunityResources) {
            if (position.opportunityResourceAllocations.length)
              await manager.delete(
                OpportunityResourceAllocation,
                position.opportunityResourceAllocations
              );
          }
          if (milestone.opportunityResources.length)
            await manager.delete(
              OpportunityResource,
              milestone.opportunityResources
            );
        }

        if (entry.milestones.length)
          await manager.delete(Milestone, entry.milestones);

        let attachments = await manager.find(Attachment, {
          where: { targetType: EntityType.WORK, targetId: entry.id },
        });

        let comments = await manager.find(Comment, {
          where: { targetType: EntityType.WORK, targetId: entry.id },
        });

        if (entry.purchaseOrders.length)
          await manager.delete(PurchaseOrder, entry.purchaseOrders);

        if (attachments.length) await manager.delete(Attachment, attachments);
        if (comments.length) await manager.delete(Comment, comments);

        if (entry.leaveRequests.length) {
          for (let leaveRequest of entry.leaveRequests) {
            if (leaveRequest.entries.length)
              await manager.delete(LeaveRequestEntry, leaveRequest.entries);
          }
        }
        console.log(entry.leaveRequests);
        if (entry.leaveRequests.length)
          await manager.delete(LeaveRequest, entry.leaveRequests);

        await manager.remove(Opportunity, entry);
      }

      res.status(200).json({
        success: true,
        message: 'Hello',
        data: data,
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
    let milestoneId = 1;

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
