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

  async getApprovalLeaveRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(LeaveRequestRepository);

      const { user } = res.locals;
      let userId = parseInt(user.id) as number;
      let startDate = req.query.startDate as string;
      let endDate = req.query.endDate as string;
      let records = await repository.getManageLeaveRequests(
        userId,
        startDate,
        endDate
      );
      console.log('record: ', records);
      res.status(200).json({
        success: true,
        message: 'Leave Requests Approval Index',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }

  async getLeaveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(LeaveRequestRepository);

      let requestId = parseInt(req.params.id) as number;

      let records = await repository.getLeaveRequest(requestId);
      console.log('record: ', records);
      res.status(200).json({
        success: true,
        message: 'Leave Requests Show',
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

  async editLeaveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(LeaveRequestRepository);

      const { user } = res.locals;
      let requestId = parseInt(req.params.id) as number;
      let userId = parseInt(user.id) as number;

      let records = await repository.editLeaveRequest(
        userId,
        requestId,
        req.body
      );
      console.log('record: ', records);
      res.status(200).json({
        success: true,
        message: 'Edit Leave Request',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
