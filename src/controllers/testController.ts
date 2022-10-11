import { Request, Response, NextFunction } from 'express';
import { BankAccount } from '../entities/bankAccount';
import { getManager } from 'typeorm';
import { File } from '../entities/file';
import { Comment } from '../entities/comment';
import { Lease } from '../entities/lease';
import { LeaveRequest } from '../entities/leaveRequest';
import { PurchaseOrder } from '../entities/purchaseOrder';
import { EmploymentContract } from '../entities/employmentContract';
import { getRandomInt } from '../utilities/helpers';
import { Attachment } from '../entities/attachment';
import { ContactPersonOrganization } from '../entities/contactPersonOrganization';

export class TestController {
  async test(req: Request, res: Response, next: NextFunction) {
    try {
      let manager = getManager();
      let data = await manager.find(ContactPersonOrganization, {});

      for (let entry of data) {
        entry.designation = '-';
        await manager.save(entry);
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
}
