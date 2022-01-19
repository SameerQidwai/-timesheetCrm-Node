import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { LeaveRequestRepository } from '../repositories/leaveRequestRepository';

export class LeaveRequestController {
  async getLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(LeaveRequestRepository);

      const { user } = res.locals;
      let userId = parseInt(user.id) as number;

      let records = await repository.getOwnLeaveRequests(userId);
      console.log('record: ', records);
      res.status(200).json({
        success: true,
        message: 'Leave Requests Index',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async addLeaveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(LeaveRequestRepository);

      const { user } = res.locals;
      let userId = parseInt(user.id) as number;

      let record = await repository.addLeaveRequest(userId, req.body);
      console.log('record: ', record);
      res.status(200).json({
        success: true,
        message: 'Leave Request Created Successfully',
        data: record,
      });
    } catch (e) {
      next(e);
    }
  }

  async approveLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(LeaveRequestRepository);

      const { user } = res.locals;
      let userId = parseInt(user.id) as number;

      let records: any = [];
      // console.log(req.body);

      let requestEntries = req.body.leaveRequests;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not found');
      }

      records = await repository.approveAnyLeaveRequest(userId, requestEntries);

      console.log('record: ', records);
      res.status(200).json({
        success: true,
        message: 'Timesheet Approved',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async rejectLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(LeaveRequestRepository);

      const { user } = res.locals;
      let userId = parseInt(user.id) as number;

      let records: any = [];
      // console.log(req.body);

      let requestEntries = req.body.leaveRequests;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not found');
      }

      records = await repository.rejectAnyLeaveRequest(userId, requestEntries);

      console.log('record: ', records);
      res.status(200).json({
        success: true,
        message: 'Timesheet Reject',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
