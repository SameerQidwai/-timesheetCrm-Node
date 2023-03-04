import { Request, Response, NextFunction } from 'express';
import { BankAccount } from '../entities/bankAccount';
import { getManager, LessThan, LessThanOrEqual, MoreThan } from 'typeorm';
import { File } from '../entities/file';
import { Comment } from '../entities/comment';
import { Lease } from '../entities/lease';
import { LeaveRequest } from '../entities/leaveRequest';
import { PurchaseOrder } from '../entities/purchaseOrder';
import { EmploymentContract } from '../entities/employmentContract';
import { getRandomInt } from '../utilities/helpers';
import { Attachment } from '../entities/attachment';
import { ContactPersonOrganization } from '../entities/contactPersonOrganization';
import { Opportunity } from '../entities/opportunity';
import { EntityType } from '../constants/constants';
import { TimesheetMilestoneEntry } from '../entities/timesheetMilestoneEntry';
import { TimesheetEntry } from '../entities/timesheetEntry';
import { Milestone } from '../entities/milestone';
import { OpportunityResource } from '../entities/opportunityResource';
import { OpportunityResourceAllocation } from '../entities/opportunityResourceAllocation';
import { LeaveRequestEntry } from '../entities/leaveRequestEntry';
import { sendMail } from '../utilities/mailer';

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
    let user = {
      username: 'Shahzaib Ahmed',
      email: 'shahzaibahmed.98@hotmail.com',
    };

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

    res.status(200).json({
      success: true,
      message: 'Mail sent',
      data: [],
    });
  }
}
