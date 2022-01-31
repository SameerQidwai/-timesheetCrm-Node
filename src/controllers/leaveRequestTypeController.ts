import { Request, Response, NextFunction } from 'express';
import { LeaveRequestType } from '../entities/leaveRequestType';
import { LeaveRequestTypeRepository } from '../repositories/leaveRequestTypeRepository';
import { BaseController } from './baseController';
import { getCustomRepository } from 'typeorm';

export class LeaveRequestTypeController extends BaseController<
  LeaveRequestType,
  LeaveRequestTypeRepository
> {
  async getByPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(LeaveRequestTypeRepository);

      const { user } = res.locals;
      let userId = parseInt(user.id) as number;

      let records = await repository.getActiveByPolicy(userId);
      console.log('record: ', records);
      res.status(200).json({
        success: true,
        message: 'Leave Request Type By Policy Index',
        data: records,
      });
    } catch (e) {
      next(e);
    }
  }
}
