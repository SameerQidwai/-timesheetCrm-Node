import { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import { LeaveRequestRepository } from '../repositories/leaveRequestRepository';

export class LeaveRequestController {
  async getLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(LeaveRequestRepository);

      const { user } = res.locals;
      let authId = parseInt(user.id) as number;

      let records = await repository.getOwnLeaveRequests(authId);
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
      let authId = parseInt(user.id) as number;
      let startDate = req.query.startDate as string;
      let endDate = req.query.endDate as string;
      let userId = parseInt(req.params.userId) as number;
      let workId = parseInt(req.params.workId) as number;

      let records = await repository.getManageLeaveRequests(
        authId,
        startDate,
        endDate,
        userId,
        workId
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
      let authId = parseInt(user.id) as number;

      let record = await repository.addLeaveRequest(authId, req.body);
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
      let authId = parseInt(user.id) as number;

      let records: any = [];
      // console.log(req.body);

      let requestEntries = req.body.leaveRequests;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not found');
      }

      records = await repository.approveAnyLeaveRequest(authId, requestEntries);

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
      let authId = parseInt(user.id) as number;

      let records: any = [];
      // console.log(req.body);

      let requestEntries = req.body.leaveRequests;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not found');
      }

      records = await repository.rejectAnyLeaveRequest(authId, requestEntries);

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
      let authId = parseInt(user.id) as number;

      let records = await repository.editLeaveRequest(
        authId,
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

  async getLeaveRequestBalances(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const repository = getCustomRepository(LeaveRequestRepository);

      const { user } = res.locals;
      let authId = parseInt(user.id) as number;

      let records = await repository.getLeaveRequestBalances(authId);
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
}
