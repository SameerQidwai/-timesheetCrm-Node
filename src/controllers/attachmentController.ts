import { Request, Response, NextFunction } from 'express';
import { AttachmentRepository } from './../repositories/attachmentRepository';
import { getCustomRepository } from 'typeorm';
import { EntityType } from '../constants/constants';

export class AttachmentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(AttachmentRepository);
      let userId = res.locals.jwtPayload.id;
      let type: EntityType = req.params.type as EntityType;
      let response: string = await repository.createAndSave(
        {
          files: req.body.files,
          targetType: type,
          target: parseInt(req.params.id),
        },
        userId
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Attachment Saved Successfully',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(AttachmentRepository);

      let type: EntityType = req.params.type as EntityType;
      let response: string = await repository.getTargetAttachments(
        type,
        parseInt(req.params.id)
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Get Target Attachments',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const repository = getCustomRepository(AttachmentRepository);

      let response: string = await repository.deleteAttachment(
        parseInt(req.params.id)
      );

      // if no timesheet found
      return res.status(200).json({
        success: true,
        // message: `Win Opportunity ${req.params.id}`,
        message: 'Target Attachment Deleted',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
