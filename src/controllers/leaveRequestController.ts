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
      const { grantLevel } = res.locals;

      let authId = parseInt(user.id) as number;
      let startDate = req.query.startDate as string;
      let endDate = req.query.endDate as string;
      let userId = req.query.userId as string;
      let workId = req.query.workId as string;
      let records: any = [];
      if (grantLevel.includes('ANY')) {
        records = await repository.getAnyLeaveRequests(
          authId,
          startDate,
          endDate,
          parseInt(userId),
          parseInt(workId)
        );
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.getManageLeaveRequests(
          authId,
          startDate,
          endDate,
          parseInt(userId),
          parseInt(workId)
        );
      }
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

      const { user } = res.locals;
      const { grantLevel } = res.locals;

      let authId = parseInt(user.id) as number;
      let requestId = parseInt(req.params.id) as number;

      let records: any = [];
      if (grantLevel.includes('ANY')) {
        records = await repository.getAnyLeaveRequest(requestId);
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.getManageLeaveRequest(authId, requestId);
      } else if (grantLevel.includes('OWN')) {
        records = await repository.getOwnLeaveRequest(authId, requestId);
      }

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
      const { grantLevel } = res.locals;
      let authId = parseInt(user.id) as number;

      let records: any = [];
      // console.log(req.body);

      let requestEntries = req.body.leaveRequests;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not found');
      }

      if (grantLevel.includes('ANY')) {
        records = await repository.approveAnyLeaveRequest(
          authId,
          requestEntries
        );
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.approveManageLeaveRequest(
          authId,
          requestEntries
        );
      }

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
      const { grantLevel } = res.locals;
      let authId = parseInt(user.id) as number;

      let records: any = [];
      // console.log(req.body);

      let requestEntries = req.body.leaveRequests;

      if (!requestEntries || requestEntries.length == 0) {
        throw new Error('Entries not found');
      }

      if (grantLevel.includes('ANY')) {
        records = await repository.rejectAnyLeaveRequest(
          authId,
          requestEntries
        );
      } else if (grantLevel.includes('MANAGE')) {
        records = await repository.rejectManageLeaveRequest(
          authId,
          requestEntries
        );
      }

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
